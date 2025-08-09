const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Debug: Check if critical env vars are loaded
console.log('Environment Variables Status:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:3002',
    'https://ias-desk.vercel.app',
    'https://iasdesk-educational-platform-git-main-jyotish2002s-projects.vercel.app',
    'https://iasdesk-educational-platform-jyotish2002s-projects.vercel.app',
    /^https:\/\/iasdesk-educational-platform.*\.vercel\.app$/
  ],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/current-affairs', require('./routes/currentAffairs'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/teachers', require('./routes/teachers'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running!', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
});

// Handle root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'IASDesk Educational Platform API',
    version: '1.0.0',
    status: 'Active'
  });
});

// MongoDB Connection
let isConnected = false;

const connectDB = require('./config/database');
const createDefaultAdmin = require('./utils/createDefaultAdmin');

// Connect to database
connectDB().then(async () => {
  console.log('✅ MongoDB connected successfully');
  
  // Create default admin account if none exists
  await createDefaultAdmin();
  
  // Log payment mode
  console.log('🔴 PAYMENT MODE: LIVE - Real money transactions');
  console.log('💰 All payments will process actual money');
  
  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    console.log('🔴 LIVE PAYMENT SYSTEM ACTIVE');
  });
}).catch(err => {
  console.error('❌ Database connection failed:', err.message);
  process.exit(1);
});

// Export for Vercel
module.exports = app;