const express = require('express');
const fs = require('fs');
const { privateKey, publicKey } = require('./keys'); // Assume keys are generated and stored in a separate file

const app = express();
app.use(express.json());

// Endpoint to get the public key
app.get('/public-key', (req, res) => {
  res.json({ publicKey: publicKey });
});

// Endpoint to receive encrypted messages
app.post('/submit-message', (req, res) => {
  const { encryptedMessage } = req.body;

  if (!encryptedMessage) {
    return res.status(400).json({ error: 'Encrypted message is required' });
  }

  try {
    const decryptedMessage = decryptMessage(encryptedMessage, privateKey);
    console.log('Decrypted Message:', decryptedMessage);
    res.json({ success: true });
  } catch (error) {
    console.error('Decryption failed:', error);
    res.status(500).json({ error: 'Failed to decrypt the message' });
  }
});

function decryptMessage(encryptedMessage, privateKey) {
  // Implement decryption using the private key
  // This is a placeholder for actual decryption logic
  return Buffer.from(encryptedMessage, 'base64').toString('utf8');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});