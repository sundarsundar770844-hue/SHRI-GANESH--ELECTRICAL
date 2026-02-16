# Backend Deployment to Vercel — Complete Guide

**GitHub Repository:** https://github.com/sundarsundar770844-hue/SHRI-GANESH--ELECTRICAL

## Overview
Your backend has been restructured for Vercel's serverless environment. Instead of running `app.listen()`, it exports an Express app as a handler.

## Files Changed

1. **api.js** — New file that exports the Express app configured for serverless
2. **server.js** — Updated to import from `api.js` for local development
3. **vercel.json** — Vercel configuration file for serverless deployment

## Step 1: Deploy to Vercel

### Option A: Deploy via Vercel CLI

```bash
# 1. Install Vercel CLI globally (if not already installed)
npm install -g vercel

# 2. In your backend folder, run:
cd backend
vercel
```

Follow the prompts:
- Link to your Vercel account
- Select a project name
- Accept defaults for the rest

### Option B: Deploy via GitHub (Recommended)

1. Your backend code is already on GitHub:
   **https://github.com/sundarsundar770844-hue/SHRI-GANESH--ELECTRICAL**
2. Go to https://vercel.com/new
3. Click "Import from Git" and select GitHub
4. Select your repository: `sundarsundar770844-hue/SHRI-GANESH--ELECTRICAL`
4. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install` (leave as is)
   - **Output Directory**: Leave empty
5. Click "Deploy"

## Step 2: Set Environment Variables in Vercel

After deployment, set these environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:

| Variable | Value | Example |
|----------|-------|---------|
| `MONGO_URI` | Your MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | A secure secret for JWT tokens | `your-random-secret-key-12345` |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID | `123456789-abc123.apps.googleusercontent.com` |

4. Click **Save**
5. Redeploy the project (Vercel will ask, click "Redeploy")

## Step 3: Get Your Backend API URL

After deployment:
1. Your Vercel backend URL will be: `https://your-vercel-project-name.vercel.app`
2. API endpoints will be: `https://your-vercel-project-name.vercel.app/api/...`

## Step 4: Update Frontend with Backend URL

In Netlify, set this environment variable:

```
VITE_API_URL = https://your-vercel-project-name.vercel.app/api
```

## Local Development

To run locally:

```bash
cd backend
npm install
npm run dev
```

Your backend will run on `http://localhost:5000`

## Troubleshooting

### "404: NOT_FOUND" Error
- **Cause**: Environment variables not set in Vercel or endpoint doesn't exist
- **Fix**: 
  1. Check MONGO_URI is set in Vercel settings
  2. Verify the endpoint path is correct (e.g., `/api/auth/login`)
  3. Redeploy the project

### "Cannot reach database"
- **Cause**: MONGO_URI is invalid or MongoDB is down
- **Fix**:
  1. Verify MongoDB Atlas connection string
  2. Check IP whitelist in MongoDB Atlas (allow 0.0.0.0/0 for Vercel)
  3. Test connection locally first

### "Internal Server Error" on Vercel
- **Cause**: Missing environment variables or JWT_SECRET not set
- **Fix**:
  1. Set all required environment variables in Vercel Settings
  2. Check Vercel function logs for details

### Testing the Backend

```bash
# Test health endpoint
curl https://your-vercel-url/api/health

# Should return:
# {"ok":true,"message":"Backend is running"}
```

## Files Structure

```
backend/
├── api.js                 ← Vercel serverless handler
├── vercel.json            ← Vercel configuration
├── server.js              ← Local development (updated)
├── package.json
├── routes/
│   ├── authRoutes.js
│   ├── billRoutes.js
│   ├── productRoutes.js
│   └── resetRoutes.js
├── controllers/
├── models/
├── middleware/
└── config/
```

## Summary

- ✅ Backend is now serverless-ready for Vercel
- ✅ Local development still works with `npm run dev`
- ✅ Environment variables are handled properly
- ✅ MongoDB connections are cached for performance

Your app is now ready for full deployment!

---

**GitHub Repository:** https://github.com/sundarsundar770844-hue/SHRI-GANESH--ELECTRICAL
