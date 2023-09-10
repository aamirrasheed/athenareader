const crypto = require('crypto');

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


module.exports = {
    encodeURLforRTDB,
    weightedRandom
}