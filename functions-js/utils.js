const crypto = require('crypto');
const fetch = require('node-fetch')

function encodeURLforRTDB(url) {
    return crypto.createHash('sha256').update(url).digest('hex');

}
// function encodeUrl(url) {
//     url = url.replace(/:/g, '%AA');
//     url = url.replace(/\./g, '%AB');
//     url = url.replace(/\$/g, '%AC');
//     url = url.replace(/\[/g, '%AD');
//     url = url.replace(/\]/g, '%AE');
//     url = url.replace(/#/g, '%AF');
//     url = url.replace(/\//g, '%AG');
//     return url;
// }

// function decodeUrl(url) {
//     url = url.replace(/%AG/g, "/");
//     url = url.replace(/%AF/g, "#");
//     url = url.replace(/%AE/g, "]");
//     url = url.replace(/%AD/g, "[");
//     url = url.replace(/%AC/g, "$");
//     url = url.replace(/%AB/g, ".");
//     url = url.replace(/%AA/g, ":");
//     return url;
// }

const UNABLE_TO_CALL_FUNCTION_ERROR = "Unable to scrape data from website"
const INVALID_URL_ERROR = "Invalid URL";

function getValidURL(given_url) {
    const options = {
        headers:  {
            'User-Agent': 'sendittomyemail-bot'
        }
    }
    // if it has a protocol, check if it's valid and if not, return error
    if (given_url.startsWith('http://') || given_url.startsWith('https://')) {
        return fetch(given_url, options).then(res => {
            if (res.ok) {
                return given_url;
            }
            else {
                return INVALID_URL_ERROR;
            }
        })
    }
    // see if it starts with www already
    else if (given_url.startsWith('www.')) {
        // try with https
        return fetch(`https://${given_url}`, options).then(res => {
            if (res.ok) {
                return `https://${given_url}`;
            }
            else {
                // try with http
                return fetch(`http://${given_url}`, options).then(res => {
                    if (res.ok) {
                        return `http://${given_url}`;
                    }
                    else {
                        return INVALID_URL_ERROR;
                    }
                })
            }
        })
    }
    // doesn't have www or protocol, so we have to try with and without www, and with http and https
    else {
        // try with https
        return fetch(`https://www.${given_url}`, options).then(res => {
            if (res.ok) {
                return `https://www.${given_url}`;
            }
            else {
                // try with http
                return fetch(`http://www.${given_url}`, options).then(res => {
                    if (res.ok) {
                        return `http://www.${given_url}`;
                    }
                    else {
                        // try with https
                        return fetch(`https://${given_url}`, options).then(res => {
                            if (res.ok) {
                                return `https://${given_url}`;
                            }
                            else {
                                // try with http
                                return fetch(`http://${given_url}`, options).then(res => {
                                    if (res.ok) {
                                        return `http://${given_url}`;
                                    }
                                    else {
                                        return INVALID_URL_ERROR;
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
}

module.exports = {
    encodeURLforRTDB,
    getValidURL,
    INVALID_URL_ERROR,
    UNABLE_TO_CALL_FUNCTION_ERROR
}