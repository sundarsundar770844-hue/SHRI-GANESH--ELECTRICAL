# Complete Netlify Deployment Guide (Frontend + Backend)

**GitHub Repository:** https://github.com/sundarsundar770844-hue/SHRI-GANESH--ELECTRICAL

## ✅ Mobile Ready + Username Authentication
- Works perfectly on mobile, tablet, and desktop
- Username-based login (username + email + password)
- Touch-friendly interface
- Fully responsive design

---

## Step 1: Deploy Frontend to Netlify

### 1.1 Go to Netlify

1. Visit https://app.netlify.com
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub** → Authorize GitHub
4. Search for: `SHRI-GANESH--ELECTRICAL` (your repo)
5. Click **Import**

### 1.2 Configure Frontend Deployment

**Site name:** (e.g., `shri-ganesh-web` or `sanjay-electrical`)

**Build settings:**
- **Base directory:** `shri-ganesh-frontend`
- **Build command:** `npm run build`
- **Publish directory:** `dist`

### 1.3 Add Environment Variables

Click **Site settings** → **Build & deploy** → **Environment** → **Edit variables**

Add these:

| Key | Value | Example |
|-----|-------|---------|
| `VITE_API_URL` | Your backend URL + `/api` | `https://your-backend.netlify.app/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google Client ID | `123456789-abc.apps.googleusercontent.com` |
| `VITE_GOOGLE_API_KEY` | Google API Key | `AIzaSyD...` |

### 1.4 Deploy Frontend

Click **Deploy** and wait 2-3 minutes.

**After deployment:**
- You'll get a URL like: `https://shri-ganesh-web.netlify.app`
- Test it in your browser ✅

**Copy this URL!** You'll use it for backend environment variable.

---

## Step 2: Deploy Backend to Netlify (Serverless Functions)

### 2.1 Create Netlify Functions Directory

```bash
cd backend
mkdir -p netlify/functions
```

### 2.2 Create Handler File

Create file: `backend/netlify/functions/api.js`

```javascript
import dotenv from 'dotenv';
dotenv.config();
import app from '../../api/index.js';

export const handler = async (event, context) => {
  // Remove trailing slash
  if (event.path.endsWith('/') && event.path !== '/') {
    const target = event.path.slice(0, -1);
    return {
      statusCode: 301,
      headers: { Location: target },
    };
  }

  // Call Express app
  return new Promise((resolve, reject) => {
    app(event, context, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};
```

### 2.3 Create netlify.toml

Create file: `backend/netlify.toml` or update root `netlify.toml`

```toml
[build]
  command = "npm install"
  functions = "netlify/functions"

[functions]
  included_files = ["routes/**", "models/**", "middleware/**", "config/**", "controllers/**", "api/**"]

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
```

### 2.4 Add Backend Site to Netlify

1. Go to https://app.netlify.com
2. Click **Add new site** → **Import an existing project**
3. Select GitHub → Authorize
4. Search for: `SHRI-GANESH--ELECTRICAL`
5. Click **Import**

### 2.5 Configure Backend Deployment

**Site name:** (e.g., `shri-ganesh-api`)

**Build settings:**
- **Base directory:** `backend`
- **Build command:** `npm install`
- **Publish directory:** `.netlify/functions`

### 2.6 Add Backend Environment Variables

Click **Site settings** → **Build & deploy** → **Environment** → **Edit variables**

Add these:

| Key | Value | Example |
|-----|-------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority` |
| `JWT_SECRET` | Random secret string | `your-secret-key-12345` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123456789-abc.apps.googleusercontent.com` |

### 2.7 Deploy Backend

Click **Deploy** and wait 3-5 minutes.

**After deployment:**
- You'll get a URL like: `https://shri-ganesh-api.netlify.app`
- Test it: https://shri-ganesh-api.netlify.app/api/health
- Should return: `{"ok":true}`

---

## Step 3: Update Frontend Environment Variable

Now update the frontend with the correct backend URL:

1. Go to frontend site on Netlify
2. **Site settings** → **Build & deploy** → **Environment**
3. Update `VITE_API_URL` to: `https://shri-ganesh-api.netlify.app/api`
4. **Trigger redeploy** (click Redeploy in Deploys tab)

---

## Step 4: Test Everything

### 4.1 Test Backend
```
GET https://shri-ganesh-api.netlify.app/api/health
→ Should return: {"ok":true}
```

### 4.2 Test Frontend
1. Visit: https://shri-ganesh-web.netlify.app
2. Click **Create account**
3. Enter:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
4. Click **Create Account**
5. Login with:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
6. **Test on mobile too!** ✅

---

## How to Update Code

Whenever you push code to GitHub:

1. **Make changes locally:**
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```

2. **Netlify auto-deploys:**
   - Netlify watches your GitHub repo
   - Every push triggers automatic deployment
   - Check status in Netlify dashboard

---

## Environment Variables Reference

### Frontend (VITE_* variables)
- `VITE_API_URL` = Backend URL + `/api` (e.g., `https://backend.netlify.app/api`)
- `VITE_GOOGLE_CLIENT_ID` = Google OAuth Client ID
- `VITE_GOOGLE_API_KEY` = Google API Key

### Backend (Node.js variables)
- `MONGO_URI` = MongoDB Atlas connection string
- `JWT_SECRET` = Random secret for JWT (must be strong!)
- `GOOGLE_CLIENT_ID` = Same Google Client ID as frontend

---

## MongoDB Setup

If you don't have MongoDB Atlas yet:

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free tier
3. Create a database cluster
4. Copy connection string
5. Replace PASSWORD with your user's password
6. Add to Netlify as `MONGO_URI`

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
   - `https://your-frontend.netlify.app`
6. Copy Client ID to `VITE_GOOGLE_CLIENT_ID`
7. Copy API Key to `VITE_GOOGLE_API_KEY`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Frontend shows "API unreachable" | Check VITE_API_URL is correct, check backend deployed |
| Backend returns 404 | Check MONGO_URI is set, check functions directory |
| Login page doesn't work on mobile | Clear cache, test in incognito mode |
| "Username not found" error | Make sure you created account with that username |
| Auto-deploy not working | Check Netlify has GitHub app installed (Site settings → Build & deploy) |

---

## Your Deployed URLs

After both deployments:

- **Frontend:** `https://your-frontend.netlify.app`
- **Backend:** `https://your-backend.netlify.app`
- **API:** `https://your-backend.netlify.app/api`

---

## GitHub Repository

**https://github.com/sundarsundar770844-hue/SHRI-GANESH--ELECTRICAL**

All code is version-controlled. Every push automatically deploys to Netlify!
