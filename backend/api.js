import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import billRoutes from './routes/billRoutes.js';
import authRoutes from './routes/authRoutes.js';
import resetRoutes from './routes/resetRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Connection (with caching for serverless)
let mongoConnected = false;

const connectDB = async () => {
  if (mongoConnected && mongoose.connection.readyState === 1) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable not set');
    }
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    mongoConnected = true;
    console.log('✓ MongoDB connected successfully');
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message);
    mongoConnected = false;
    throw err;
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Backend is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Shri Ganesh Electricals API is running' });
});

// Database connection middleware (runs before API routes)
app.use(async (req, res, next) => {
  // Skip DB connection for health check and root
  if (req.path === '/' || req.path === '/api/health') {
    return next();
  }
  
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    return res.status(503).json({
      error: 'Database connection failed',
      message: 'Backend service is temporarily unavailable'
    });
  }
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reset', resetRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

export default app;

