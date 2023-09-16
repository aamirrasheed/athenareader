
'''
Currently, all webpages are stored raw in realtime database, which is taking up way too much data.
We need to migrate them to cloud storage.

Places where webpage data is stored in Realtime Database:
- websites/<hashed-url>/unprocessed-pages/<hashed-url>/raw-html/<webpage-data>
- websites/hashed-url/not-posts/hashed-url/raw-html/<webpage-data>
- posts/hashed-url/body/<webpage-data>
- posts/hashed-url/raw-html/<webpage-data>

We need to replace this with
- websites/<hashed-url>/unprocessed-pages/<hashed-url>/raw-html/<storage id>
- websites/hashed-url/not-posts/hashed-url/raw-html/<storage id>
- posts/hashed-url/body/<storage id>
- posts/hashed-url/raw-html/<storage id>

Here's the structure of our cloud storage:
- webpages
    - hashed-url
        - raw-html
        - body (optional, only if post)

That's it. Here's the structure our script will follow:
1. Get data from Realtime Database. Pull from all 4 locations.
2. Upload data to Cloud Storage. Upload to raw-html, and body if the data is a post
3. Update Realtime Database. Replace the data with the storage id.

'''

import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from firebase_admin import storage


cred = credentials.Certificate("./python_firebase_admin_key.json")
firebase_admin.initialize_app(cred, options={
    'databaseURL': 'https://sendittomyemail-4c3ca-default-rtdb.firebaseio.com',
    'storageBucket': 'sendittomyemail-4c3ca.appspot.com'
})

# Step 1: Accumulate a list of references to all four places mentioned above in realtime database
raw_html_ref_list = {}
body_ref_list = {}

# get refs from /posts
posts_ref = db.reference('posts')
posts = posts_ref.get(shallow=True)
if posts:
    for post in posts:
        body_ref = posts_ref.child(post).child('body')
        raw_html_ref = posts_ref.child(post).child('raw-html')
        body_ref_list[post] = body_ref
        raw_html_ref_list[post] = raw_html_ref

# # get refs from /websites
# websites_ref = db.reference('websites')
# websites = websites_ref.get(shallow=True)
# for website in websites:
#     # get refs from websites/<hashed-url>/unprocessed-pages
#     unprocessed_pages_ref = websites_ref.child(website).child('unprocessed-pages')
#     unprocessed_pages = unprocessed_pages_ref.get(shallow=True)
#     if unprocessed_pages:
#         for unprocessed_page in unprocessed_pages:
#             raw_html_ref = unprocessed_pages_ref.child(unprocessed_page).child('raw-html')
#             raw_html_ref_list[unprocessed_page] = raw_html_ref

#     # get refs from websites/<hashed-url>/not-posts
#     not_posts_ref = websites_ref.child(website).child('not-posts')
#     not_posts = not_posts_ref.get(shallow=True)
#     if not_posts:
#         for not_post in not_posts:
#             raw_html_ref = not_posts_ref.child(not_post).child('raw-html')
#             raw_html_ref_list[not_post] = raw_html_ref
# Step 2: For each ref - download data from RTD, upload the data to cloud storage, then change RTD to point to cloud storage
for i, hashed_url in zip(range(len(raw_html_ref_list)), raw_html_ref_list):
    # get data from RTD
    data = raw_html_ref_list[hashed_url].get()
    print(hashed_url)

    # upload the data there to cloud storage
    bucket = storage.bucket()
    blob = bucket.blob('webpages/' + hashed_url + '/raw-html')
    blob.upload_from_string(data)

    # change RTD to point to cloud storage
    raw_html_ref_list[hashed_url].set(blob.name)
    print('Uploaded webpage ' + str(i) + ' of ' + str(len(raw_html_ref_list)))
quit()
# Step 3: Repeat step 2 for body_ref_list
for i, hashed_url in zip(range(len(body_ref_list)), body_ref_list):
    # get data from RTD
    data = body_ref_list[hashed_url].get()

    # upload the data there to cloud storage
    bucket = storage.bucket()
    blob = bucket.blob('webpages/' + hashed_url + '/body')
    blob.upload_from_string(data)

    # change RTD to point to cloud storage
    body_ref_list[hashed_url].set(blob.name)
    print('Uploaded webpage ' + str(i) + ' of ' + str(len(body_ref_list)))


quit()
# Note to self: this is how you download the data from cloud storage
new_blob = bucket.get_blob(blob.name)
downloaded_data = new_blob.download_as_string().decode('utf-8')
    

