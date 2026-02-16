import React from 'react';

export default function ProductCard({ product, onAdd, onRemove }) {
  const id = product._id || product.id;
  const hasStock = product.stock > 0;
  const lowStock = product.stock < 5;
  const sold = product.totalSold || 0;

  return (
    <div className="bg-white rounded-xl shadow p-4 flex gap-4">
      <div className="flex-shrink-0 w-16 h-16 bg-slate-100 rounded-lg overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl text-slate-400">⚡</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-lg font-semibold text-slate-900 truncate">{product.name}</div>
        {product.brand && <div className="text-xs text-slate-500">{product.brand}</div>}
        <div className="text-sm text-slate-600 mt-1">₹{product.price}</div>
        <div className="flex gap-4 mt-1 text-xs">
          <span>Stock: <span className={lowStock ? 'text-rose-500 font-semibold' : 'text-slate-600'}>{product.stock}</span> pcs</span>
          <span>Sold: <span className="text-green-600 font-medium">{sold}</span> pcs</span>
        </div>
      </div>
      <div className="flex flex-col justify-end gap-2">
        <button
          onClick={() => onAdd(product)}
          disabled={!hasStock}
          className="bg-[#FFC107] text-slate-900 px-4 py-2 rounded-lg font-medium shadow-md hover:brightness-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
        >
          Add to Bill
        </button>
        {onRemove && (
          <button
            onClick={() => {
              if (confirm(`Remove ${product.name} from store?`)) onRemove(id);
            }}
            className="text-xs text-rose-600 hover:underline"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
