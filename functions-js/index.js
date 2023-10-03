// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions/v1');

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

const axios = require('axios');
const crypto = require('crypto');

const Resend = require('resend').Resend;


const {
    encodeURLforRTDB,
    getValidURL,
    weightedRandom,
    assembleNSummarizedLinksEmail,
    INVALID_URL_ERROR,
    UNABLE_TO_CALL_FUNCTION_ERROR
} = require('./utils');

exports.createUserInDatabaseOnSignup = functions.auth.user().onCreate((user, context) => {
    // create an entry for the user in realtime database
    admin.database().ref(`users/${user.uid}`).set({
        email: user.email,
    });

    return {result: "success"}
})

exports.sendMagicLink = functions.https.onCall(async (data, context) => {
    const email = data.email;

    // Validate the email with a regular expression
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!email || !emailRegex.test(email)) {
        throw new functions.https.HttpsError('invalid-argument', 'The email is invalid.');
    }

    // Generate a unique token
    const token = crypto.randomBytes(16).toString('hex');

    // Store the token, email, and expiration time in your database
    const expirationTime = Date.now() + 60 * 60 * 1000; // 1 hour from now
    await admin.database().ref(`magicLinks/${token}`).set({
        email: email,
        createdAt: Date.now(),
        expiresAt: expirationTime
    });

    // Send a magic link
    const resend = new Resend("re_guPE3JGT_Pn4H3Fs9mLWr7bwyznu1Ff64");
    let magicLink
    if (process.env.FUNCTIONS_EMULATOR) {
        magicLink = `http://localhost:3000/finishLogin?token=${token}`;
    }
    else {
        magicLink = `https://athenareader.com/finishLogin?token=${token}`;
    }

    const emailData = {
        from: 'Your App <support@athenareader.com>',
        to: [email],
        subject: "Sign in to Athenareader",
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <h2 style="color: #4a5568;">Hello,</h2>
                <p style="color: #718096;">You requested to sign in to Athenareader. Please click the button below to continue. If you did not request this, please ignore this email.</p>
                <a href="${magicLink}" style="background-color: #667eea; color: #ffffff; text-decoration: none; padding: 10px 20px; margin: 20px 0; display: inline-block;">Sign in to Athenareader</a>
                <p style="color: #718096;">Best,</p>
                <p style="color: #718096;">The Athenareader Team</p>
            </div>
        `
    };

    try {
        const data = await resend.emails.send(emailData);
        console.log("Email sent. Resend data: ", data)
        return {result: "success"}
    } catch (error) {
        throw error
    }


});

exports.verifyMagicLink = functions.https.onCall(async (data, context) => {
    const token = data.token;

    // Look up the token in your database
    const snapshot = await admin.database().ref(`magicLinks/${token}`).once('value');
    const magicLinkData = snapshot.val();

    if (!magicLinkData) {
        // The token is invalid
        throw new functions.https.HttpsError('invalid-argument', 'The magic link is invalid.');
    }

    // Check if the token has expired
    if (Date.now() > magicLinkData.expiresAt) {
        throw new functions.https.HttpsError('invalid-argument', 'The magic link has expired.');
    }

    const email = magicLinkData.email;

    // Create a user account
    let userRecord;
    try {
        userRecord = await admin.auth().getUserByEmail(email);
    } catch (error) {
        console.log("error is:", error)
        if (error.code === 'auth/user-not-found') {
            // The user account doesn't exist yet, so create it
            userRecord = await admin.auth().createUser({
                email: email,
                emailVerified: true,
            });

            // Add the user to the database
            data = await admin.database().ref(`users/${userRecord.uid}`).set({
                email: email,
            });

            // print data
            console.log("create user data is:", data)
        } else {
            throw error;
        }
    }

    // Generate a custom token
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    // Delete the token from the database
    await admin.database().ref(`magicLinks/${token}`).remove();

    return { customToken };
});



// TODO: Add CORS filtering to only allow deployed functions to call this function
// May need to be done on the google cloud console under "invoker" permissions
exports.addSubscription = functions.https.onCall(async (data, context) => {
    // Message text passed from the client.
    const website = data.website;

    // start by making sure it has the correct protocol
    return getValidURL(website).then(res => {
        if (res === INVALID_URL_ERROR) {
            console.log("Unable to get valid URL")
            throw new Error(INVALID_URL_ERROR)
        }
        // this should be the fully formed corect URL
        else {
            console.log("fully formed website is:", res)
            return res;
        }
    })
    .then(async (website) => {
        // encode website 
        const encodedWebsite = encodeURLforRTDB(website);
        console.log("encodedWebsite is:", encodedWebsite)

        // check if website exists in database
        await admin.database().ref(`websites/${encodedWebsite}`).limitToFirst(1).once("value", async (snapshot) => {

            // if website doesn't exist, go scrape it in the background
            if (!snapshot.exists()) {
                console.log("Website " + encodedWebsite + " doesn't exist in database. Scraping it in the background")

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
                    console.log(UNABLE_TO_CALL_FUNCTION_ERROR)
                });

            }
            else {
                console.log("Website already exists in database")
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

/*
This function runs on a schedule once a day at 8am PST. 
Input: 

Output:

*/
exports.sendEmailAsSummarizedLinks = functions.pubsub.schedule('0 8 * * *').timeZone('America/Los_Angeles').onRun((context) => {
    console.log("Entering sendEmailAsSummarizedLinks")
    const resend = new Resend("re_guPE3JGT_Pn4H3Fs9mLWr7bwyznu1Ff64");
    const NUM_POSTS_PER_EMAIL = 3

    // Loop over all users
    admin.database().ref('users').once('value').then(snapshot => {
        const promises = [];
        snapshot.forEach(userSnapshot => {
            
            const userUid = userSnapshot.key;
            console.log("userUid: ", userUid)
            promises.push(

                // Step 1: Get up to NUM_POSTS_PER_EMAIL random user subscriptions
                admin.database().ref(`users/${userUid}/subscriptions`).once('value').then(subscriptionSnapshot => {
                    const subscriptions = subscriptionSnapshot.val();
                    if (!subscriptions) {
                        console.log(`User ${userSnapshot.val().email} has no subscriptions. Throwing error and exiting promise chain to next user`);
                    }
                    const hashedSubscriptionUrls = Object.keys(subscriptions);
                    console.log("User has subscriptions: ", hashedSubscriptionUrls)


                    // Randomize the order of the subscriptions
                    for(let i = hashedSubscriptionUrls.length - 1; i > 0; i--){
                        const j = Math.floor(Math.random() * i)
                        const temp = hashedSubscriptionUrls[i];
                        hashedSubscriptionUrls[i] = hashedSubscriptionUrls[j];
                        hashedSubscriptionUrls[j] = temp;
                    }
                    
                    // get up to NUM_POSTS_PER_EMAIL subscriptions
                    let selectedSubscriptions = hashedSubscriptionUrls;
                    if (hashedSubscriptionUrls.length > NUM_POSTS_PER_EMAIL) {
                        selectedSubscriptions = hashedSubscriptionUrls.slice(0, NUM_POSTS_PER_EMAIL);
                    }
                    console.log("Selected subscriptions: ", selectedSubscriptions)

                    // Step 2: Gather posts from those subscriptions and weight them such that each website is equally likely to be chosen,
                    // and each post within a website is equally likely to be chosen
                    let postsFromSelectedSubscriptions = {};
                    let promises = selectedSubscriptions.map(selectedSubscription => {
                        return admin.database().ref(`websites/${selectedSubscription}/posts`).once('value')
                        .then(postsSnapshot => {
                            const posts = postsSnapshot.val();
                            if (!posts) {
                                // user subscription has no posts
                                return
                            }
                            let hashedPostUrls = Object.keys(posts);
                            
                            // this is the weighted probability of each post. We're basically weighting it so that
                            // each WEBSITE is equally likely to have a post selected, but each POST is equally likely
                            // within the WEBSITE
                            let eachPostProbability = 1 / selectedSubscriptions.length / hashedPostUrls.length;

                            // fill postsFromSelectedSubscriptions with hashedPostUrls as keys and eachPostProbability as each value
                            hashedPostUrls.forEach(hashedPostUrl => {
                                postsFromSelectedSubscriptions[hashedPostUrl] = eachPostProbability;
                            });
                        });
                    })

                    // Step 3: Make a selection of NUM_POSTS_PER_EMAIL posts
                    return Promise.all(promises).then(() => {

                        let selectedHashedPostUrls = [];
                        for(let i = 0; i < NUM_POSTS_PER_EMAIL; i++) {

                            // select a random post according to its probability
                            const selectedPost = weightedRandom(postsFromSelectedSubscriptions);
                            selectedHashedPostUrls.push(selectedPost);

                            // Remove the selected post and break if there are no posts left
                            delete postsFromSelectedSubscriptions[selectedPost];
                            if (Object.keys(postsFromSelectedSubscriptions).length === 0) {
                                break;
                            }
                        }
                        console.log("Chosen posts: ", selectedHashedPostUrls)
                        return selectedHashedPostUrls
                    });

                })
                // Step 4: Get data for the selected posts
                .then(selectedHashedPostUrls => {
                    let promises = selectedHashedPostUrls.map(hashedPostUrl => {
                        return admin.database().ref(`posts/${hashedPostUrl}`).once('value');
                    });
                    return Promise.all(promises);
                })
                // Step 5: send the email with the post data
                .then(postSnapshots => {
                    const emailBody = assembleNSummarizedLinksEmail(postSnapshots);

                    const data = {
                        from: 'Your Daily Newsletter <newsletter@athenareader.com>',
                        to: [userSnapshot.val().email],
                        subject: "Your Daily Newsletter",
                        html: emailBody
                    }
                    return resend.emails.send(data).then(resendData => {
                        console.log("Email sent. Resend data: ", resendData)
                        return {
                            "user-emailed": userUid,
                            "email-body": emailBody,
                            "timestamp": Math.floor(Date.now() / 1000),
                            "posts": postSnapshots.reduce((acc, curr) => {
                                acc[curr.key] = curr.val()?.url;
                                return acc;
                            }, {})
                        }
                    })

                })
                // record the email in sent_emails
                .then(emailData => {
                    return admin.database().ref('sent_emails').push().set(emailData)
                })
                .catch(error => {
                    // most likely just a user with no subscriptions
                    console.error(error);
                })
            );
        });
        return Promise.all(promises);
    })
    .catch(error => {
        console.error(error);
    });

    return {result: "success"}

})
