import {
    initializeApp,
    getApps
} from 'firebase/app';
import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    onAuthStateChanged,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    signOut,
    connectAuthEmulator,
} from 'firebase/auth';
import { 
    getDatabase, 
    connectDatabaseEmulator,
    ref,
    set,
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAhEQFLIgWUrs_lsxQEZcHnzq6IWCPTy7w",
  authDomain: "sendittomyemail-4c3ca.firebaseapp.com",
  databaseURL: "https://sendittomyemail-4c3ca-default-rtdb.firebaseio.com",
  projectId: "sendittomyemail-4c3ca",
  storageBucket: "sendittomyemail-4c3ca.appspot.com",
  messagingSenderId: "193708538184",
  appId: "1:193708538184:web:5b0b1ed3db13137ff3db7d",
  measurementId: "G-PYDRPRG8JK",
};

let firebaseAuth;
let firebaseDb;


if (!getApps().length) {
    const firebaseApp = initializeApp(firebaseConfig);

    // initialize auth
    firebaseAuth = getAuth(firebaseApp);
    setPersistence(firebaseAuth, browserLocalPersistence);

    // initialize realtime database
    firebaseDb = getDatabase(firebaseApp)

    // connect to firebase emulators while developing
    if (process.env.NODE_ENV === 'development') {
        connectAuthEmulator(firebaseAuth, 'http://127.0.0.1:9099');
        connectDatabaseEmulator(firebaseDb, '127.0.0.1', '9000');
    }   

}

// auth functions
const doSendSignInLinkToEmail = (email, actionCodeSettings) => sendSignInLinkToEmail(firebaseAuth, email, actionCodeSettings);

const doIsSignInWithEmailLink = (emailLink) => isSignInWithEmailLink(firebaseAuth, emailLink);

const doSignInWithEmailLink = (email, emailLink) => signInWithEmailLink(firebaseAuth, email, emailLink);

const doSignOut = () => signOut(firebaseAuth);

const doOnAuthStateChanged = (callback) => onAuthStateChanged(firebaseAuth, callback);

const authUser = () => firebaseAuth.currentUser;

const user = uid => ref(firebaseDb, `users/${uid}`);

function doSetUserFrequency(uid, frequency) { set(ref(firebaseDb, `users/${uid}/frequency`), frequency);}

const doSubscribeUserToWebsite = (uid, website) => {
    let url = new URL(website.includes('://') ? website : 'http://' + website);
    let encoded_website = url.hostname.replace(/\./g, '%2E');
    
    return set(ref(firebaseDb, `users/${uid}/subscriptions/${encoded_website}`), true)
}

const doUnsubscribeUserFromWebsite = (uid, website) => {
    let url = new URL(website.includes('://') ? website : 'http://' + website);
    let encoded_website = url.hostname.replace(/\./g, '%2E');
    return set(ref(firebaseDb, `users/${uid}/subscriptions/${encoded_website}`), null);
}

export {
    doSendSignInLinkToEmail,
    doIsSignInWithEmailLink,
    doSignInWithEmailLink,
    doSignOut,
    doOnAuthStateChanged,
    authUser,
    user,
    doSetUserFrequency,
    doSubscribeUserToWebsite,
    doUnsubscribeUserFromWebsite,
}