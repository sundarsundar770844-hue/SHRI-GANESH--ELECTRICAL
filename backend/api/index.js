import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import productRoutes from '../routes/productRoutes.js';
import billRoutes from '../routes/billRoutes.js';
import authRoutes from '../routes/authRoutes.js';
import resetRoutes from '../routes/resetRoutes.js';

const app = express();

// CORS & JSON middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

let dbConnected = false;

async function connectDB() {
  if (dbConnected && mongoose.connection.readyState === 1) return;
  
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI not set');
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    dbConnected = true;
  } catch (err) {
    console.error('DB:', err.message);
    dbConnected = false;
    throw err;
  }
}

// Health check (no DB needed)
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/', (req, res) => res.json({ message: 'API ok' }));

// Single middleware to connect DB for all /api routes
app.use('/api/', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch {
    res.status(503).json({ error: 'DB unavailable' });
  }
});

// Mount all routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/reset', resetRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

export default app;

