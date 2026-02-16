import mongoose from 'mongoose';

const dailySchema = new mongoose.Schema({
  day: Number,
  totalRevenue: { type: Number, default: 0 },
  totalBills: { type: Number, default: 0 }
}, { _id: false });

const productSummarySchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  name: String,
  qtySold: Number,
  revenue: Number
}, { _id: false });

const billSummarySchema = new mongoose.Schema({
  billId: String,
  billNumber: String,
  customerName: String,
  createdAt: Date,
  grandTotal: Number,
  paymentStatus: String
}, { _id: false });

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  totalRevenue: { type: Number, default: 0 },
  totalBills: { type: Number, default: 0 },
  products: [productSummarySchema],
  daily: [dailySchema],
  recentBills: [billSummarySchema],
  finalized: { type: Boolean, default: false },
  finalizedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Report', reportSchema);
