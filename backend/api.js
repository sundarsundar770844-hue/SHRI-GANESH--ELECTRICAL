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

// Middleware - MUST BE FIRST
app.use(cors({ origin: '*' }));
app.use(express.json());

// MongoDB connection cache
let mongoConnected = false;

const connectDB = async () => {
  if (mongoConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not set');
    }
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    mongoConnected = true;
  } catch (err) {
    console.error('MongoDB error:', err.message);
    mongoConnected = false;
    throw err;
  }
};

// Health check - NO DB REQUIRED
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'API running' });
});

// DB Connection middleware - BEFORE ROUTES
app.use('/api/auth', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ error: 'DB error' });
  }
});

app.use('/api/products', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ error: 'DB error' });
  }
});

app.use('/api/bills', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ error: 'DB error' });
  }
});

app.use('/api/reset', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ error: 'DB error' });
  }
});

// Mount routes AFTER middleware
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/reset', resetRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

export default app;

