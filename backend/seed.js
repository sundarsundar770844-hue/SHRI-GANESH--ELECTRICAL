import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Product from './models/Product.js';
import Bill from './models/Bill.js';
import connectDB from './config/db.js';

const sampleProducts = [
  { name: 'LED Bulb 9W', brand: 'Philips', price: 120, stock: 50, category: 'Lighting', image: '' },
  { name: 'Ceiling Fan', brand: 'Havells', price: 1800, stock: 20, category: 'Fans', image: '' },
  { name: 'Switch Board', brand: 'Anchor', price: 250, stock: 35, category: 'Switches', image: '' },
  { name: 'Wire 1.5mm', brand: 'Polycab', price: 45, stock: 4, category: 'Wires', image: '' }
];

async function seed() {
  await connectDB();
  const existing = await User.findOne({ email: 'demo@demo.com' });
  if (existing) {
    await Product.deleteMany({ userId: existing._id });
  }
  let user = existing;
  if (!user) {
    const hashed = await bcrypt.hash('demo123', 10);
    user = await User.create({ email: 'demo@demo.com', name: 'Demo User', password: hashed });
    console.log('Created demo user: demo@demo.com / demo123');
  }
  await Product.insertMany(sampleProducts.map(p => ({ ...p, userId: user._id })));
  console.log('Sample products seeded for demo user');
  process.exit(0);
}
seed().catch(console.error);
