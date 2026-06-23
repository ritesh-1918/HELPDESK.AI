const express = require('express');
const router = express.Router();
const corsMiddleware = require('../middleware/cors');
const sessionRevocationMiddleware = require('../middleware/sessionRevocation');

// Apply CORS and session revocation to all sensitive routes
router.use(corsMiddleware);
router.use(sessionRevocationMiddleware);

// Example sensitive route
router.get('/admin/data', (req, res) => {
    res.json({ message: 'Sensitive data accessed' });
});

// Route to revoke a session token
router.post('/revoke', (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }
    const sessionStore = require('../utils/sessionStore');
    sessionStore.revoke(token);
    res.json({ message: 'Token revoked successfully' });
});

module.exports = router;
