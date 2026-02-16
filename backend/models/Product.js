import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  brand: { type: String, default: '' },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  totalSold: { type: Number, default: 0 },
  category: { type: String, default: 'General' },
  image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);
