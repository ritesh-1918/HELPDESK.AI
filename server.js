const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

// Simulated user roles and permissions
const users = {
  admin: { role: 'Admin' },
  agent: { role: 'Agent' },
  employee: { role: 'Employee' }
};

// Secret key for JWT
const secretKey = 'your_secret_key';

// Middleware to verify JWT token and extract user role
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Middleware to check user role
function checkRole(role) {
  return (req, res, next) => {
    if (req.user.role!== role) {
      return res.status(403).send({ message: 'Access denied' });
    }
    next();
  };
}

// Admin-only route
app.get('/admin', authenticateToken, checkRole('Admin'), (req, res) => {
  res.send({ message: 'Welcome, Admin!' });
});

// Agent-only route
app.get('/agent', authenticateToken, checkRole('Agent'), (req, res) => {
  res.send({ message: 'Welcome, Agent!' });
});

// Employee-only route
app.get('/employee', authenticateToken, checkRole('Employee'), (req, res) => {
  res.send({ message: 'Welcome, Employee!' });
});

// Public route
app.get('/', (req, res) => {
  res.send({ message: 'Welcome, Guest!' });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});