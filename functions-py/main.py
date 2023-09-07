from concurrent.futures import ThreadPoolExecutor, TimeoutError
import time

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
    1. Realtime Database contains an entry under /websites with the following structure:
        - websites
            - website-urls
                - date-last-scraped
                - unprocessed-page-urls
                    - url
                    - body
                - posts
                    - post-urls 
    2. Realtime Database contains entries under /posts with the following structure:
        - posts
            - post-urls
                - title
                - date
                - body
                - summary
                - date-last-scraped
    
    '''
    # Step 1: get the website URL
    if "website" in req.args:
        encoded_website_url = extract_posts.encode_url(req.args["website"])
        decoded_website_url = extract_posts.decode_url(req.args["website"])
    else:
        raise Exception("No website url provided")
    
    print("scrapeWebsite triggered with url:", decoded_website_url)
    
    # Step 2: Scrape the posts from the website
    pages, all_links = extract_posts.scrape_website(decoded_website_url)

    print("Found", len(pages), "pages")

    # Step 3: Record metadata to /websites
    ref = db.reference('/')
    website_ref = ref.child('websites').child(encoded_website_url)
    website_ref.child('date-added').set(time.time())

    # Step 4: Save pages to /websites/url/unprocessed-page-urls for later processing
    for page_url in pages:
        encoded_page_url = extract_posts.encode_url(page_url)
        website_ref.child('unprocessed-page-urls').child(encoded_page_url).child("body").set(pages[page_url])
    
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
    

