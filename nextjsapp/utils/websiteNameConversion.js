
function extractSchemeAndHost(url) {
    const urlObj = new URL(url);
    return urlObj.protocol + "//" + urlObj.hostname;
}

function encodeWebsiteURL(url) {
    url = url.replace(/:\/\//g, '%3A%2F%2F');
    return url.replace(/\./g, '%2E');
}

function decodeWebsiteURL(encodedUrl) {
    encodedUrl = encodedUrl.replace(/%3A%2F%2F/g, '://');
    encodedUrl = encodedUrl.replace(/%2E/g, '.');
    return encodedUrl;
}

export {
    encodeWebsiteURL,
    decodeWebsiteURL,
    extractSchemeAndHost
}