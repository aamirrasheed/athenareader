import { useEffect, useState } from "react"
import { useRouter } from "next/router";

import { Button } from "@nextui-org/react";

import {
    doIsSignInWithEmailLink, 
    doSignInWithEmailLink,
    doCheckIfUserExists,
    doCreateUser,
} from '@/utils/firebase'

export default function FinishSignUp() {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState("")
    const handleClick = () => {
        router.push("/app")
    }
    useEffect(() => {
        // Confirm the link is a sign-in with email link.
        if (doIsSignInWithEmailLink(window.location.href)) {

            // Additional state parameters can also be passed via URL.
            // This can be used to continue the user's intended action before triggering
            // the sign-in operation.
            let email = window.localStorage.getItem('emailForSignIn');

            if (!email) {
                // User opened the link on a different device. To prevent session fixation
                // attacks, ask the user to provide the associated email again. For example:
                email = window.prompt('Please provide your email for confirmation');
            }

            // if signup=true and frequency is passed into the link, then we need to create the user
            doCheckIfUserExists(email).then((exists) => {
                console.log("finishLogin: doCheckIfUserExists: ", exists)
                if(!exists && router.query.signUp && router.query.frequency){
                    console.log("Creating user!")
                    return doCreateUser(email, router.query.frequency)
                }
            })
            .then(() => doSignInWithEmailLink(email, window.location.href))
            .then((result) => {
                // Clear email from storage.
                window.localStorage.removeItem('emailForSignIn');
                // You can access the new user via result.user
                // Additional user info profile not available via:
                // result.additionalUserInfo.profile == null
                // You can check if the user is new or existing:
                // result.additionalUserInfo.isNewUser
                setUserEmail(result.user.email)
            })
            .catch((error) => {
                // Some error occurred, you can inspect the code: error.code
                // Common errors could be invalid email and invalid or expired OTPs.
                console.log("Error code: ", error.code)
            });
        }

    }, [])

    return (
        (userEmail === "" ? <h1>Not logged in. If this persists, check console</h1> :
            <>
                <h1>Almost there, {userEmail}.</h1>
                <Button onClick={handleClick}>Click this button to finish signup</Button>
            </>
        )
    )
}