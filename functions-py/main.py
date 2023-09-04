# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn, pubsub_fn
from firebase_admin import initialize_app

initialize_app()

@https_fn.on_request()
def on_request_example(req: https_fn.Request) -> https_fn.Response:
    return https_fn.Response("Hello world!")

@pubsub_fn.on_message_published(topic="scrapeWebsite")
def scrapeWebsite(event: pubsub_fn.CloudEvent[pubsub_fn.MessagePublishedData]) -> None:
    print("python scrapeWebsite called")
    pass

