from firebase_utils import storage

bucket = storage.bucket()
blob = bucket.blob('test/aamir/raw-html')
blob.upload_from_string("hello world")

new_blob = bucket.blob('test/aamir/body')
new_blob.upload_from_string("helloworld2")