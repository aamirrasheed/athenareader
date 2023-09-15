import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from firebase_admin import storage


cred = credentials.Certificate("./python_firebase_admin_key.json")
firebase_admin.initialize_app(cred, options={
    'databaseURL': 'https://sendittomyemail-4c3ca-default-rtdb.firebaseio.com',
    'storageBucket': 'sendittomyemail-4c3ca.appspot.com'
})

import sys
import hashlib

def encode_url_for_rtdb(url):
    """
    Encode a url for use as a key in Firebase realtime database
    """
    return hashlib.sha256(url.encode()).hexdigest()

# get argument to python script
path = sys.argv[1]
print(path)

# download from storage and write to disk in ./downloads
bucket = storage.bucket()
blob = bucket.blob(path)

blob.download_to_filename('./downloads/' + encode_url_for_rtdb(path) + ".txt")



