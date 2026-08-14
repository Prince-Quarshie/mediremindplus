const mongoose = require('mongoose');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Helper to verify MongoDB readiness
const isDbReady = () => mongoose.connection.readyState === 1;

// @route POST /api/auth/signup
const signup = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        message: 'Database is connecting. If using MongoDB Atlas, ensure your IP address is whitelisted (0.0.0.0/0) in Atlas Network Access.',
      });
    }

    const { name, email, phone, password, role, location } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: 'Name, email, phone, password and role are required' });
    }

    if (!['patient', 'caregiver'].includes(role)) {
      return res.status(400).json({ message: 'Role must be patient or caregiver' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.create({ name, email, phone, password, role, location });
    const token = generateToken(user._id, user.role);

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        message: 'Database is connecting. If using MongoDB Atlas, ensure your IP address is whitelisted (0.0.0.0/0) in Atlas Network Access.',
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.status(200).json({ user: req.user });
};

module.exports = { signup, login, getMe };
