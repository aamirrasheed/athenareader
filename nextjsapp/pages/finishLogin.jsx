import { useEffect, useState } from "react"
import { useRouter } from "next/router";

import { Button, Spinner } from "@nextui-org/react";

import {
    doIsSignInWithEmailLink, 
    doSignInWithEmailLink,
    doVerifyMagicLink,
    doSignInWithCustomToken
} from '@/utils/firebase'

const PAGE_STATE = {
    LOADED: "LOADED",
    LOADING: "LOADING",
    ERROR: "ERROR",
    SUCCESS: "SUCCESS"
}

let num_times_called = 0

export default function FinishLogin() {
    const router = useRouter();
    const [pageState, setPageState] = useState(PAGE_STATE.LOADED)

    const signUserIn = () => {

        setPageState(PAGE_STATE.LOADING)
        // Confirm the link is a sign-in with email link.
        if (router.query.token) {

            // Additional state parameters can also be passed via URL.
            // This can be used to continue the user's intended action before triggering
            // the sign-in operation.
            let email = window.localStorage.getItem('emailForSignIn');

            if (!email) {
                // User opened the link on a different device. To prevent session fixation
                // attacks, ask the user to provide the associated email again. For example:
                email = window.prompt('Please provide your email for confirmation');
            }
            
            doVerifyMagicLink(email, router.query.token).then((result) => {
                return doSignInWithCustomToken(result.data.customToken)
            })
            .then(() => {
                // Clear email from storage.
                window.localStorage.removeItem('emailForSignIn');

                // if user has signed up, the blocking auth cloud function should have already created the user.
                // log them in
                setPageState(PAGE_STATE.SUCCESS)
            })
            .catch((error) => {
                // Some error occurred, you can inspect the code: error.code
                // Common errors could be invalid email and invalid or expired OTPs.
                console.log("Error code: ", error.code)
                setPageState(PAGE_STATE.ERROR)
            });
        } 
        else{
            console.log("No token found in query params")
            setPageState(PAGE_STATE.ERROR)
        }
    }
    
    useEffect(() => {
        if(pageState === PAGE_STATE.SUCCESS) {
            router.push("/app")
        }

    }, [pageState])


    const handleLogIn = () => {
        signUserIn()
    }

    return (
        <div className="flex justify-center items-center mt-20">
            {pageState === PAGE_STATE.LOADED ?
                <div className="text-center">
                    <p>Click the button to finish signing in</p>
                    <Button onClick={handleLogIn}>Log in</Button>
                </div>
            :
            pageState === PAGE_STATE.LOADING ?
                <div>
                    <h1>Finishing login...</h1>
                    <Spinner />
                </div>
            :  pageState === PAGE_STATE.ERROR ?
                <div>
                    <h1>There was an error finishing login. Click the button to try again</h1>
                    <Button onClick={handleLogIn}>Try again</Button>
                </div>
            :  pageState === PAGE_STATE.SUCCESS ?
                <div>
                    <h1>Success! Redirecting to app...</h1>
                </div> 
            : <div>Error - this shouldn't show up.</div>}
        </div>
    )
}