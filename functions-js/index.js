const http = require('http');
const https = require('https');

// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions/v1');

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

const axios = require('axios');

const {encodeURLforRTDB} = require('./utils');

exports.createUserInDatabaseOnSignup = functions.auth.user().onCreate((user, context) => {
    // create an entry for the user in realtime database
    admin.database().ref(`users/${user.uid}`).set({
        email: user.email,
    });

    return {result: "success"}
})

// TODO: Add CORS filtering to only allow deployed functions to call this function
// May need to be done on the google cloud console under "invoker" permissions
exports.addSubscription = functions.https.onCall(async (data, context) => {
    // Message text passed from the client.
    const website = data.website;

    // start by making sure it has the correct protocol
    return new Promise((resolve, reject) => {
        // Check if the URL already has a scheme
        if (website.startsWith('http://')) {
            console.log("Starts with http")
            http.get(website, (res) => {
                if(res.statusCode === 200){
                    resolve(website);
                } else {
                    reject('Invalid URL');
                }
            }).on('error', (err) => {
                reject('Invalid URL');
            }).end();
        }
        else if (website.startsWith('https://')) {
            console.log("Starts with https")
            https.get(website, (res) => {
                if(res.statusCode === 200){
                    resolve(website);
                } else {
                    reject('Invalid URL');
                }
            }).on('error', (err) => {
                reject('Invalid URL');
            }).end();
        } else {
            // It's a schemeless URL - let's try both http and https
            console.log("Trying with http")
            http.get('http://' + website, (res) => {
                if(res.statusCode === 200){
                    resolve('http://' + website);
                    
                } else {
                    console.log("Trying with https")
                    https.get('https://' + website, (res) => {
                        if(res.statusCode === 200){
                            resolve('https://' + website);
                        } else {
                            reject('Invalid URL');
                        }
                    }).on('error', (err) => {
                        reject('Invalid URL');
                    }).end();
                }
            }).end();
        }
    })
    .then(async (website) => {
        // encode website 
        const encodedWebsite = encodeURLforRTDB(website);

        // check if website exists in database
        await admin.database().ref(`websites/${encodedWebsite}`).once("value", async (snapshot) => {
            // if website doesn't exist, go scrape it in the background
            if (!snapshot.exists()) {

                let scrapeWebsiteURL;
                console.log("process.env.FUNCTIONS_EMULATOR set to ", process.env.FUNCTIONS_EMULATOR)
                if (process.env.FUNCTIONS_EMULATOR) {
                    scrapeWebsiteURL = 'http://localhost:5001/sendittomyemail-4c3ca/us-central1/extractPagesFromWebsite'
                }
                else {
                    scrapeWebsiteURL = 'https://us-central1-sendittomyemail-4c3ca.cloudfunctions.net/extractPagesFromWebsite';
                }

                axios.post(scrapeWebsiteURL, {
                    websiteToScrape: website,
                    addedBy: context.auth.uid
                })
                .catch(function (error) {
                    console.log(error);
                });

            }
        })

        return website
    }).then((website) => {

        // record a user subcription to the database
        console.log("Recording subscription to database")
        return admin.database().ref(`users/${context.auth.uid}/subscriptions/${encodeURLforRTDB(website)}`).set(website)
    }).then(() => {
        return {result: "success"}
    })
    .catch((error) => {
        console.log(error)
        return {result: "error"}
    })
})

// TODO: Add CORS filtering to only allow deployed functions to call this function
// May need to be done on the google cloud console under "invoker" permissions
exports.deleteSubscription = functions.https.onCall(async (data, context) => {
    const userUID = context.auth.uid;
    const encodedWebsite = encodeURLforRTDB(data.website);
    admin.database().ref(`users/${userUID}/subscriptions/${encodedWebsite}`).remove()
    .then(() => {
        return {result: "success"}
    })
})

// import { Resend } from 'resend';

// exports.sendEmail = functions.runWith({secrets: ["RESEND_EMAIL_API_KEY"]}).https.onRequest((req, res) => {

//     const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);

//     // Loop over all users
//     admin.database().ref('users').once('value')
//     .then(snapshot => {
//         const promises = [];
//         snapshot.forEach(userSnapshot => {
//             const userUid = userSnapshot.key;
//             promises.push(
//                 // get the websites the user has subscribed to, pick a random one
//                 admin.database().ref(`users/${userUid}/subscriptions`).once('value')
//                 .then(subscriptionSnapshot => {
//                     const subscriptions = subscriptionSnapshot.val();
//                     const subscriptionUrls = Object.keys(subscriptions);
//                     const randomSubscriptionUrl = subscriptionUrls[Math.floor(Math.random() * subscriptionUrls.length)];
//                     return admin.database().ref(`websites/${randomSubscriptionUrl}/posts`).once('value');
//                 })
//                 // get a random post from that website
//                 .then(postsSnapshot => {
//                     const posts = postsSnapshot.val();
//                     const postUrls = Object.keys(posts);
//                     const randomPostUrl = postUrls[Math.floor(Math.random() * postUrls.length)];
//                     return admin.database().ref(`posts/${randomPostUrl}`).once('value');
//                 })
//                 // send the email with the post data
//                 .then(async postSnapshot => {
//                     const postData = postSnapshot.val();
//                     const postTitle = postData.title;
//                     const postBody = postData.body;
//                     const postDate = postData.date;

//                     try {
//                         const data = {
//                             from: 'Aamir <newsletter@sendittomy.email>',
//                             to: [userSnapshot.val().email],
//                             subject: postTitle,
//                             html: '<h1>' + postTitle + '</h1>' + '<h3>' + postDate + '</h3>' + '<p>' + postBody + '</p>'
//                         }
//                         return await resend.emails.send(data)
//                     } 
//                     catch {
//                         throw new Error('Failed to send email via Resend')
//                     }

//                 })
//                 // record the email in sent_emails
//                 .then(resendData => {
//                     console.log(resendData);
//                     return admin.database().ref(`sent_emails/${resendData.id}`).set({
//                         userEmailed: userUid,
//                         post: resendData.id,
//                         date: new Date().toISOString()
//                     })
//                 })
//             );
//         });
//         return Promise.all(promises);
//     })
//     .catch(error => {
//         console.error(error);
//     });

// })
