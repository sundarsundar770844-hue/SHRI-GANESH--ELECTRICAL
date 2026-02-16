import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import User from '../models/User.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const user = await User.create({ email: email.toLowerCase(), password, name: name || '' });
    res.status(201).json({
      _id: user._id,
      email: user.email,
      name: user.name,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) return res.status(401).json({ error: 'Invalid email or password' });
    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });
    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { credential, access_token } = req.body;
    let payload;
    if (access_token) {
      const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${access_token}` } });
      const data = await r.json();
      if (!data.email) return res.status(400).json({ error: 'Email not from Google' });
      payload = { email: data.email, name: data.name, sub: data.sub };
    } else if (credential && process.env.GOOGLE_CLIENT_ID) {
      const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
      payload = ticket.getPayload();
    } else {
      return res.status(400).json({ error: 'Google token or GOOGLE_CLIENT_ID required' });
    }
    const email = payload.email?.toLowerCase();
    if (!email) return res.status(400).json({ error: 'Email not provided by Google' });
    let user = await User.findOne({ $or: [{ email }, { googleId: payload.sub }] });
    if (!user) {
      user = await User.create({
        email,
        name: payload.name || '',
        googleId: payload.sub,
        password: crypto.randomBytes(16).toString('hex')
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }
    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(401).json({ error: error.message || 'Google sign-in failed' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ message: 'If email exists, reset link sent' });
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 3600000);
    await user.save();
    // In production: send email with link containing token
    // For now, return token for demo (remove in production)
    res.json({ message: 'Reset link sent', resetToken: process.env.NODE_ENV === 'development' ? token : undefined });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password required' });
    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
    user.password = newPassword;
    user.resetToken = '';
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
