import Product from '../models/Product.js';
import Bill from '../models/Bill.js';

const SAMPLE_PRODUCTS = [
  { name: 'LED Bulb 9W', brand: 'Philips', price: 120, stock: 50, category: 'Lighting', image: '' },
  { name: 'Ceiling Fan', brand: 'Havells', price: 1800, stock: 20, category: 'Fans', image: '' },
  { name: 'Switch Board', brand: 'Anchor', price: 250, stock: 35, category: 'Switches', image: '' },
  { name: 'Wire 1.5mm', brand: 'Polycab', price: 45, stock: 4, category: 'Wires', image: '' }
];

export const resetData = async (req, res) => {
  try {
    const userId = req.user._id;
    await Product.deleteMany({ userId });
    await Bill.deleteMany({ userId });
    await Product.insertMany(SAMPLE_PRODUCTS.map(p => ({ ...p, userId, totalSold: 0 })));
    res.json({ message: 'All data reset' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
