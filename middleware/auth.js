const jwt = require('jsonwebtoken');
const Role = require('../models/Role');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

const authorize = async (req, res, next) => {
  try {
    const role = await Role.findOne({ name: req.user.role });
    if (!role) {
      throw new Error();
    }
    req.role = role;
    next();
  } catch (error) {
    res.status(403).send({ error: 'You do not have permission to access this resource.' });
  }
};

module.exports = { authenticate, authorize };