const cors = require('cors');

const allowedOrigins = [
    'http://localhost:3000',
    'https://helpdesk.ai',
    'https://www.helpdesk.ai'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400 // 24 hours
};

module.exports = cors(corsOptions);
