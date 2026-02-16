# Complete Vercel Deployment Guide (Frontend + Backend)

**GitHub Repository:** https://github.com/sundarsundar770844-hue/SHRI-GANESH--ELECTRICAL

## Overview
Deploy both frontend and backend to Vercel:
- **Frontend:** React app
- **Backend:** Node.js Express API
- **Database:** MongoDB Atlas

---

## Step 1: Deploy Backend to Vercel

### 1.1 Go to Vercel

1. Visit https://vercel.com/new
2. Click **Import from Git** → Select GitHub
3. Authorize GitHub access

### 1.2 Select Repository

1. Search for: `SHRI-GANESH--ELECTRICAL`
2. Click **Import**

### 1.3 Configure Backend Project

**Project name:** (e.g., `shri-ganesh-api`)

**Framework:** Other (since it's Node.js Express)

**Root Directory:** Select and set to `backend`

**Build Command:** Leave default (npm will handle it)

**Environment Variables:**

Add these three variables:

| Name | Value | Example |
|------|-------|---------|
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority` |
| `JWT_SECRET` | Any random secret string | `your-secret-key-12345` |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID | `123456789-abc123.apps.googleusercontent.com` |

### 1.4 Deploy Backend

Click **Deploy** and wait 2-3 minutes.

**After deployment:**
- You'll get a URL like: `https://shri-ganesh-api.vercel.app`
- Test it: https://shri-ganesh-api.vercel.app/api/health
- Should return: `{"ok":true}`

**Copy this URL!** You'll need it for the frontend.

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Add Another Project

1. Go back to https://vercel.com
2. Click **Add New...** → **Project**
3. Select your GitHub repository again

### 2.2 Configure Frontend Project

**Project name:** (e.g., `shri-ganesh-web` or `shri-ganesh-frontend`)

**Framework:** Vite

**Root Directory:** Select and set to `shri-ganesh-frontend`

**Build Command:** `npm run build`

**Output Directory:** `dist`

**Environment Variables:**

Add these three variables:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://your-backend-url.vercel.app/api` |
| `VITE_GOOGLE_CLIENT_ID` | Your Google Client ID |
| `VITE_GOOGLE_API_KEY` | Your Google API Key |

**Example for VITE_API_URL:**
```
https://shri-ganesh-api.vercel.app/api
```

### 2.3 Deploy Frontend

Click **Deploy** and wait 2-3 minutes.

**After deployment:**
- You'll get a URL like: `https://shri-ganesh-web.vercel.app`
- Visit it to see your live app!

---

## Step 3: Test Your App

### 3.1 Test Frontend

1. Visit: https://your-frontend-url.vercel.app
2. Try **Create Account** (sign up)
3. Try **Sign In** with your email/password
4. Try **Google Sign-In** (if configured)
5. Test on **mobile** and **desktop** ✅

### 3.2 Test Backend

Test these endpoints:
```
GET https://your-backend-url.vercel.app/api/health
→ Should return: {"ok":true}

POST https://your-backend-url.vercel.app/api/auth/login
Body: {"email":"test@example.com","password":"password"}
```

---

## How to Update Code

Whenever you push to GitHub:

1. **Local changes:**
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```

2. **Vercel auto-deploys:**
   - Vercel watches your GitHub repository
   - Every push to `main` automatically triggers a new deployment
   - Check deployment status in your Vercel dashboard

---

## Environment Variables Reference

### Frontend (VITE_* variables)
- `VITE_API_URL` = Your Vercel backend URL + `/api` (e.g., `https://backend.vercel.app/api`)
- `VITE_GOOGLE_CLIENT_ID` = Google OAuth Client ID (from Google Cloud Console)
- `VITE_GOOGLE_API_KEY` = Google API Key (from Google Cloud Console)

### Backend (Node.js variables)
- `MONGO_URI` = MongoDB Atlas connection string
- `JWT_SECRET` = Random secret for JWT tokens (must be strong!)
- `GOOGLE_CLIENT_ID` = Same as frontend Google Client ID

---

## MongoDB Setup

If you don't have MongoDB Atlas yet:

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free tier
3. Create a database cluster
4. Copy connection string (replace password with your user's password)
5. Add it to Vercel as `MONGO_URI`

**Connection string format:**
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority
```

---

## Google OAuth Setup

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add Authorized redirect URIs:
   - `http://localhost:5173`
   - `https://your-frontend-url.vercel.app`
6. Copy Client ID to `VITE_GOOGLE_CLIENT_ID` in Vercel
7. Copy API Key to `VITE_GOOGLE_API_KEY` in Vercel

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Frontend shows "Login not available" | Check VITE_API_URL is set correctly in Vercel |
| "Cannot reach API" | Check backend URL is correct, backend is deployed |
| Backend 404 error | Check MONGO_URI is set in Vercel backend environment |
| Login page doesn't work on mobile | Clear browser cache, test in incognito mode |
| GitHub not auto-deploying | Check Vercel has GitHub app installed (Settings → Git) |

---

## Your Deployed URLs

After both deployments:

- **Frontend:** `https://your-frontend-name.vercel.app`
- **Backend:** `https://your-backend-name.vercel.app`
- **API:** `https://your-backend-name.vercel.app/api`

---

## GitHub Repository

**https://github.com/sundarsundar770844-hue/SHRI-GANESH--ELECTRICAL**

All code is version-controlled and backed up here. Every push automatically triggers Vercel deployment!
