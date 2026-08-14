require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const caregiverRoutes = require('./routes/caregiverRoutes');
const medicationRoutes = require('./routes/medicationRoutes');

const app = express();

app.use(cors());
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
