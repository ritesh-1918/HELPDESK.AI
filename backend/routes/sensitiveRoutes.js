const express = require('express');
const router = express.Router();
const { sessionRevocationMiddleware } = require('../middleware/sessionRevocation');

// Apply session revocation middleware to all sensitive routes
router.use(sessionRevocationMiddleware);

// Example sensitive route
router.get('/admin', (req, res) => {
  res.json({ message: 'Welcome admin', user: req.user });
});

router.post('/logout', (req, res) => {
  const { revokeToken } = require('../middleware/sessionRevocation');
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    revokeToken(token);
  }
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
