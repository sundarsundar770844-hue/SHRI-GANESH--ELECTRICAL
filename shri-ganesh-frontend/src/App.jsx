import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { getProducts, getBills, createBill, deleteProduct, addProduct } from './api';
import Home from './pages/Home';
import Products from './pages/Products';
import Bill from './pages/Bill';
import BillHistory from './pages/BillHistory';
import BillDetail from './pages/BillDetail';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Navbar from './components/Navbar';
import Reports from './pages/Reports';
import './index.css';

function AppContent() {
  const { user, loading: authLoading, login, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) loadData();
    else setLoading(false);
  }, [user]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [prodsRes, billsRes] = await Promise.all([
        getProducts().catch(() => ({ data: null })),
        getBills().catch(() => ({ data: null }))
      ]);
      const prods = Array.isArray(prodsRes?.data) ? prodsRes.data : [];
      const bills = Array.isArray(billsRes?.data) ? billsRes.data : [];
      setProducts(prods);
      setSales(bills);
      if (prods.length === 0 && bills.length === 0 && (prodsRes?.data === null || billsRes?.data === null)) {
        setError('Start by adding products in Admin');
      } else {
        setError('');
      }
    } catch (e) {
      setError(e.message || 'Failed to load data');
      setProducts([]);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }

  function addToBill(product) {
    if (!product || product.stock <= 0) return;
    const id = product._id || product.id;
    setBillItems(prev => {
      const found = prev.find(i => (i._id || i.id) === id);
      if (found) {
        if (found.qty >= product.stock) return prev;
        return prev.map(i => (i._id || i.id) === id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function incQty(id) {
    const item = billItems.find(i => (i._id || i.id) === id);
    if (!item) return;
    const prod = products.find(p => (p._id || p.id) === id);
    if (prod && item.qty >= prod.stock) return;
    setBillItems(prev => prev.map(i => (i._id || i.id) === id ? { ...i, qty: i.qty + 1 } : i));
  }

  function decQty(id) {
    setBillItems(prev => {
      const item = prev.find(i => (i._id || i.id) === id);
      if (!item || item.qty === 1) return prev.filter(i => (i._id || i.id) !== id);
      return prev.map(i => (i._id || i.id) === id ? { ...i, qty: i.qty - 1 } : i);
    });
  }

  function removeItem(id) {
    setBillItems(prev => prev.filter(i => (i._id || i.id) !== id));
  }

  async function deleteProductFromStore(id) {
    try {
      await deleteProduct(id);
      loadData();
    } catch (e) {
      console.error(e);
    }
  }

  async function addProductToStore(data) {
    try {
      await addProduct(data);
      await loadData();
    } catch (e) {
      console.error('Add product failed:', e.response?.data || e.message || e);
      // Surface a user-visible error banner and rethrow so callers can react
      setError(e.response?.data?.error || e.message || 'Failed to add product');
      throw e;
    }
  }

  async function onSaveBill(customerName, phone, items, totalAmount, gst, grandTotal, onSuccess, paymentStatus = 'paid') {
    try {
      const payload = {
        customerName,
        phone,
        items: items.map(i => ({
          productId: i._id || i.id,
          name: i.name,
          brand: i.brand || '',
          price: i.price,
          qty: i.qty,
          total: i.price * i.qty
        })),
        totalAmount,
        gst,
        grandTotal,
        paymentStatus
      };
      const res = await createBill(payload);
      setSales(prev => [res.data, ...prev]);
      setBillItems([]);
      onSuccess?.(res.data);
    } catch (e) {
      throw e;
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-12 h-12 border-4 border-[#0D47A1] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={login} />} />
          <Route path="/signup" element={<Signup onLogin={login} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#0D47A1] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-28">
        {error && (
          <div className="bg-amber-100 text-amber-800 px-4 py-2 text-sm text-center">
            {error}
          </div>
        )}
        <div className="max-w-3xl mx-auto px-4 pt-8 pb-24">
          <Routes>
            <Route path="/" element={<Home products={products} sales={sales} onRefresh={loadData} />} />
            <Route path="/products" element={<Products products={products} onAdd={addToBill} onDelete={deleteProductFromStore} onAddProduct={addProductToStore} />} />
            <Route path="/bill" element={<Bill items={billItems} onInc={incQty} onDec={decQty} onRemove={removeItem} onSaveBill={onSaveBill} />} />
            <Route path="/bills" element={<BillHistory sales={sales} onRefresh={loadData} />} />
            <Route path="/bills/:id" element={<BillDetail products={products} onRefresh={loadData} />} />
            <Route path="/admin" element={<Admin products={products} setProducts={setProducts} sales={sales} onRefresh={loadData} />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/items" element={<Navigate to="/products" replace />} />
            <Route path="/cart" element={<Navigate to="/bill" replace />} />
            <Route path="/manage" element={<Navigate to="/admin" replace />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/signup" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Navbar user={user} onLogout={logout} />
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return <AppContent />;
}
