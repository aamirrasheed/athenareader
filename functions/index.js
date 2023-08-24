/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions/v1');

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

// TODO: For some reason using this causes errors. It would be useful. But not necessary.
// exports.myBeforeCreate = functions.auth.user().beforeCreate((user, context) => {
//     console.log("Aamir is calling beforeCreate")
// });
  
exports.myBeforeSignIn = functions.auth.user().beforeSignIn((user, context) => {
    console.log("Aamir is calling beforeSignIn")
});

exports.myOnCreate = functions.auth.user().onCreate((user, context) => {
    console.log("Aamir is calling onCreate")
    
    // create an entry for the user in realtime database
    admin.database().ref(`users/`).push({
        email: user.email,
    })
})
