import React, { useEffect } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { useRouter } from 'next/router';

const withAuthorization = condition => Component => {

  const Authorization = (props) => {

    const router = useRouter()
    const firebaseAuth = getAuth()

    useEffect(() => {
        
        // if user navigates directly to protected route without being logged in
        if(!condition(firebaseAuth.currentUser)){
            router.replace('/')
        }

        // if user logs out while inside the app
        const listener = onAuthStateChanged(firebaseAuth,
            user => {
            if (!condition(user)) {
                router.replace('/')
            }
            }
        );
        return () => {
            listener()
        }
    },[])

    return condition(firebaseAuth.currentUser) ? <Component {...props}/> : "Unauthorized" 
  }

  return Authorization;
}

export default withAuthorization;