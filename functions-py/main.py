from concurrent.futures import ThreadPoolExecutor, TimeoutError
import time
from urllib.parse import urlparse, urljoin
import requests
from bs4 import BeautifulSoup
import base64
from tiktoken import encoding_for_model

from firebase_admin import db
from firebase_admin import initialize_app
initialize_app(options={'databaseURL': 'https://sendittomyemail-4c3ca-default-rtdb.firebaseio.com'})

import functions_framework

from utils import extract_posts

# TODO: Add CORS filtering to only allow deployed functions to call this function
# May need to be done on the google cloud console under "invoker" permissions
@functions_framework.http
def extractPagesFromWebsite(req):
    '''
    Input: 
    A POST request that contains a blog url to scrape in the 'website' key
    
    Output:
    Realtime Database contains an entry under /websites with the following structure:
    - websites
        - website-urls
            - date-added
            - added-by
            - date-last-scraped
            - unprocessed-page-urls
                - url
                - raw-html
    
    '''
    # Step 1: get the website URL from the POST request
    if req.method == 'POST':
        data = req.get_json()
        if not "websiteToScrape" in data:
            raise Exception("'websiteToScrape' key not provided in the POST request")
    else:
        raise Exception("This function only accepts POST requests")

    website_url = data["websiteToScrape"]
    print("scrapeWebsite triggered with url:", website_url)
    encoded_website_url = extract_posts.encode_url_for_rtdb(data["websiteToScrape"])

    ref = db.reference('/')
    website_ref = ref.child('websites').child(encoded_website_url)

    # Step 1.5: Check if website already scraped. If so, return success early
    if website_ref.get() is not None:
        print("Website already scraped. Returning early")
        return "Success"

    # Step 2: Write initial entry to /websites
    website_ref.set({
        'url': website_url,
        'date-added': time.time(),
        'added-by': data['addedBy'],
    })
    
    # Step 3: Define recursive function to scrape website
    def scrape_website(website_url, depth_to_scrape=2):
        num_pages = 0

        print("Scraping", website_url, "with depth", depth_to_scrape, "...")
        
        def extract_links(url, existing_hrefs=set(), max_depth=4, depth=0):
            
            base_url = urlparse(url).scheme + "://" + urlparse(url).netloc
            try:
                response = requests.get(url)
                if response.status_code != 200:
                    headers = {
                        'User-Agent': 'sendittomyemail-bot'
                    }
                    response = requests.get(url, headers=headers)
            except Exception as e:
                print("Error getting", url, ":", e)
                print("Recursing upwards")
                return existing_hrefs
            
            if response.status_code == 200:
                # valid url, add to existing_hrefs
                existing_hrefs.add(url)

                # get page content and save to /websites for classification later on
                encoded_page_url = extract_posts.encode_url_for_rtdb(url)
                page_ref = website_ref.child('unprocessed-pages').child(encoded_page_url)
                page_ref.child("url").set(url)
                page_ref.child("raw-html").set(response.text)

                # counter for debugging purposes
                nonlocal num_pages
                num_pages += 1

                # if max_depth reached, pop outta here
                if(depth == max_depth):
                    return existing_hrefs
                
                # get links inside the page soup for further recursive madness
                soup = BeautifulSoup(response.content, 'html.parser')
                found_hrefs = set()
                for element in soup.find_all(href=True):
                    href_value = element['href']
                    
                    # if href_value is relative, make it absolute. If it's an external link, it will be unchanged
                    absolute_url = urljoin(base_url, href_value)

                    # don't recurse on external links - must match domain
                    if urlparse(absolute_url).netloc == urlparse(url).netloc:
                        found_hrefs.add(absolute_url)
                
                # determine which links are new
                new_hrefs = found_hrefs.difference(existing_hrefs)

                # if there are new links, explore them to determine if more links exist
                if len(new_hrefs) > 0:

                    # update existing_hrefs with new_hrefs so we don't explore new_hrefs in any subsequent recursive calls
                    existing_hrefs = existing_hrefs.union(new_hrefs)

                    # for each link in new_hrefs, let's recurisvely explore it to see if there are more pages to find
                    for href in new_hrefs:
                        new_existing_hrefs = extract_links(href, existing_hrefs, max_depth, depth + 1)

                        # add any new links found in the recursive call to the existing_hrefs set
                        existing_hrefs = existing_hrefs.union(new_existing_hrefs)
                    
            else:
                # Invalid URL, so remove the URL from the list of links to scrape
                if url in existing_hrefs:
                    existing_hrefs.remove(url)
            
            # return all the links we found
            return existing_hrefs

        return extract_links(website_url, max_depth=depth_to_scrape), num_pages

    # Step 4: Scrape the posts from the website
    all_links, num_pages = scrape_website(website_url)

    website_ref.child('date-last-scraped').set(time.time())

    print("Saved", len(all_links), "links")
    print("Found", num_pages, "pages")
    
    return "Success"
    
