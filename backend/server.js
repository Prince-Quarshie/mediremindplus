require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const caregiverRoutes = require('./routes/caregiverRoutes');
const medicationRoutes = require('./routes/medicationRoutes');

const app = express();

// FRONTEND_URL accepts one or more comma-separated browser origins.
// Example: https://your-app.vercel.app,http://localhost:5173
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

// Configure CORS for production and development.
const corsOptions = {
  origin(origin, callback) {
    // Requests without an Origin header (health checks, curl, server-to-server)
    // are not browser cross-origin requests and can proceed.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked request from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/caregivers', caregiverRoutes);
app.use('/api/medications', medicationRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'MediRemind+ API is running',
    dbStatus: require('mongoose').connection.readyState === 1 ? 'Connected' : 'Connecting/Disconnected',
  });
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;

// Global process error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start Express server immediately
app.listen(PORT, () => {
  console.log(`🚀 MediRemind+ Backend Server listening on port ${PORT}`);
  // Attempt DB Connection asynchronously
  connectDB();
});
