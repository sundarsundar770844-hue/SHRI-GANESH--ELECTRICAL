import React, { useState } from 'react';
import { addProduct, updateProduct, deleteProduct, updateStock, resetData } from '../api';

export default function Admin({ products = [], setProducts, sales = [], onRefresh }) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('General');
  const [image, setImage] = useState('');
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);

  function resetForm() {
    setName('');
    setBrand('');
    setPrice('');
    setStock('');
    setCategory('General');
    setImage('');
    setEditing(null);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!name || !price) return;
    setSubmitting(true);
    try {
      if (editing) {
        await updateProduct(editing._id, { name, brand, price: Number(price), stock: Number(stock || 0), category, image });
      } else {
        await addProduct({ name, brand, price: Number(price), stock: Number(stock || 0), category, image });
      }
      await onRefresh();
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      await onRefresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleStockChange(id, delta) {
    const p = products.find(x => (x._id || x.id) === id);
    if (!p) return;
    const newStock = Math.max(0, (p.stock || 0) + delta);
    try {
      await updateStock(id, newStock);
      await onRefresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleReset() {
    if (!confirm('Reset ALL data? Products and bills will be cleared. Continue?')) return;
    setResetting(true);
    try {
      await resetData();
      await onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  }

  function startEdit(p) {
    setEditing(p);
    setName(p.name);
    setBrand(p.brand || '');
    setPrice(String(p.price));
    setStock(String(p.stock || 0));
    setCategory(p.category || 'General');
    setImage(p.image || '');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Admin</h2>
        <button onClick={handleReset} disabled={resetting} className="text-sm px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg font-medium">
          {resetting ? 'Resetting...' : 'Reset All'}
        </button>
      </div>

      <form onSubmit={onSubmit} className="bg-white p-4 rounded-xl shadow mb-6 space-y-3">
        <h3 className="font-semibold">{editing ? 'Edit' : 'Add'} Product</h3>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded border" placeholder="Product name *" required />
        <input value={brand} onChange={e => setBrand(e.target.value)} className="w-full p-2 rounded border" placeholder="Brand" />
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="p-2 rounded border" placeholder="Price *" required />
          <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="p-2 rounded border" placeholder="Stock" />
        </div>
        <input value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 rounded border" placeholder="Category" />
        <input value={image} onChange={e => setImage(e.target.value)} className="w-full p-2 rounded border" placeholder="Image URL" />
        <div className="flex gap-2">
          <button type="submit" disabled={submitting} className="flex-1 bg-[#0D47A1] text-white py-2 rounded font-semibold">
            {editing ? 'Update' : 'Add'}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-slate-200 rounded">Cancel</button>
          )}
        </div>
      </form>

      <h3 className="font-semibold mb-3">Products ({products.length})</h3>
      <div className="space-y-3">
        {products.map(p => {
          const lowStock = p.stock < 5;
          return (
            <div key={p._id} className={`flex items-center justify-between bg-white p-3 rounded-xl shadow ${lowStock ? 'border-l-4 border-rose-500' : ''}`}>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{p.name}</div>
                <div className="text-xs text-slate-500">₹{p.price} • Stock: <span className={lowStock ? 'text-rose-600 font-semibold' : ''}>{p.stock}</span></div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleStockChange(p._id, -1)} className="w-8 h-8 rounded bg-slate-100 font-bold">−</button>
                <span className="w-8 text-center">{p.stock}</span>
                <button onClick={() => handleStockChange(p._id, 1)} className="w-8 h-8 rounded bg-slate-100 font-bold">+</button>
                <button onClick={() => startEdit(p)} className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded">Edit</button>
                <button onClick={() => handleDelete(p._id)} className="px-2 py-1 text-sm bg-rose-100 text-rose-600 rounded">Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      {sales.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-3">Recent Bills</h3>
          <div className="space-y-2">
            {sales.slice(0, 5).map(b => (
              <div key={b._id} className="flex justify-between bg-white p-3 rounded-lg text-sm">
                <span>#{b.billNumber} - {b.customerName}</span>
                <span className="font-medium">₹{b.grandTotal?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
