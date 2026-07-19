const fs = require('fs');

const publicKey = fs.readFileSync('publicKey.pem', 'utf8');
const privateKey = fs.readFileSync('privateKey.pem', 'utf8');

module.exports = { publicKey, privateKey };