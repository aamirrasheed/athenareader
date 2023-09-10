const crypto = require('crypto');
const fetch = require('node-fetch')

function encodeURLforRTDB(url) {
    return crypto.createHash('sha256').update(url).digest('hex');

}

function weightedRandom(prob) {
    let i, sum = 0, r = Math.random();
    for (i in prob) {
        sum += prob[i];
        if (r <= sum) return i;
    }
}


const UNABLE_TO_CALL_FUNCTION_ERROR = "Unable to scrape data from website"
const INVALID_URL_ERROR = "Invalid URL";

function getValidURL(given_url) {
    // first, check that the given_url has a . in it somewhere at least
    if(given_url.indexOf(".") === -1){
        return new Promise((resolve, reject) => reject(INVALID_URL_ERROR))
    }

    const options = {
        headers:  {
            'User-Agent': 'sendittomyemail-bot'
        }
    }
    // maybe it has http/https in the URL already!
    return fetch(given_url, options).then(res => {
        if (res.ok) {
            return given_url
        }
        else {
            throw new Error(INVALID_URL_ERROR)
        }
    })
    // try https
    .catch(e => {
        return fetch(`https://${given_url}`, options).then(res => {
            if (res.ok) {
                return `https://${given_url}`;
            }
            else {
                throw new Error(INVALID_URL_ERROR)
            }
        })
    })
    // try http
    .catch(e => {
        return fetch(`http://${given_url}`, options).then(res => {
            if (res.ok) {
                return `http://${given_url}`;
            }
            else {
                throw new Error(INVALID_URL_ERROR)
            }
        })
    })
    // try with www https
    .catch(e => {
        return fetch(`https://www.${given_url}`, options).then(res => {
            if (res.ok) {
                return `https://www.${given_url}`;
            }
            else {
                throw new Error(INVALID_URL_ERROR)
            }
        })
    })
    // try with www http
    .catch(e => {
        return fetch(`http://www.${given_url}`, options).then(res => {
            if (res.ok) {
                return `http://www.${given_url}`;
            }
            else {
                throw new Error(INVALID_URL_ERROR)
            }
        })
    })
}

module.exports = {
    encodeURLforRTDB,
    weightedRandom,
    getValidURL,
    INVALID_URL_ERROR,
    UNABLE_TO_CALL_FUNCTION_ERROR
}