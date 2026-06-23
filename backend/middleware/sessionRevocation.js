const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// In-memory blacklist for revoked tokens (use Redis in production)
const revokedTokens = new Set();

const revokeToken = (token) => {
  revokedTokens.add(token);
};

const isTokenRevoked = (token) => {
  return revokedTokens.has(token);
};

const sessionRevocationMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  if (isTokenRevoked(token)) {
    return res.status(401).json({ error: 'Token has been revoked' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { sessionRevocationMiddleware, revokeToken };
