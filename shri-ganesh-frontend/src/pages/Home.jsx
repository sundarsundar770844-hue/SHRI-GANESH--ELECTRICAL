import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

export default function Home({ products = [], sales = [], onRefresh }) {
  const lowStock = products.filter(p => p.stock < 5);

  const todayTotal = useMemo(() => {
    const now = new Date();
    return sales
      .filter(s => {
        const d = new Date(s.createdAt || s.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
      })
      .reduce((sum, s) => sum + Number(s.grandTotal || s.totalAmount || 0), 0);
  }, [sales]);

  const todayCount = useMemo(() => {
    const now = new Date();
    return sales.filter(s => {
      const d = new Date(s.createdAt || s.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    }).length;
  }, [sales]);

  const todayDateStr = new Date().toISOString().slice(0,10);

  return (
    <div>
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/ganesh.png.webp" alt="Ganesh" className="w-12 h-12 rounded-lg" />
            <div>
              <h1 className="text-2xl font-bold text-[#0D47A1]">Shri Ganesh Electricals</h1>
              <p className="text-sm text-slate-500 mt-1">Welcome — ready to make a sale?</p>
            </div>
          </div>
          <div className="bg-[#FFC107] text-slate-900 px-3 py-2 rounded-lg font-semibold">Shop</div>
        </div>
      </header>

      <Link to={`/bills?date=${todayDateStr}`} className="block mb-6 bg-gradient-to-r from-amber-50 to-white p-4 rounded-xl shadow-sm border border-amber-100 hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Today&apos;s Sales — Tap to view details</div>
            <div className="text-2xl font-bold text-[#0D47A1]">₹{todayTotal.toFixed(2)}</div>
            <div className="text-xs text-slate-500 mt-1">{todayCount} bill{todayCount !== 1 ? 's' : ''}</div>
          </div>
          <div className="text-sm text-slate-500">View today →</div>
        </div>
      </Link>

      <section className="mb-6 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Low Stock Alerts</h2>
          {lowStock.length > 0 && (
            <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">{lowStock.length}</span>
          )}
        </div>
        {lowStock.length ? (
          <div className="space-y-3">
            {lowStock.map(p => (
              <Link key={p._id || p.id} to="/admin" className="flex items-center justify-between bg-rose-50 p-3 rounded-xl">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-rose-600">Stock: {p.stock}</div>
                </div>
                <div className="text-rose-600 font-semibold">Restock →</div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500">All good — no low stock items.</div>
        )}
      </section>

      <section>
        <h3 className="font-semibold mb-3">Quick Products</h3>
        <div className="grid grid-cols-2 gap-3">
          {products.slice(0, 4).map(p => (
            <Link key={p._id || p.id} to="/products" className="bg-white p-3 rounded-xl shadow text-sm hover:shadow-md transition">
              <div className="font-medium truncate">{p.name}</div>
              <div className="text-xs text-slate-500">₹{p.price} • Stock {p.stock}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
