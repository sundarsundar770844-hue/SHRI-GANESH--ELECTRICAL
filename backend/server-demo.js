/**
 * Demo server - in-memory with auth. Use MongoDB (server.js) for production.
 */
import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret';
let users = [];
let products = [];
let bills = [];
let productIdCounter = 1;
let billCounter = 1000;

const SAMPLE_PRODUCTS = [
  { name: 'LED Bulb 9W', brand: 'Philips', price: 120, stock: 50, category: 'Lighting', image: '' },
  { name: 'Ceiling Fan', brand: 'Havells', price: 1800, stock: 20, category: 'Fans', image: '' },
  { name: 'Switch Board', brand: 'Anchor', price: 250, stock: 35, category: 'Switches', image: '' },
  { name: 'Wire 1.5mm', brand: 'Polycab', price: 45, stock: 40, category: 'Wires', image: '' }
];

// Seed a demo user + sample products + sample bills for local demo server
const demoUser = { _id: 'u-demo', email: 'demo@demo.com', name: 'Demo User', password: bcrypt.hashSync('demo123', 10) };
users.push(demoUser);
SAMPLE_PRODUCTS.forEach((p) => {
  products.unshift({ _id: String(productIdCounter++), userId: demoUser._id, ...p, totalSold: 0 });
});

// create a few sample bills for the current month
const now = new Date();
const productSampleIds = products.filter(p => p.userId === demoUser._id).slice(0, 4).map(p => p._id);
const sampleBills = [
  { customerName: 'Ramesh', phone: '9876543210', items: [{ productId: productSampleIds[0], name: products[0].name, price: products[0].price, qty: 5, total: products[0].price * 5 }], totalAmount: products[0].price * 5, gst: 0, grandTotal: products[0].price * 5, paymentStatus: 'paid', createdAt: now },
  { customerName: 'Sita', phone: '9123456780', items: [{ productId: productSampleIds[1], name: products[1].name, price: products[1].price, qty: 2, total: products[1].price * 2 }, { productId: productSampleIds[2], name: products[2].name, price: products[2].price, qty: 3, total: products[2].price * 3 }], totalAmount: (products[1].price * 2) + (products[2].price * 3), gst: 0, grandTotal: (products[1].price * 2) + (products[2].price * 3), paymentStatus: 'paid', createdAt: now },
  { customerName: 'Gopal', phone: '', items: [{ productId: productSampleIds[3], name: products[3].name, price: products[3].price, qty: 10, total: products[3].price * 10 }], totalAmount: products[3].price * 10, gst: 0, grandTotal: products[3].price * 10, paymentStatus: 'paid', createdAt: now }
];

sampleBills.forEach(b => bills.unshift({ _id: 'b' + (billCounter++), userId: demoUser._id, billNumber: 'B' + (1000 + billCounter), ...b }));

const protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Not authorized' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    const user = users.find(u => u._id === decoded.id);
    if (!user) return res.status(401).json({ error: 'Not authorized' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Not authorized' });
  }
};

