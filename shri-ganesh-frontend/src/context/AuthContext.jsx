import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('shri-ganesh-user');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setUser(data);
      } catch {
        localStorage.removeItem('shri-ganesh-user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    const u = { ...userData, token };
    setUser(u);
    localStorage.setItem('shri-ganesh-user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shri-ganesh-user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
