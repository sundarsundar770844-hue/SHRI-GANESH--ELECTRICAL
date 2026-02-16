import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: '🏠', label: 'Home' },
  { to: '/products', icon: '🛍️', label: 'Products' },
  { to: '/bill', icon: '🧾', label: 'Bill' },
  { to: '/bills', icon: '📋', label: 'Bills' },
  { to: '/reports', icon: '📈', label: 'Reports' },
  { to: '/admin', icon: '⚙️', label: 'Admin' }
];

export default function Navbar({ user, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);
  const base = 'flex flex-col items-center justify-center gap-1 text-xs py-2 min-w-0 flex-1';
  const active = 'text-[#0D47A1] font-semibold';
  const inactive = 'text-slate-500';

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-3xl bg-white/95 backdrop-blur rounded-2xl shadow-lg p-1 flex items-center justify-between z-50">
      {navItems.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `${base} rounded-xl flex-1 ${isActive ? `${active} bg-amber-50` : inactive}`}
        >
          <span className="text-lg">{icon}</span>
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
      <div className="flex items-center gap-4">
        <img src="/ganesh.png.webp" alt="Logo" className="w-8 h-8 rounded-full" />
      </div>
      <div className="relative">
        <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-slate-100">
          <span className="text-lg">👤</span>
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b text-sm">
                <div className="font-medium truncate">{user?.name || user?.email}</div>
                <div className="text-xs text-slate-500 truncate">{user?.email}</div>
              </div>
              <button onClick={() => { onLogout(); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
