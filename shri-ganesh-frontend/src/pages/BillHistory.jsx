import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function BillHistory({ sales = [], onRefresh }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const dateParam = params.get('date'); // expects YYYY-MM-DD

  function formatDate(d) {
    return new Date(d).toLocaleString();
  }

  // if date param provided, filter sales to that date
  const filtered = React.useMemo(() => {
    if (!dateParam) return sales;
    return sales.filter(b => {
      const d = new Date(b.createdAt || b.date);
      const s = d.toISOString().slice(0, 10);
      return s === dateParam;
    });
  }, [sales, dateParam]);

  function clearFilter() {
    navigate('/bills');
  }

  const showingDate = dateParam ? new Date(dateParam) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Bill History</h2>
        <div className="flex items-center gap-3">
          {showingDate && (
            <div className="text-sm text-slate-500">Showing: <strong>{showingDate.toLocaleDateString()}</strong></div>
          )}
          {showingDate && <button onClick={clearFilter} className="text-sm px-3 py-1 bg-slate-100 rounded">Show all</button>}
          <button onClick={onRefresh} className="text-sm text-[#0D47A1]">Refresh</button>
        </div>
      </div>

      {filtered.length ? (
        <div className="space-y-3">
          {filtered.map(bill => (
            <Link key={bill._id} to={`/bills/${bill._id}`} className="block bg-white p-4 rounded-xl shadow hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    Bill #{bill.billNumber}
                    {bill.paymentStatus === 'pending' && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Pay Later</span>}
                  </div>
                  <div className="text-sm text-slate-500">{bill.customerName}</div>
                  {bill.phone && <div className="text-xs text-slate-400">{bill.phone}</div>}
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#0D47A1]">₹{bill.grandTotal?.toFixed(2) || '0.00'}</div>
                  <div className="text-xs text-slate-400">{formatDate(bill.createdAt)}</div>
                </div>
              </div>
              <div className="text-xs text-slate-600 border-t pt-2 mt-2">
                {bill.items?.length || 0} item(s) — Tap to view
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 bg-white rounded-xl">
          No bills{dateParam ? ' for selected date.' : ' yet. Create one from Bill Centre.'}
          <Link to="/bill" className="block mt-2 text-[#0D47A1] font-medium">Go to Bill</Link>
        </div>
      )}
    </div>
  );
}
