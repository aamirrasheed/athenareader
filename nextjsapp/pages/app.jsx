import { Button } from "@nextui-org/react"
import withAuthorization from "../utils/session/withAuthorization"

import {getAuth, signOut} from "firebase/auth"

function App() {
    const auth = getAuth()
    
    const handleSignOutClick = e => {
        signOut(auth);    
    }
    return(
        <>
            <h1>This is the logged in app!</h1>
            <p>Your email is {auth.currentUser ? auth.currentUser.email : 'unknown'}.</p>
            <Button onClick={handleSignOutClick}>Sign Out</Button>
        </>
    )
}

// make sure the authUser exists
let condition = authUser => !!authUser
export default withAuthorization(condition)(App)
