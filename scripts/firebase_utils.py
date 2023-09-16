import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from firebase_admin import storage


cred = credentials.Certificate("./python_firebase_admin_key.json")
firebase_admin.initialize_app(cred, options={
    'databaseURL': 'https://sendittomyemail-4c3ca-default-rtdb.firebaseio.com',
    'storageBucket': 'sendittomyemail-4c3ca.appspot.com'
})