@functions_framework.http
def processWebsitePages(req):
    '''
    Users are subscribing to blogs. Those websites are being scraped with pages stored at
    /websites/hashed-website-url/unprocessed-pages.
    
    This function will either classify these pages as blogposts or not blogposts. 
    
    If the page is a blogpost, we will also extract the title, date, summary and save it to /posts.

    We will also save the hashed post url and encoded html to the corresponding website under 
    /websites/posts/hashed-post-urls.

    If the page is not a blogpost, we'll save the url and encoded html under 
    /websites/hashed-website-url/not-posts.

    Finally, we'll also save the number of tokens being passed into OpenAI so that we can keep track
    of how much we're spending on OpenAI and the rate.

    See schema below for a more visual representation of the data structure.

    This function will run every 30 minutes and classify max 25 posts per website and 100 pages total
    to limit the amount of money we spend with OpenAI.

    Input:
    None

    Output:
    1. Realtime Database contains an entries under /websites with the following structure:
        - websites
            - hashed-website-urls
                - date-added
                - date-last-scraped
                - unprocessed-pages
                    - hashed-page-urls
                        - url
                        - raw-html
                - not-posts
                    - hashed-page-urls
                        - url
                        - raw-html
                - posts
                    - hashed-post-urls:
                        - url
                        - raw-html

    2. Realtime Database contains entries under /posts with the following structure:
        - posts
            - hashed-post-urls
                - url 
                - title
                - date-published
                - body
                - summary
                - date-last-scraped 
    3. Realtime Database contains entries under /open-ai-calls with the following structure:
        - open-ai-calls
            -uuid
                - unix-timestamp
                - page-url
                - input-tokens
                - output-tokens
    '''

    # Step 1: Loop through all websites
    websites_ref = db.reference('/').child('websites')
    websites = websites_ref.get()

    total_pages = 0
    for website in websites:

        # Step 2: loop through unprocessed pages in websites
        unprocessed_pages_ref = websites_ref.child(website).child('unprocessed-pages')
        unprocessed_pages = unprocessed_pages_ref.get()
        website_url = websites_ref.child(website).child('url').get()
        num_pages = 0
        num_posts = 0

        for unprocessed_page in unprocessed_pages:

            # Step 3: get data from unprocessed page
            page_ref = unprocessed_pages_ref.child(unprocessed_page)
            page = page_ref.get()
            page_url = page['url']
            body = BeautifulSoup(page['raw-html'], 'html.parser').get_text() 

            # Step 4: classify page
            # OpenAI has unpredictable timeouts, so we'll try 3 times before giving up
            executor = ThreadPoolExecutor(max_workers=1)
            classification = None
            num_input_tokens = None
            num_output_tokens = None
            for attempt in range(3):
                future = executor.submit(extract_posts.classify_page, page_url, body)
                try:
                    # give it 20 seconds to complete
                    classification, num_input_tokens, num_output_tokens = future.result(timeout=20)
                    break
                except Exception as e:
                    print(f"Failed Attempt {attempt+1} of 3 on {page_url}. Error: {type(e).__name__} - {e}")
                    if attempt >= 2:
                        if type(e).__name__ == "ValueError":
                            classification = 0
                        print(f"Timed out on {page_url}")
                        break
                    print("Waiting 10 seconds")
                    # wait 10 seconds before trying again
                    time.sleep(10)

            # if we're not getting a response from OpenAI, which means token limits are being reached or the API is 
            # down. Let's rerun this function later.
            if classification is None:
                print("OpenAI limit reached. Exiting function")
                return "Failure"
            
            # Step 5: save the number of input/output tokens to /open-ai-calls
            open_ai_calls_ref = db.reference('/').child('open-ai-calls')
            open_ai_calls_ref.push({
                'unix-timestamp': time.time(),
                'page-url': page_url,
                'website-url': website_url,
                'input-tokens': num_input_tokens,
                'output-tokens': num_output_tokens,
            })
            
            # Step 6: check if we're getting JSON or not. If not, there's some nondeterminism with
            # the prompt and we should just move on to the next page, we'll come back to this one later
            if classification == 0:
                print("Prompt not returning JSON. Going to next page")
                continue

            # Step 7: save the classification to Realtime Database
            hashed_page_url = extract_posts.encode_url_for_rtdb(page_url)
            if classification['blogpost'] == 'yes':
                # save to /posts
                post_ref = db.reference('/').child('posts').child(hashed_page_url)
                post_ref.set({
                    'url': page_url,
                    'title': classification['title'],
                    'date-published': classification['date'],
                    'summary': classification['summary'],
                    'body': body,
                    'date-last-scraped': time.time(),
                })

                # save processed post to /websites
                website_post_ref = websites_ref.child(website).child('posts').child(hashed_page_url)
                website_post_ref.set({
                    'url': page_url,
                    'raw-html': page['raw-html'],
                })
                num_posts += 1
            else:
                # save to /websites
                not_post_ref = websites_ref.child(website).child('not-posts').child(hashed_page_url)
                not_post_ref.set({
                    'url': page_url,
                    'raw-html': page['raw-html'],
                })
            
            # Step 8: Update the date-last-scraped for this website
            websites_ref.child(website).child('date-last-scraped').set(time.time())

            # Step 9: Delete from this page /websites/unprocessed-pages
            page_ref.delete()

            # Step 10: Update the number of pages/posts processed for this website and break if limit reached
            num_pages += 1
            print("Processed", num_pages, "pages and", num_posts, "posts for", website_url)
            if num_posts >= 10 or num_pages >= 25:
                print("Skipping to next website because processed 10 posts or 25 pages for", website_url)
                break

        # Step 11: Update the number of pages/posts processed total and break if limit reached
        total_pages += num_pages
        print("Processed", total_pages, "pages total")
        if total_pages >= 100:
            print("Processed at least 100 pages total. Exiting function")
            break

    return "Success"
