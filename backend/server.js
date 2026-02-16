import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './api.js';

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
	const PORT = process.env.PORT || 5000;
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
