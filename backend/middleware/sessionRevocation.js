const sessionStore = require('../utils/sessionStore');

const sessionRevocationMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.sessionToken;
    if (!token) {
        return res.status(401).json({ error: 'No session token provided' });
    }

    // Check if token is revoked
    if (sessionStore.isRevoked(token)) {
        return res.status(401).json({ error: 'Session token has been revoked' });
    }

    // Attach token to request for later use
    req.sessionToken = token;
    next();
};

module.exports = sessionRevocationMiddleware;
