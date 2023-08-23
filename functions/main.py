# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import identity_fn
from firebase_admin import initialize_app, db

initialize_app()


# create a user in realtime database when a user is created in firebase auth
@identity_fn.before_user_created()
def create_user_in_rtd( event: identity_fn.AuthBlockingEvent,) -> identity_fn.BeforeCreateResponse | None:
    print("create_user_in_rtd called")
    email = event.additional_user_info.profile.get('email')

    # Generate a unique key using push() method
    ref = db.reference('users')
    new_user_ref = ref.push()

    new_user_ref.set({
        'email': email
    })

    print("Created new user:", email)
    print(event.additional_user_info.username)
    return

@identity_fn.before_user_signed_in()
def signedin_noop(
    event: identity_fn.AuthBlockingEvent,
) -> identity_fn.BeforeSignInResponse | None:
    print("signedin_noop called")
    return