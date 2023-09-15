
'''
9-14-23
There are some junk posts. I think it's RSS crap. Basically, any URL that has wp-json
in it is junk. I'm going to delete these posts from RTD and cloud storage.

Here is how I'll do it:
1. I'll iterate through all the posts in RTD under /posts
2. If I find a post with a URL that has wp-json in it, I'll delete it from:
    - cloud storage
    - /websites/url/posts
    - /posts

'''

import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from firebase_admin import storage

from urllib.parse import urlparse
import hashlib

cred = credentials.Certificate("./python_firebase_admin_key.json")
firebase_admin.initialize_app(cred, options={
    'databaseURL': 'https://sendittomyemail-4c3ca-default-rtdb.firebaseio.com',
    'storageBucket': 'sendittomyemail-4c3ca.appspot.com'
})


def extract_protocol_and_domain(url):
    parsed_url = urlparse(url)
    protocol = parsed_url.scheme
    domain = parsed_url.netloc
    return f"{protocol}://{domain}"

def encode_url_for_rtdb(url):
    """
    Encode a url for use as a key in Firebase realtime database
    """
    return hashlib.sha256(url.encode()).hexdigest()

posts_ref = db.reference('posts')
posts = posts_ref.get(shallow=True)

websites_ref = db.reference('websites')

i = 0
for post in posts:
    url = posts_ref.child(post).child('url').get()
    if 'wp-json' in url:
        i += 1 
        
        # get cloud storage references
        bucket = storage.bucket()
        blob = bucket.blob('webpages/' + post)

        # get /websites/url/posts reference
        website_url = extract_protocol_and_domain(url)
        hashed_website_url = encode_url_for_rtdb(website_url)
        hashed_post_url = encode_url_for_rtdb(url)
        website_page_ref = websites_ref.child(hashed_website_url).child('posts').child(hashed_post_url)

        # delete em all
        print("Deleting post: " + str(posts_ref.child(post).path))
        blobs = bucket.list_blobs(prefix=blob.name)
        for blob_in_blob in blobs:
            print(blob_in_blob.name)
        blob_in_blob.delete()
        website_page_ref.delete()
        posts_ref.child(post).delete()


print('deleted ' + str(i) + ' posts')