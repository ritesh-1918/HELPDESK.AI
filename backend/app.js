const express = require('express');
const corsMiddleware = require('./middleware/cors');
const sessionRevocationMiddleware = require('./middleware/sessionRevocation');
const sensitiveRoutes = require('./routes/sensitiveRoutes');

const app = express();

// Global middleware
app.use(express.json());
app.use(corsMiddleware);

// Apply session revocation globally or selectively
app.use('/api/sensitive', sensitiveRoutes);

// Other routes...

module.exports = app;
