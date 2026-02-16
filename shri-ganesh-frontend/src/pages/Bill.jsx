import React, { useMemo, useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import BillItem from '../components/BillItem';
import UPIQR from '../components/UPIQR';

export default function Bill({ items, onInc, onDec, onRemove, onSaveBill }) {
  const [gstEnabled, setGstEnabled] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [savedBill, setSavedBill] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const invoiceRef = useRef();

  // Use saved bill totals when showing invoice; otherwise use current items
  const billItems = showInvoice && savedBill ? (savedBill.items || []) : items;

  const subtotal = useMemo(() => {
    if (showInvoice && savedBill) {
      // prefer explicit totalAmount from saved bill, fallback to summing items
      return Number(savedBill.totalAmount ?? (billItems.reduce((s, i) => s + ((i.total !== undefined ? i.total : (i.price || 0) * (i.qty || 0))), 0)));
    }
    return billItems.reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0);
  }, [showInvoice, savedBill, billItems]);

  const gst = showInvoice && savedBill ? Number(savedBill.gst ?? 0) : (gstEnabled ? +(subtotal * 0.18).toFixed(2) : 0);
  const grandTotal = showInvoice && savedBill ? Number(savedBill.grandTotal ?? +(subtotal + gst).toFixed(2)) : +(subtotal + gst).toFixed(2);

  async function handleSaveBill(isPayLater = false) {
    if (!items.length || grandTotal <= 0 || !customerName.trim()) {
      setErr('Enter customer name');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      await onSaveBill(customerName, phone, items, subtotal, gst, grandTotal, (bill) => {
        setSavedBill(bill);
        setShowInvoice(true);
      }, isPayLater ? 'pending' : 'paid');
    } catch (e) {
      setErr(e.response?.data?.error || e.message || 'Failed to save bill');
    } finally {
      setSaving(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleDownloadPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Shri Ganesh Electricals', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Electrical Equipment Supplier', 105, 22, { align: 'center' });
    doc.text(`Bill #${savedBill?.billNumber || 'N/A'}`, 105, 28, { align: 'center' });
    doc.text(`Customer: ${customerName}`, 20, 38);
    doc.text(`Phone: ${phone || 'N/A'}`, 20, 44);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 50);

    let y = 60;
    doc.setFontSize(10);
    billItems.forEach(it => {
      const name = (it.name || '').substring(0, 30);
      const qty = it.qty || 1;
      const price = it.price || 0;
      const total = (it.total !== undefined ? it.total : price * qty);
      doc.text(`${name}`, 20, y);
      doc.text(`${qty}`, 100, y);
      doc.text(`₹${price}`, 120, y);
      doc.text(`₹${total.toFixed(2)}`, 180, y);
      y += 7;
    });
    y += 5;
    doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 20, y);
    y += 7;
    if (gstEnabled) {
      doc.text(`GST (18%): ₹${gst.toFixed(2)}`, 20, y);
      y += 7;
    }
    doc.setFont(undefined, 'bold');
    doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 20, y + 5);
    doc.setFont(undefined, 'normal');
    doc.text('Thank you for your purchase!', 105, doc.internal.pageSize.height - 10, { align: 'center' });
    doc.save(`bill-${savedBill?.billNumber || 'invoice'}.pdf`);
  }

  function handleCloseInvoice() {
    setShowInvoice(false);
    setSavedBill(null);
    setGstEnabled(false);
    setCustomerName('');
    setPhone('');
  }

  if (showInvoice && savedBill) {
    return (
      <div>
        <div ref={invoiceRef} className="bg-white p-6 rounded-xl shadow mb-4 print:shadow-none">
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-[#0D47A1]">Shri Ganesh Electricals</div>
            <div className="text-sm text-slate-600">Electrical Equipment Supplier</div>
            <div className="text-xs text-slate-500 mt-2">Bill #{savedBill.billNumber} {savedBill.paymentStatus === 'pending' && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Pay Later</span>}</div>
          </div>

          <div className="flex justify-center gap-6 mb-6 no-print">
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Scan to Pay (UPI)</div>
              <UPIQR amount={grandTotal} size={100} />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded mb-6">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="font-medium">Customer:</span></div>
              <div className="text-right">{customerName}</div>
              <div><span className="font-medium">Phone:</span></div>
              <div className="text-right">{phone || 'N/A'}</div>
              <div><span className="font-medium">Date:</span></div>
              <div className="text-right">{new Date(savedBill.createdAt).toLocaleString()}</div>
            </div>
          </div>
          <table className="w-full mb-6 text-sm">
            <thead>
              <tr className="border-b-2 border-slate-400 bg-slate-50">
                <th className="text-left py-3 px-2">Item</th>
                <th className="text-center py-3 px-2">Qty</th>
                <th className="text-right py-3 px-2">Price</th>
                <th className="text-right py-3 px-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {billItems.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-200">
                  <td className="py-3 px-2">{item.name}</td>
                  <td className="text-center py-3 px-2">{item.qty}</td>
                  <td className="text-right py-3 px-2">₹{item.price?.toFixed(2) || '0.00'}</td>
                  <td className="text-right py-3 px-2">₹{((item.total || item.price * item.qty) || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t-2 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {gstEnabled && (
              <div className="flex justify-between text-sm">
                <span>GST (18%):</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-3 mt-3">
              <span>Grand Total:</span>
              <span className="text-[#0D47A1]">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 no-print">
          <button onClick={handlePrint} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
            🖨️ Print Bill
          </button>
          <button onClick={handleDownloadPDF} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold">
            📥 Download PDF
          </button>
          <button onClick={handleCloseInvoice} className="w-full bg-slate-600 text-white py-3 rounded-lg font-semibold">
            New Bill
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Bill Centre</h2>
        <div className="text-sm text-slate-500">Items: {items.length}</div>
      </div>

      <div className="mb-4 bg-white p-4 rounded-xl shadow flex items-center gap-4 no-print">
        <div className="text-center">
          <div className="text-xs text-slate-500 mb-1">Pay via UPI</div>
          <UPIQR size={90} />
        </div>
        <div className="text-sm text-slate-600 flex-1">
          <p className="font-medium">vickyvigneshc20-1@okicici</p>
          <p className="text-xs mt-1">Scan QR to pay</p>
        </div>
      </div>

      <div className="mb-4 bg-white p-4 rounded-xl shadow space-y-3">
        <div>
          <label className="text-xs text-slate-500 block mb-1">Customer Name *</label>
          <input
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            className="w-full p-3 rounded-lg border border-slate-200"
            placeholder="Enter customer name"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Phone</label>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full p-3 rounded-lg border border-slate-200"
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {items.length ? items.map(it => (
          <BillItem key={it._id || it.id} item={it} onInc={onInc} onDec={onDec} onRemove={onRemove} />
        )) : (
          <div className="text-sm text-slate-500 bg-white p-6 rounded-xl text-center">No items. Add from Products.</div>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow space-y-3">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={gstEnabled} onChange={e => setGstEnabled(e.target.checked)} />
            <span className="text-sm">Apply GST (18%)</span>
          </label>
          <span className="text-sm">₹{gst.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-2">
          <span>Grand Total</span>
          <span className="text-[#0D47A1]">₹{grandTotal.toFixed(2)}</span>
        </div>
        {err && <div className="text-rose-600 text-sm">{err}</div>}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleSaveBill(false)}
            disabled={!items.length || !customerName.trim() || saving}
            className="w-full bg-[#FFC107] text-slate-900 py-3 rounded-lg font-semibold disabled:opacity-50 hover:brightness-95"
          >
            {saving ? 'Saving...' : 'Save Bill & Pay Now'}
          </button>
          <button
            onClick={() => handleSaveBill(true)}
            disabled={!items.length || !customerName.trim() || saving}
            className="w-full bg-slate-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 hover:bg-slate-700"
          >
            Pay Later
          </button>
        </div>
      </div>
    </div>
  );
}
