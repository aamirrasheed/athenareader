import {initializeApp, getApps} from 'firebase/app';
import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    onAuthStateChanged,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    signOut,
} from 'firebase/auth';

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

if (!getApps().length) {
  const firebaseApp = initializeApp(firebaseConfig);
  firebaseAuth = getAuth(firebaseApp);
  setPersistence(firebaseAuth, browserLocalPersistence);
}

const doSendSignInLinkToEmail = (email, actionCodeSettings) => sendSignInLinkToEmail(firebaseAuth, email, actionCodeSettings);

const doIsSignInWithEmailLink = (emailLink) => isSignInWithEmailLink(firebaseAuth, emailLink);

const doSignInWithEmailLink = (email, emailLink) => signInWithEmailLink(firebaseAuth, email, emailLink);

const doSignOut = () => signOut(firebaseAuth);

const doOnAuthStateChanged = (callback) => onAuthStateChanged(firebaseAuth, callback);

const getCurrentUser = () => firebaseAuth.currentUser;

export { 
    doSendSignInLinkToEmail,
    doIsSignInWithEmailLink,
    doSignInWithEmailLink,
    doSignOut,
    doOnAuthStateChanged,
    getCurrentUser,
}