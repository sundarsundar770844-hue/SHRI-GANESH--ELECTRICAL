import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import billRoutes from './routes/billRoutes.js';
import authRoutes from './routes/authRoutes.js';
import resetRoutes from './routes/resetRoutes.js';

const connectDB = async () => {
	try {
		if (!process.env.MONGO_URI) throw new Error('MONGO_URI not set in environment');
		await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
		console.log('MongoDB connected successfully');
	} catch (err) {
		console.error('MongoDB connection error:', err.message);
		process.exit(1);
	}
};

const startServer = async () => {
	await connectDB();
	const app = express();
	app.use(cors());
	app.use(express.json());

	app.use('/api/products', productRoutes);
	app.use('/api/bills', billRoutes);
	app.use('/api/auth', authRoutes);
	app.use('/api/reset', resetRoutes);

	app.get('/api/health', (req, res) => res.json({ ok: true }));

	const PORT = process.env.PORT || 5000;
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
