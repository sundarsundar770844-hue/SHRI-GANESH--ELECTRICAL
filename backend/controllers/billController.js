import Bill from '../models/Bill.js';
import Product from '../models/Product.js';

const generateBillNumber = async (userId) => {
  const lastBill = await Bill.findOne({ userId }).sort({ createdAt: -1 });
  const num = lastBill ? parseInt(lastBill.billNumber.replace('B', ''), 10) + 1 : 1001;
  return `B${num}`;
};

export const createBill = async (req, res) => {
  try {
    const { customerName, phone, items, totalAmount, gst, grandTotal, paymentStatus } = req.body;
    const isPayLater = paymentStatus === 'pending';
    const billNumber = await generateBillNumber(req.user._id);
    const billItems = items || [];
    if (!isPayLater) {
      for (const it of billItems) {
        if (it.productId) {
          const p = await Product.findById(it.productId);
          if (p) {
            const qty = it.qty || 1;
            p.stock = Math.max(0, (p.stock || 0) - qty);
            p.totalSold = (p.totalSold || 0) + qty;
            await p.save();
          }
        }
      }
    }
    const bill = new Bill({
      userId: req.user._id,
      billNumber,
      customerName,
      phone: phone || '',
      items: billItems,
      totalAmount: Number(totalAmount),
      gst: Number(gst || 0),
      grandTotal: Number(grandTotal),
      paymentStatus: isPayLater ? 'pending' : 'paid'
    });
    await bill.save();
    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBills = async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, userId: req.user._id });
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDailySales = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bills = await Bill.find({ userId: req.user._id, createdAt: { $gte: today } });
    const total = bills.reduce((sum, b) => sum + b.grandTotal, 0);
    res.json({ count: bills.length, total, bills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/bills/monthly?month=MM&year=YYYY
export const getMonthlyReport = async (req, res) => {
  try {
    const m = parseInt(req.query.month, 10);
    const y = parseInt(req.query.year, 10);
    const now = new Date();
    const month = Number.isFinite(m) && m >= 1 && m <= 12 ? m : (now.getMonth() + 1);
    const year = Number.isFinite(y) && y > 1970 ? y : now.getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    // find paid bills in the month
    const bills = await Bill.find({ userId: req.user._id, createdAt: { $gte: start, $lt: end }, paymentStatus: 'paid' });
    const totalRevenue = bills.reduce((s, b) => s + (b.grandTotal || 0), 0);
    const totalBills = bills.length;

    // aggregate product-wise totals from bill items
    const items = bills.flatMap(b => (b.items || []).map(i => ({ productId: i.productId ? String(i.productId) : null, name: i.name || 'Unknown', qty: i.qty || 0, revenue: i.total || ((i.price || 0) * (i.qty || 0)), createdAt: b.createdAt })));

    const grouped = items.reduce((acc, it) => {
      const key = it.productId || it.name;
      if (!acc[key]) acc[key] = { productId: it.productId, name: it.name, qtySold: 0, revenue: 0 };
      acc[key].qtySold += it.qty;
      acc[key].revenue += it.revenue;
      return acc;
    }, {});

    const products = Object.values(grouped).sort((a, b) => b.revenue - a.revenue);

    // build daily breakdown
    const daysInMonth = new Date(year, month, 0).getDate();
    const daily = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, totalRevenue: 0, totalBills: 0 }));
    for (const b of bills) {
      const d = new Date(b.createdAt).getDate();
      daily[d - 1].totalRevenue += (b.grandTotal || 0);
      daily[d - 1].totalBills += 1;
    }

    const recentBills = (bills || [])
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8)
      .map(b => ({ billId: b._id, billNumber: b.billNumber, customerName: b.customerName || '', createdAt: b.createdAt, grandTotal: b.grandTotal, paymentStatus: b.paymentStatus }));

    res.json({ month, year, totalRevenue, totalBills, products, daily, recentBills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Save monthly report to DB (supports optional finalize flag)
import Report from '../models/Report.js';
export const saveMonthlyReport = async (req, res) => {
  try {
    const { month, year, finalize } = req.body;
    const m = Number(month);
    const y = Number(year);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);
    const bills = await Bill.find({ userId: req.user._id, createdAt: { $gte: start, $lt: end }, paymentStatus: 'paid' });

    const totalRevenue = bills.reduce((s, b) => s + (b.grandTotal || 0), 0);
    const totalBills = bills.length;

    const items = bills.flatMap(b => (b.items || []).map(i => ({ productId: i.productId ? String(i.productId) : null, name: i.name || 'Unknown', qty: i.qty || 0, revenue: i.total || ((i.price || 0) * (i.qty || 0)), createdAt: b.createdAt })));
    const grouped = items.reduce((acc, it) => {
      const key = it.productId || it.name;
      if (!acc[key]) acc[key] = { productId: it.productId, name: it.name, qtySold: 0, revenue: 0 };
      acc[key].qtySold += it.qty;
      acc[key].revenue += it.revenue;
      return acc;
    }, {});
    const products = Object.values(grouped);

    const daysInMonth = new Date(y, m, 0).getDate();
    const daily = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, totalRevenue: 0, totalBills: 0 }));
    for (const b of bills) {
      const d = new Date(b.createdAt).getDate();
      daily[d - 1].totalRevenue += (b.grandTotal || 0);
      daily[d - 1].totalBills += 1;
    }

    const recentBills = (bills || [])
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8)
      .map(b => ({ billId: b._id, billNumber: b.billNumber, customerName: b.customerName || '', createdAt: b.createdAt, grandTotal: b.grandTotal, paymentStatus: b.paymentStatus }));

    const reportData = { userId: req.user._id, month: m, year: y, totalRevenue, totalBills, products, daily, recentBills, finalized: !!finalize, finalizedAt: finalize ? new Date() : undefined };
    const report = await Report.create(reportData);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const finalizeSavedReport = async (req, res) => {
  try {
    const r = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!r) return res.status(404).json({ error: 'Report not found' });
    if (r.finalized) return res.status(400).json({ error: 'Report already finalized' });
    r.finalized = true;
    r.finalizedAt = new Date();
    await r.save();
    res.json(r);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listSavedReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSavedReportById = async (req, res) => {
  try {
    const r = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!r) return res.status(404).json({ error: 'Report not found' });
    res.json(r);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, userId: req.user._id });
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    if (bill.paymentStatus !== 'pending') return res.status(400).json({ error: 'Only Pay Later bills can be edited' });
    const { customerName, phone, items, totalAmount, gst, grandTotal } = req.body;
    const billItems = (items || bill.items).map(i => ({
      ...i,
      total: (i.price || 0) * (i.qty || 1)
    }));
    const sub = billItems.reduce((s, i) => s + i.total, 0);
    const gstVal = gst !== undefined ? Number(gst) : bill.gst;
    const total = Number(totalAmount ?? sub);
    const gTotal = Number(grandTotal ?? total + gstVal);
    bill.customerName = customerName ?? bill.customerName;
    bill.phone = phone ?? bill.phone;
    bill.items = billItems;
    bill.totalAmount = total;
    bill.gst = gstVal;
    bill.grandTotal = gTotal;
    await bill.save();
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markBillPaid = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, userId: req.user._id });
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    if (bill.paymentStatus === 'paid') return res.status(400).json({ error: 'Bill already paid' });
    for (const it of bill.items) {
      if (it.productId) {
        const p = await Product.findById(it.productId);
        if (p) {
          const qty = it.qty || 1;
          p.stock = Math.max(0, (p.stock || 0) - qty);
          p.totalSold = (p.totalSold || 0) + qty;
          await p.save();
        }
      }
    }
    bill.paymentStatus = 'paid';
    await bill.save();
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
