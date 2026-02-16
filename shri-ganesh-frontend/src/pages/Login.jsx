import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

// Whether a real Google Client ID was provided
const hasGoogleId = import.meta.env.VITE_GOOGLE_CLIENT_ID && !import.meta.env.VITE_GOOGLE_CLIENT_ID.startsWith('your-') && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'dummy.apps.googleusercontent.com';
// Only allow the demo / client-side fallback during local development
const allowDemo = import.meta.env.DEV;

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googlePending, setGooglePending] = useState(null); // { access_token, email, name, picture, isDemo }


  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // fetch profile so we can show a confirmation to the user before final sign-in
        const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } });
        const profile = await r.json();
        if (!profile?.email) {
          setError('Google did not return an email address');
          return;
        }
        setGooglePending({ access_token: tokenResponse.access_token, email: profile.email, name: profile.name, picture: profile.picture });
      } catch (err) {
        setError('Google sign-in failed');
      }
    },
    onError: () => setError('Google sign-in failed')
  });

  async function confirmGoogleLogin() {
    setError('');
    try {
      // demo flow
      if (googlePending?.isDemo) {
        await handleGoogleFallbackLogin();
        setGooglePending(null);
        return;
      }

      setLoading(true);
      const API = (await import('../api')).default;
      const res = await API.post('/auth/google', { access_token: googlePending.access_token });
      if (res.data?.token) {
        onLogin(res.data, res.data.token);
        navigate('/');
      } else {
        setError('Google sign-in failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Google sign-in failed');
    } finally {
      setGooglePending(null);
    }
  }

  function cancelGooglePending() {
    setGooglePending(null);
  }

  // Development-only fallback: demo account (disabled in production)
  async function handleGoogleFallbackLogin() {
    if (!allowDemo) {
      setError('Demo login is disabled on production');
      return;
    }
    setError('');
    onLogin({ _id: demoUser._id, email: demoUser.email, name: demoUser.name, token: demoUser.token }, demoUser.token);
    navigate('/');
    setLoading(false);
  }


  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await (await import('../api')).default.post('/auth/login', { email, password });
      onLogin(res.data, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[#0D47A1] text-center mb-2">Shri Ganesh Electricals</h1>
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-600 block mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 rounded-lg border" placeholder="your@email.com" />
            </div>
            <div className="relative">
              <label className="text-sm text-slate-600 block mb-1">Password</label>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="w-full pr-10 p-3 rounded-lg border" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700">
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.965 9.965 0 012.223-3.396M9.88 9.88A3 3 0 0114.12 14.12M6.1 6.1l11.8 11.8"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z"/></svg>
                )}
              </button>
            </div>
            <Link to="/forgot-password" className="block text-sm text-[#0D47A1]">Forgot password?</Link>
            {location.state?.fromSignup && <div className="text-emerald-600 text-sm">Account created — please sign in</div>}
            {error && <div className="text-rose-600 text-sm">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-[#0D47A1] text-white py-3 rounded-lg font-semibold disabled:opacity-70">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <p className="text-center text-sm text-slate-500">Don&apos;t have an account? <Link to="/signup" className="text-[#0D47A1] font-medium">Create account</Link></p>
          </form>
        </div>
      </div>

      {googlePending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={cancelGooglePending} />
          <div role="dialog" aria-modal="true" className="relative bg-white p-6 rounded-xl shadow-lg w-full max-w-sm z-50">
            <div className="flex items-center gap-3 mb-4">
              {googlePending.picture ? (
                <img src={googlePending.picture} alt="profile" className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">G</div>
              )}
              <div>
                <div className="font-semibold">{googlePending.name || googlePending.email}</div>
                <div className="text-xs text-slate-500">{googlePending.email}</div>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">Continue signing in with this Google account?</p>
            <div className="flex justify-end gap-2">
              <button onClick={cancelGooglePending} className="px-4 py-2 rounded bg-slate-200">Cancel</button>
              <button onClick={confirmGoogleLogin} disabled={loading} className="px-4 py-2 rounded bg-[#0D47A1] text-white">{loading ? 'Signing in...' : 'Continue'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
