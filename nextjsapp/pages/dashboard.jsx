import { useEffect } from "react"
import {getAuth} from 'firebase/auth'
import { useRouter } from "next/router";
import { useState } from "react";

import firebaseApp from '@/firebase/config';

function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null)
    useEffect(() => {
        const auth = getAuth(firebaseApp);
        if(!auth.currentUser){
            console.log("No authenticated user")
            router.push("/")
        }
        else{
            setUser(auth.currentUser)
        }
    },[])

    return(
        <>
            <h1>This is the logged in app!</h1>
            <p>Your email is {user ? user.email : 'unknown'}.</p>
        </>
    )
}

export default (Dashboard)
