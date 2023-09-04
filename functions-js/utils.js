function encodeWebsiteURL(url) {
    url = url.replace(/:\/\//g, '%3A%2F%2F');
    return url.replace(/\./g, '%2E');
}

module.exports = {
    encodeWebsiteURL
}