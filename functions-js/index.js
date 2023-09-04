const {PubSub} = require('@google-cloud/pubsub');
const pubsub = new PubSub();
const http = require('http');
const https = require('https');

// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions/v1');

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

const {encodeWebsiteURL} = require('./utils');

exports.createUserInDatabaseOnSignup = functions.auth.user().onCreate((user, context) => {
    // create an entry for the user in realtime database
    admin.database().ref(`users/${user.uid}`).set({
        email: user.email,
    });

    return {result: "success"}
})


exports.addSubscription = functions.region('us-central1').https.onCall(async (data, context) => {
    // Message text passed from the client.
    const website = data.website;

    // start with url validation
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
        const encoded_website = encodeWebsiteURL(website);

    
        await admin.database().ref(`websites/${encoded_website}`).once("value", async (snapshot) => {
            // if website doesn't exist, go scrape it
            if (!snapshot.exists()) {

                // check if scrapeWebsite topic exists
                const [topics] = await pubsub.getTopics();
                const topicExists = topics.find((topic) => topic.name.split('/').pop() === "scrapeWebsite");

                // if it doesn't exist, create it
                if (!topics || !topicExists) {
                    console.log("Creating topic scrapeWebsite")
                    await pubsub.createTopic('scrapeWebsite');
                    console.log("Created scrapeWebsite topic")
                }

                // get the topic and publish a message to it
                const topic = pubsub.topic('scrapeWebsite');
                const message = {[encoded_website]: true}
                const dataBuffer = Buffer.from(JSON.stringify(message));

                console.log("Publishing message to scrapeWebsite topic")
                await topic.publishMessage({data: dataBuffer});
            }
        })

        return encoded_website
    }).then((encoded_website) => {
        console.log("Encoded website is", encoded_website)

        // record a user subcription to the database
        return admin.database().ref(`users/${context.auth.uid}/subscriptions/${encoded_website}`).set("true")
    }).then(() => {
        return {result: "success"}
    })
    .catch((error) => {
        console.log(error)
        return {result: "error"}
    })
})

// exports.scrapeWebsite = functions.pubsub.topic('scrape-website').onPublish(async (message, context) => {
//     // 1. Scrapes a website, writes posts, titles, body, summary, etc to /posts
//     // 2. Links each post to its parent /website

//     // step 1: Get the website URL
//     const website_url = message.data.website;

//     // step 2: define function that recursively scrapes links to certain depth
//     async function extract_links(urlToVisit, existing_hrefs, max_depth=10, depth=0) {
//         if(depth === max_depth){
//             console.log("max_depth reached, returning");
//             return existing_hrefs;
//         }

//         console.log("scanning", urlToVisit);
//         let found_hrefs = new Set();

//         let base_url = url.parse(urlToVisit).protocol + "//" + url.parse(urlToVisit).hostname;
//         let response = await axios.get(urlToVisit);
        
//         if (response.status === 200) {
//             const dom = new JSDOM(response.data);
//             let elements = dom.window.document.querySelectorAll('[href]');
//             elements.forEach((element) => {
//                 let href_value = element.getAttribute('href');
//                 let absolute_url = url.resolve(base_url, href_value);
//                 if (url.parse(absolute_url).hostname === url.parse(urlToVisit).hostname) {
//                     found_hrefs.add(absolute_url);
//                 }
//             });

//             let new_hrefs = new Set([...found_hrefs].filter(x => !existing_hrefs.has(x)));
//             if (new_hrefs.size === 0) {
//                 console.log("Found no new links");
//                 return existing_hrefs;
//             } else {
//                 console.log("Found", new_hrefs.size, "new links");
//                 existing_hrefs = new Set([...found_hrefs, ...existing_hrefs]);
//                 for (let href of new_hrefs) {
//                     return await extract_links(href, existing_hrefs, max_depth, depth + 1);
//                 }
//             }
//         } else {
//             console.log(`Failed to fetch the URL: ${urlToVisit}`);
//             return null;
//         }
//     }

//     // step 3: scrape website
//     let all_links = await extract_links(website_url, new Set(), 3);

//     if (all_links) {
//         for (let link of all_links) {
//             console.log(link);
//         }
//     }

//     all_links = Array.from(all_links);

//     // step 3: Classify links into articles or non articles
//     // use this prompt from ChatGPT:
//     const PROMPT = `I need you to act as a URL classifier. You are going to guess whether the given URL is an article based on the URL only.  Give me your best guess. If you believe the page is a written article, please output the URL with yes (like so: "[url]: yes"). If you think it contains a collection of articles, or the homepage of a blog, or anything that is NOT an article, output the url with no (like this: "[url]: no"). Do not respond with anything else except the URLs and the "yes" or "no".`;
//     const NUM_LINKS_TO_PROCESS = 50;

//     for (let i = 0; i < all_links.length; i += NUM_LINKS_TO_PROCESS) {
//         let num_links_in_call = Math.min(NUM_LINKS_TO_PROCESS, all_links.length - i);
//         let included_links = all_links.slice(i, i + num_links_in_call);
//         let included_links_string = included_links.join(" \n ");

//         // get openAI predictions
//         let response = await openai.ChatCompletion.create({
//             model: "gpt-3.5-turbo",
//             messages: [
//                 {"role": "system", "content": "You are a helpful assistant."},
//                 {"role": "user", "content": `${PROMPT} \n \n ${included_links_string}`},
//             ]
//         });

//         console.log(response.choices[0].message.content);
//     }

//     // step 4: Parse data from HTML on website to get blog text
//     // This part is not yet implemented
// })

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
