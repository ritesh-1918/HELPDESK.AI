const { generateKeyPairSync } = require('crypto');

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type:'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

console.log('Public Key:', publicKey);
console.log('Private Key:', privateKey);

// Save the keys to a file or environment variables
fs.writeFileSync('publicKey.pem', publicKey);
fs.writeFileSync('privateKey.pem', privateKey);