// In-memory saved reports for demo server
let savedReports = [];

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const existing = users.find(u => u.email === email.toLowerCase());
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = { _id: 'u' + Date.now(), email: email.toLowerCase(), name: name || '', password: hashed };
    users.push(user);
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ _id: user._id, email: user.email, name: user.name, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = users.find(u => u.email === email.toLowerCase());
    if (!user || !user.password) return res.status(401).json({ error: 'Invalid email or password' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ _id: user._id, email: user.email, name: user.name, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential, access_token } = req.body;
    let email, name, sub;
    if (access_token) {
      const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${access_token}` } });
      const data = await r.json();
      if (!data.email) return res.status(400).json({ error: 'Email not from Google' });
      email = data.email.toLowerCase();
      name = data.name || '';
      sub = data.sub;
    } else if (credential && process.env.GOOGLE_CLIENT_ID) {
      const { OAuth2Client } = await import('google-auth-library');
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
      const payload = ticket.getPayload();
      email = payload.email?.toLowerCase();
      name = payload.name || '';
      sub = payload.sub;
    } else return res.status(400).json({ error: 'Google token required' });
    let user = users.find(u => u.email === email || u.googleId === sub);
    if (!user) {
      user = { _id: 'u' + Date.now(), email, name, googleId: sub };
      users.push(user);
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ _id: user._id, email: user.email, name: user.name, token });
  } catch (e) {
    res.status(401).json({ error: e.message || 'Google sign-in failed' });
  }
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const user = users.find(u => u.email === email.toLowerCase());
  if (!user) return res.json({ message: 'If email exists, reset link sent' });
  const token = crypto.randomBytes(32).toString('hex');
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 3600000;
  res.json({ message: 'Reset link sent', resetToken: process.env.NODE_ENV === 'development' ? token : undefined });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password required' });
  const user = users.find(u => u.resetToken === token && u.resetTokenExpiry > Date.now());
  if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = '';
  user.resetTokenExpiry = null;
  res.json({ message: 'Password reset successful' });
});

app.get('/api/products', protect, (req, res) => {
  const list = products.filter(p => p.userId === req.user._id);
  res.json(list);
});

app.post('/api/products', protect, (req, res) => {
  const { name, brand, price, stock, category, image } = req.body;
  const p = { _id: String(productIdCounter++), userId: req.user._id, name, brand: brand || '', price: Number(price), stock: Number(stock || 0), totalSold: 0, category: category || 'General', image: image || '' };
  products.unshift(p);
  res.status(201).json(p);
});

app.put('/api/products/:id', protect, (req, res) => {
  const i = products.findIndex(p => p._id === req.params.id && p.userId === req.user._id);
  if (i < 0) return res.status(404).json({ error: 'Not found' });
  products[i] = { ...products[i], ...req.body, _id: products[i]._id, userId: products[i].userId };
  res.json(products[i]);
});

app.delete('/api/products/:id', protect, (req, res) => {
  const i = products.findIndex(p => p._id === req.params.id && p.userId === req.user._id);
  if (i < 0) return res.status(404).json({ error: 'Not found' });
  products.splice(i, 1);
  res.json({ message: 'Deleted' });
});

app.patch('/api/products/:id/stock', protect, (req, res) => {
  const i = products.findIndex(p => p._id === req.params.id && p.userId === req.user._id);
  if (i < 0) return res.status(404).json({ error: 'Not found' });
  products[i].stock = Number(req.body.stock ?? products[i].stock);
  res.json(products[i]);
});

app.get('/api/bills', protect, (req, res) => {
  res.json(bills.filter(b => b.userId === req.user._id));
});

// Monthly report (includes daily breakdown)
app.get('/api/bills/monthly', protect, (req, res) => {
  const m = Number(req.query.month) || (new Date().getMonth() + 1);
  const y = Number(req.query.year) || new Date().getFullYear();
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);
  const list = bills.filter(b => b.userId === req.user._id && new Date(b.createdAt) >= start && new Date(b.createdAt) < end && b.paymentStatus === 'paid');
  const totalRevenue = list.reduce((s, b) => s + (b.grandTotal || 0), 0);
  const totalBills = list.length;
  const items = list.flatMap(b => (b.items || []).map(i => ({ productId: i.productId || null, name: i.name || 'Unknown', qty: i.qty || 0, revenue: i.total || ((i.price || 0) * (i.qty || 0)), createdAt: b.createdAt })));
  const grouped = items.reduce((acc, it) => {
    const key = it.productId || it.name;
    if (!acc[key]) acc[key] = { productId: it.productId, name: it.name, qtySold: 0, revenue: 0 };
    acc[key].qtySold += it.qty;
    acc[key].revenue += it.revenue;
    return acc;
  }, {});
  const products = Object.values(grouped);
  const days = new Date(y, m, 0).getDate();
  const daily = Array.from({ length: days }, (_, i) => ({ day: i + 1, totalRevenue: 0, totalBills: 0 }));
  for (const b of list) {
    const d = new Date(b.createdAt).getDate();
    daily[d - 1].totalRevenue += (b.grandTotal || 0);
    daily[d - 1].totalBills += 1;
  }
  const recentBills = (list || [])
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8)
    .map(b => ({ billId: b._id, billNumber: b.billNumber, customerName: b.customerName || '', createdAt: b.createdAt, grandTotal: b.grandTotal, paymentStatus: b.paymentStatus }));
  res.json({ month: m, year: y, totalRevenue, totalBills, products, daily, recentBills });
});

// Save monthly report (demo in-memory)
app.post('/api/bills/monthly/save', protect, (req, res) => {
  const { month, year, finalize } = req.body;
  const m = Number(month) || (new Date().getMonth() + 1);
  const y = Number(year) || new Date().getFullYear();
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);
  const list = bills.filter(b => b.userId === req.user._id && new Date(b.createdAt) >= start && new Date(b.createdAt) < end && b.paymentStatus === 'paid');
  const totalRevenue = list.reduce((s, b) => s + (b.grandTotal || 0), 0);
  const totalBills = list.length;
  const items = list.flatMap(b => (b.items || []).map(i => ({ productId: i.productId || null, name: i.name || 'Unknown', qty: i.qty || 0, revenue: i.total || ((i.price || 0) * (i.qty || 0)), createdAt: b.createdAt })));
  const grouped = items.reduce((acc, it) => {
    const key = it.productId || it.name;
    if (!acc[key]) acc[key] = { productId: it.productId, name: it.name, qtySold: 0, revenue: 0 };
    acc[key].qtySold += it.qty;
    acc[key].revenue += it.revenue;
    return acc;
  }, {});
  const products = Object.values(grouped);
  const days = new Date(y, m, 0).getDate();
  const daily = Array.from({ length: days }, (_, i) => ({ day: i + 1, totalRevenue: 0, totalBills: 0 }));
  for (const b of list) {
    const d = new Date(b.createdAt).getDate();
    daily[d - 1].totalRevenue += (b.grandTotal || 0);
    daily[d - 1].totalBills += 1;
  }
  const recentBills = (list || [])
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8)
    .map(b => ({ billId: b._id, billNumber: b.billNumber, customerName: b.customerName || '', createdAt: b.createdAt, grandTotal: b.grandTotal, paymentStatus: b.paymentStatus }));
  const report = { id: 'r' + Date.now(), userId: req.user._id, month: m, year: y, totalRevenue, totalBills, products, daily, recentBills, finalized: !!finalize, finalizedAt: finalize ? new Date() : undefined, createdAt: new Date() };
  savedReports.unshift(report);
  res.status(201).json(report);
});

app.get('/api/bills/monthly/saved', protect, (req, res) => {
  res.json(savedReports.filter(r => r.userId === req.user._id));
});

app.get('/api/bills/monthly/saved/:id', protect, (req, res) => {
  const r = savedReports.find(x => x.id === req.params.id && x.userId === req.user._id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  res.json(r);
});

app.post('/api/bills/monthly/saved/:id/finalize', protect, (req, res) => {
  const r = savedReports.find(x => (x.id === req.params.id || x._id === req.params.id) && x.userId === req.user._id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  if (r.finalized) return res.status(400).json({ error: 'Already finalized' });
  r.finalized = true;
  r.finalizedAt = new Date();
  res.json(r);
});

app.get('/api/bills/daily', protect, (req, res) => {
  const today = new Date().toDateString();
  const list = bills.filter(b => b.userId === req.user._id && new Date(b.createdAt).toDateString() === today);
  const total = list.reduce((s, b) => s + b.grandTotal, 0);
  res.json({ count: list.length, total, bills: list });
});

app.get('/api/bills/:id', protect, (req, res) => {
  const bill = bills.find(b => b._id === req.params.id && b.userId === req.user._id);
  if (!bill) return res.status(404).json({ error: 'Not found' });
  res.json(bill);
});

app.post('/api/bills', protect, (req, res) => {
  const { customerName, phone, items, totalAmount, gst, grandTotal } = req.body;
  const paymentStatus = req.body.paymentStatus === 'pending' ? 'pending' : 'paid';
  const userBills = bills.filter(b => b.userId === req.user._id);
  const lastNum = userBills.length ? Math.max(...userBills.map(b => parseInt(b.billNumber.replace('B', ''), 10))) : 1000;
  const billNumber = 'B' + (lastNum + 1);
  const bill = { _id: 'b' + Date.now(), userId: req.user._id, billNumber, customerName, phone: phone || '', items: items || [], totalAmount: Number(totalAmount), gst: Number(gst || 0), grandTotal: Number(grandTotal), paymentStatus, createdAt: new Date() };
  if (paymentStatus !== 'pending') {
    for (const it of bill.items) {
      const p = products.find(x => x._id === it.productId);
      if (p) {
        const qty = it.qty || 1;
        p.stock = Math.max(0, (p.stock || 0) - qty);
        p.totalSold = (p.totalSold || 0) + qty;
      }
    }
  }
  bills.unshift(bill);
  res.status(201).json(bill);
});

app.put('/api/bills/:id', protect, (req, res) => {
  const i = bills.findIndex(b => b._id === req.params.id && b.userId === req.user._id);
  if (i < 0) return res.status(404).json({ error: 'Not found' });
  if (bills[i].paymentStatus !== 'pending') return res.status(400).json({ error: 'Only Pay Later bills editable' });
  const { customerName, phone, items, totalAmount, gst, grandTotal } = req.body;
  if (customerName !== undefined) bills[i].customerName = customerName;
  if (phone !== undefined) bills[i].phone = phone;
  if (items) bills[i].items = items;
  if (totalAmount !== undefined) bills[i].totalAmount = Number(totalAmount);
  if (gst !== undefined) bills[i].gst = Number(gst);
  if (grandTotal !== undefined) bills[i].grandTotal = Number(grandTotal);
  res.json(bills[i]);
});

app.patch('/api/bills/:id/paid', protect, (req, res) => {
  const i = bills.findIndex(b => b._id === req.params.id && b.userId === req.user._id);
  if (i < 0) return res.status(404).json({ error: 'Not found' });
  if (bills[i].paymentStatus === 'paid') return res.status(400).json({ error: 'Already paid' });
  for (const it of bills[i].items) {
    const p = products.find(x => x._id === it.productId);
    if (p) {
      const qty = it.qty || 1;
      p.stock = Math.max(0, (p.stock || 0) - qty);
      p.totalSold = (p.totalSold || 0) + qty;
    }
  }
  bills[i].paymentStatus = 'paid';
  res.json(bills[i]);
});

app.post('/api/reset', protect, (req, res) => {
  const uid = req.user._id;
  products = products.filter(p => p.userId !== uid);
  bills = bills.filter(b => b.userId !== uid);
  SAMPLE_PRODUCTS.forEach((sp) => {
    products.unshift({ _id: String(productIdCounter++), userId: uid, ...sp, totalSold: 0 });
  });
  res.json({ message: 'All data reset' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Demo server on http://localhost:${PORT} (auth enabled)`));
