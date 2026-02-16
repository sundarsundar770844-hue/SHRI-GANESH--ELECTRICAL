import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBillById, updateBill, markBillPaid } from '../api';

export default function BillDetail({ products = [], onRefresh }) {
    const handleGoToProducts = () => {
      if (bill && bill._id) {
        localStorage.setItem('paylater-edit-bill-id', bill._id);
      }
      window.location.href = '/products';
    };
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [editing, setEditing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [items, setItems] = useState([]);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If coming back from Products after adding, update backend
    if (typeof window !== 'undefined' && localStorage.getItem('paylater-refresh')) {
      localStorage.removeItem('paylater-refresh');
      // Find the product just added
      const paylaterEditBillId = localStorage.getItem('paylater-edit-bill-id');
      if (paylaterEditBillId && bill && bill._id === paylaterEditBillId) {
        // Find the last added product
        const lastAdded = products.find(p => {
          return !bill.items.some(i => (i.productId === p._id || i.id === p._id));
        });
        if (lastAdded) {
          // Add to items and update backend
          const newItems = [...bill.items, {
            productId: lastAdded._id || lastAdded.id,
            name: lastAdded.name,
            price: lastAdded.price,
            qty: 1,
            total: lastAdded.price
          }];
          updateBill(bill._id, {
            customerName: bill.customerName,
            phone: bill.phone,
            items: newItems,
            totalAmount: newItems.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0),
            gst: bill.gst,
            grandTotal: newItems.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0) + (bill.gst || 0)
          }).then(loadBill);
        } else {
          loadBill();
        }
      } else {
        loadBill();
      }
    } else {
      loadBill();
    }
  }, [id]);

  async function loadBill() {
    setLoading(true);
    try {
      const res = await getBillById(id);
      const b = res.data;
      setBill(b);
      setCustomerName(b.customerName || '');
      setPhone(b.phone || '');
      setGstEnabled((b.gst || 0) > 0);
      setItems((b.items || []).map(i => ({
        ...i,
        _id: i.productId,
        id: i.productId,
        qty: i.qty || 1
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const subtotal = items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
  const gst = gstEnabled ? +(subtotal * 0.18).toFixed(2) : 0;
  const grandTotal = +(subtotal + gst).toFixed(2);

  function incQty(idx) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, qty: (it.qty || 1) + 1 } : it));
  }

  function decQty(idx) {
    setItems(prev => prev.map((it, i) => {
      if (i !== idx) return it;
      const q = (it.qty || 1) - 1;
      return q <= 0 ? null : { ...it, qty: q };
    }).filter(Boolean));
  }

  function removeItem(idx) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    if (!bill || bill.paymentStatus !== 'pending') return;
    setSaving(true);
    try {
      const payload = {
        customerName,
        phone,
        items: items.map(i => ({
          productId: i._id || i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          total: (i.price || 0) * (i.qty || 1)
        })),
        totalAmount: subtotal,
        gst,
        grandTotal
      };
      await updateBill(bill._id, payload);
      setEditing(false);
      await loadBill();
      onRefresh?.();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkPaid() {
    if (!bill || bill.paymentStatus !== 'pending') return;
    setSaving(true);
    try {
      await markBillPaid(bill._id);
      await loadBill();
      onRefresh?.();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !bill) {
    return (
      <div className="py-8 text-center text-slate-500">Loading...</div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/bills')} className="text-[#0D47A1] font-medium">← Back</button>
        <span className="font-semibold">Bill #{bill.billNumber}</span>
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="font-medium">{bill.customerName}</div>
            {bill.phone && <div className="text-sm text-slate-500">{bill.phone}</div>}
            <div className="text-xs text-slate-400 mt-1">{new Date(bill.createdAt).toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-[#0D47A1]">₹{bill.grandTotal?.toFixed(2)}</div>
            {bill.paymentStatus === 'pending' && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Pay Later</span>
            )}
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-3">Items ({items.length})</h3>
          {editing && bill.paymentStatus === 'pending' && (
            <div className="flex gap-2 mb-3">
              <button
                className="bg-[#FFC107] text-slate-900 py-2 px-4 rounded-lg font-semibold"
                onClick={() => {
                  setItems(prev => [...prev, { name: '', price: 0, qty: 1 }]);
                }}
              >
                + Add Another Item
              </button>
              <button
                className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold"
                onClick={handleGoToProducts}
              >
                Go to Products
              </button>
            </div>
          )}
          <div className="space-y-2">
            {items.map((it, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-slate-500">₹{it.price} × {it.qty}</div>
                </div>
                <div className="flex items-center gap-2">
                  {editing && bill.paymentStatus === 'pending' && (
                    <>
                      <button onClick={() => decQty(idx)} className="w-8 h-8 rounded bg-slate-100">−</button>
                      <span className="w-6 text-center">{it.qty}</span>
                      <button onClick={() => incQty(idx)} className="w-8 h-8 rounded bg-slate-100">+</button>
                      <button onClick={() => removeItem(idx)} className="text-xs text-rose-600">Remove</button>
                    </>
                  )}
                  <div className="font-semibold">₹{((it.price || 0) * (it.qty || 1)).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {gst > 0 && (
            <div className="flex justify-between text-sm">
              <span>GST (18%)</span>
              <span>₹{gst.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg">
            <span>Grand Total</span>
            <span className="text-[#0D47A1]">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {bill.paymentStatus === 'pending' && (
          <div className="mt-4 flex gap-2">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#0D47A1] text-white py-2 rounded-lg font-semibold">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => { setEditing(false); loadBill(); }} className="px-4 py-2 bg-slate-200 rounded-lg">Cancel</button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="flex-1 bg-amber-500 text-white py-2 rounded-lg font-semibold">Edit Bill</button>
                <button onClick={handleMarkPaid} disabled={saving} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold">
                  {saving ? '...' : 'Mark as Paid'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
