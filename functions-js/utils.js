const crypto = require('crypto');

function encodeURLForRTDB(url) {
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

module.exports = {
    encodeURLforRTDB
}