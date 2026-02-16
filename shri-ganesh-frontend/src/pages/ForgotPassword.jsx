import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await (await import('../api')).default.post('/auth/forgot-password', { email });
      setSent(true);
      if (res.data.resetToken) {
        setError(`Dev mode: Use this token to reset - ${res.data.resetToken}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-lg font-semibold text-[#0D47A1] mb-2">Check your email</h2>
          <p className="text-slate-600 text-sm mb-4">If an account exists for {email}, we&apos;ve sent a password reset link.</p>
          {error && <p className="text-amber-700 text-xs bg-amber-50 p-2 rounded mb-4">{error}</p>}
          <Link to="/reset-password" className="block text-[#0D47A1] font-medium">Or enter reset token</Link>
          <Link to="/login" className="block mt-4 text-slate-500 text-sm">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[#0D47A1] text-center mb-2">Forgot Password</h1>
        <p className="text-slate-500 text-center text-sm mb-6">Enter your email to get a reset link</p>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
          <div>
            <label className="text-sm text-slate-600 block mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 rounded-lg border" placeholder="your@email.com" />
          </div>
          {error && <div className="text-rose-600 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-[#0D47A1] text-white py-3 rounded-lg font-semibold disabled:opacity-70">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <Link to="/login" className="block text-center text-sm text-slate-500">Back to Login</Link>
        </form>
      </div>
    </div>
  );
}
