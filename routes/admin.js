const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(authorize);

router.get('/dashboard', (req, res) => {
  if (req.role.name === 'admin') {
    // render admin dashboard
  } else {
    res.status(403).send({ error: 'You do not have permission to access this resource.' });
  }
});

module.exports = router;