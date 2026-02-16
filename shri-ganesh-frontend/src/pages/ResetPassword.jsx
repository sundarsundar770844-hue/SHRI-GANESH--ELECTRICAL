import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await (await import('../api')).default.post('/auth/reset-password', { token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-lg font-semibold text-green-600 mb-2">Password reset!</h2>
          <p className="text-slate-600 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[#0D47A1] text-center mb-2">Reset Password</h1>
        <p className="text-slate-500 text-center text-sm mb-6">Enter token and new password</p>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
          <div>
            <label className="text-sm text-slate-600 block mb-1">Reset Token</label>
            <input type="text" value={token} onChange={e => setToken(e.target.value)} required className="w-full p-3 rounded-lg border" placeholder="Token from email" />
          </div>
          <div>
            <label className="text-sm text-slate-600 block mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} className="w-full p-3 rounded-lg border" placeholder="Min 6 characters" />
          </div>
          {error && <div className="text-rose-600 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-[#0D47A1] text-white py-3 rounded-lg font-semibold disabled:opacity-70">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          <Link to="/login" className="block text-center text-sm text-slate-500">Back to Login</Link>
        </form>
      </div>
    </div>
  );
}
