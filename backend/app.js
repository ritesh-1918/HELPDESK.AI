const express = require('express');
const corsMiddleware = require('./middleware/cors');
const sensitiveRoutes = require('./routes/sensitiveRoutes');

const app = express();

// Apply CORS middleware globally
app.use(corsMiddleware);

// Parse JSON bodies
app.use(express.json());

// Mount sensitive routes
app.use('/api', sensitiveRoutes);

// Other routes...

module.exports = app;
