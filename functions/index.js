// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions/v1');

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

exports.createUserInDatabaseOnSignup = functions.auth.user().onCreate((user, context) => {
    // create an entry for the user in realtime database
    admin.database().ref(`users/${user.uid}`).set({
        email: user.email,
    });
})
