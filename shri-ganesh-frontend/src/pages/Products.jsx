import React, { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';

export default function Products({ products = [], onAdd, onDelete, onAddProduct }) {
    // Check if we are editing a PayLater bill
    const paylaterEditBillId = typeof window !== 'undefined' ? localStorage.getItem('paylater-edit-bill-id') : null;

    // Wrap onAdd to redirect after adding
    const handleAdd = async (product) => {
      if (paylaterEditBillId) {
        try {
          // Use API utility if available
          const API = (await import('../api')).default;
          // Fetch bill detail
          const billRes = await API.get(`/bills/${paylaterEditBillId}`);
          const bill = billRes.data;
          // Add product to items
          const newItems = [...bill.items, {
            productId: product._id || product.id,
            name: product.name,
            price: product.price,
            qty: 1,
            total: product.price
          }];
          // Update bill
          await API.put(`/bills/${paylaterEditBillId}`, {
            customerName: bill.customerName,
            phone: bill.phone,
            items: newItems,
            totalAmount: newItems.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0),
            gst: bill.gst,
            grandTotal: newItems.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0) + (bill.gst || 0)
          });
        } catch (e) {
          await onAdd(product);
        }
        localStorage.removeItem('paylater-edit-bill-id');
        localStorage.setItem('paylater-refresh', '1');
        window.location.href = `/bills/${paylaterEditBillId}`;
      } else {
        await onAdd(product);
      }
    };
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [cat, setCat] = useState('General');
  const [submitting, setSubmitting] = useState(false);
  const [listView, setListView] = useState(false);
  const [addError, setAddError] = useState('');

  // Warn when frontend is deployed but still pointing to localhost API
  const apiPointsToLocalhostOnProd =
    (import.meta.env.VITE_API_URL || '').startsWith('http://localhost') &&
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost';

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category || 'General'))].filter(Boolean).sort();
    return ['', ...cats];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q));
    }
    if (category) {
      list = list.filter(p => (p.category || 'General') === category);
    }
    return list;
  }, [products, search, category]);

  async function handleAddProduct(e) {
    e.preventDefault();
    if (!name || !price) return;
    setSubmitting(true);
    setAddError('');
    try {
      await onAddProduct({ name, brand, price: Number(price), stock: Number(stock || 0), category: cat });
      setName('');
      setBrand('');
      setPrice('');
      setStock('');
      setCat('General');
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add product:', err.response?.data || err.message || err);
      setAddError(err.response?.data?.error || err.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Products</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setListView(!listView)} className="text-xs px-2 py-1 rounded bg-slate-100">
            {listView ? 'Cards' : 'List'}
          </button>
          <span className="text-sm text-slate-500">Available: {filtered.length}</span>
        </div>
      </div>

      {onAddProduct && (
        <div className="mb-4">
          {showAddForm ? (
            <form onSubmit={handleAddProduct} className="bg-white p-4 rounded-xl shadow space-y-3">
              <h3 className="font-semibold">Add New Product</h3>

              {apiPointsToLocalhostOnProd && (
                <div className="mb-2 p-2 bg-amber-50 border-l-4 border-amber-400 text-amber-800 text-sm rounded">
                  Warning: frontend is configured to use the local API (http://localhost). Adding a product will fail on the live site — set <code>VITE_API_URL</code> in Netlify environment variables to your backend URL.
                </div>
              )}

              <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded border" placeholder="Product name *" required />
              <input value={brand} onChange={e => setBrand(e.target.value)} className="w-full p-2 rounded border" placeholder="Brand" />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="p-2 rounded border" placeholder="Price *" required />
                <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="p-2 rounded border" placeholder="Stock" />
              </div>
              <input value={cat} onChange={e => setCat(e.target.value)} className="w-full p-2 rounded border" placeholder="Category" />
              {addError && <div className="text-rose-600 text-sm">{addError}</div>}
              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="flex-1 bg-[#0D47A1] text-white py-2 rounded font-semibold">Add</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-slate-200 rounded">Cancel</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowAddForm(true)} className="w-full bg-[#FFC107] text-slate-900 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
              + Add Product
            </button>
          )}
        </div>
      )}

      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full p-3 rounded-xl border border-slate-200 text-sm"
        />
      </div>

      <div className="mb-4">
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full p-3 rounded-xl border border-slate-200 text-sm"
        >
          <option value="">All Categories</option>
          {categories.filter(c => c).map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length ? (
          listView ? (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-left py-3 px-3">Product</th>
                    <th className="text-left py-3 px-3">Brand</th>
                    <th className="text-right py-3 px-3">Price</th>
                    <th className="text-right py-3 px-3">Stock</th>
                    <th className="text-right py-3 px-3">Sold</th>
                    <th className="text-center py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p._id || p.id} className="border-b border-slate-100">
                      <td className="py-3 px-3 font-medium">{p.name}</td>
                      <td className="py-3 px-3 text-slate-500">{p.brand || '-'}</td>
                      <td className="py-3 px-3 text-right">₹{p.price}</td>
                      <td className={`py-3 px-3 text-right font-medium ${p.stock < 5 ? 'text-rose-600' : ''}`}>{p.stock}</td>
                      <td className="py-3 px-3 text-right text-green-600">{(p.totalSold || 0)}</td>
                      <td className="py-3 px-3">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => handleAdd(p)} disabled={p.stock <= 0} className="px-2 py-1 bg-[#FFC107] rounded text-xs font-medium disabled:opacity-50">Add</button>
                          {onDelete && <button onClick={() => confirm(`Remove ${p.name}?`) && onDelete(p._id || p.id)} className="px-2 py-1 text-rose-600 text-xs">Remove</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            filtered.map(p => (
              <ProductCard key={p._id || p.id} product={p} onAdd={handleAdd} onRemove={onDelete} />
            ))
          )
        ) : (
          <div className="text-center py-8 text-slate-500">No products found. Add one above.</div>
        )}
      </div>
    </div>
  );
}
