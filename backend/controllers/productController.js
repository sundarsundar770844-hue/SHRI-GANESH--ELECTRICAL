import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { name, brand, price, stock, category, image } = req.body;
    const product = new Product({ userId: req.user._id, name, brand, price: Number(price), stock: Number(stock || 0), totalSold: 0, category: category || 'General', image: image || '' });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { stock: Number(stock) }, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
