from concurrent.futures import ThreadPoolExecutor, TimeoutError
import time
from urllib.parse import urlparse, urljoin
import requests
from bs4 import BeautifulSoup

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
    A GET request that contains a blog url to scrape
    
    Output:
    Realtime Database contains an entry under /websites with the following structure:
    - websites
        - website-urls
            - date-last-scraped
            - unprocessed-page-urls
                - url
                - body
    
    '''
    # Step 1: get the website URL
    if "website" in req.args:
        encoded_website_url = extract_posts.encode_url(req.args["website"])
        decoded_website_url = extract_posts.decode_url(req.args["website"])
    else:
        raise Exception("No website url provided")
    
    print("scrapeWebsite triggered with url:", decoded_website_url)

    # Step 2: Write initial entry to /websites
    ref = db.reference('/')
    website_ref = ref.child('websites').child(encoded_website_url)
    website_ref.child('date-added').set(time.time())
    
    # Step 3: Define recursive function to scrape website
    def scrape_website(website_url, depth_to_scrape=2):
        num_pages = 0

        print("Scraping", website_url, "with depth", depth_to_scrape, "...")
        
        def extract_links(url, existing_hrefs=set(), max_depth=4, depth=0):
            
            base_url = urlparse(url).scheme + "://" + urlparse(url).netloc
            response = requests.get(url)
            
            if response.status_code == 200:
                # valid url, add to existing_hrefs
                existing_hrefs.add(url)

                # get page content and save to posts for classification later on
                soup = BeautifulSoup(response.content, 'html.parser')
                website_text = soup.get_text()

                # write to /websites
                encoded_page_url = extract_posts.encode_url(url)
                website_ref.child('unprocessed-page-urls').child(encoded_page_url).child("body").set(website_text)
                nonlocal num_pages
                num_pages += 1
                # if max_depth reached, pop outta here
                if(depth == max_depth):
                    return existing_hrefs

                # get links inside the page soup for further recursive madness
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
                existing_hrefs.remove(url)
            
            # return all the links we found
            return existing_hrefs

        return extract_links(website_url, max_depth=depth_to_scrape), num_pages

    # Step 4: Scrape the posts from the website
    all_links, num_pages = scrape_website(decoded_website_url)

    print("Saved", len(all_links), "links")
    print("Found", num_pages, "pages")

    
    return "Success"
    
# def extractPostsFromUnclassifiedPages():
#     '''
#     Not all pages are classified in the extractPosts function. This function will take care of the rest of them.

#     Input:
#     None

#     Output:
#     1. Realtime Database contains an entry under /websites with the following structure:
#         - websites
#             - website-urls
#                 - date-added
#                 - unprocessed-page-urls
#                     - url
#                     - body
#                 - posts
#                     - post-urls 
#     2. Realtime Database contains entries under /posts with the following structure:
#         - posts
#             - post-urls
#                 - title
#                 - date
#                 - body
#                 - summary
#                 - date-last-scraped 
#     '''
#     ref = db.reference('/')
# Step 3: Classify and extract title, date, and body from first five posts
    # classifications = []
    # NUM_POSTS_TO_CLASSIFY_AT_THIS_TIME = 5
    # i = 0
    # for url in pages:
    #     if i >= NUM_POSTS_TO_CLASSIFY_AT_THIS_TIME:
    #         break

    #     print(f"Classifying {i}/{NUM_POSTS_TO_CLASSIFY_AT_THIS_TIME}: {url}")

    #     executor = ThreadPoolExecutor(max_workers=1)

    #     # OpenAI has unpredictable timeouts, so we'll try 3 times before giving up
    #     for attempt in range(3):
    #         future = executor.submit(extract_posts.classify_page, url, pages[url])
    #         try:
    #             # give it 20 seconds to complete
    #             jsonresponse = future.result(timeout=20)
    #             classifications.append(jsonresponse)
    #             pages[url] = False
    #             i+=1
    #             break
    #         except Exception as e:
    #             print(f"Failed Attempt {attempt+1} of 3 on {url}. Error: {type(e).__name__} - {e}")
    #             if attempt >= 2: 
    #                 print(f"Timed out on {url}")
    #                 break
    #             print("Waiting 10 seconds")
    #             # wait 10 seconds before trying again
    #             time.sleep(10)
    # Step 6: Save the classified posts to /posts and record cross links in /websites in Realtime Database
    # for classification in classifications:
    #     # skip non-blogposts
    #     if classification['blogpost'] == 'no':
    #         continue

    #     # encode post URL for realtime database compatibility
    #     encoded_post_url = extract_posts.encode_url(classification['url'])

    #     # Write to /posts
    #     post_ref = ref.child('posts').child(encoded_post_url)
    #     post_ref.set({
    #         'title': classification['title'],
    #         'date': classification['date'],
    #         'body': classification['body'],
    #         'summary': classification['summary'],
    #         'date-last-scraped': time.time(),
    #     })

    #     # write /posts uuid to corresponding entry in /websites
    #     website_post_ref = ref.child('websites').child(encoded_website_url).child('posts').child(encoded_post_url)
    #     website_post_ref.set(True)
    

