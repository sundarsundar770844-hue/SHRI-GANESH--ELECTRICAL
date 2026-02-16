import React from 'react';

export default function BillItem({ item, onInc, onDec, onRemove }) {
  const id = item._id || item.id;
  return (
    <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl shadow">
      <div className="min-w-0 flex-1">
        <div className="font-medium text-slate-900 truncate">{item.name}</div>
        <div className="text-xs text-slate-500">₹{item.price} each</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={() => onDec(id)} className="w-9 h-9 rounded-lg bg-slate-100 font-bold text-lg flex items-center justify-center">−</button>
        <div className="w-8 text-center font-medium">{item.qty}</div>
        <button onClick={() => onInc(id)} className="w-9 h-9 rounded-lg bg-slate-100 font-bold text-lg flex items-center justify-center">+</button>
        <div className="text-right min-w-[60px]">
          <div className="font-semibold">₹{(item.price * item.qty).toFixed(2)}</div>
          <button onClick={() => onRemove(id)} className="text-xs text-rose-600">Remove</button>
        </div>
      </div>
    </div>
  );
}
