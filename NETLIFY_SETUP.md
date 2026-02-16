# Netlify Deployment — Complete Setup Guide

## Step 1: Push Repository to GitHub ✓
Your code is already on GitHub at: https://github.com/ssanjay31431-commits/electrical.git

## Step 2: Connect Repository to Netlify
1. Go to https://netlify.com and log in.
2. Click "New site from Git".
3. Select GitHub and authorize.
4. Choose your repository: `ssanjay31431-commits/electrical`.
5. Configure build settings:
   - **Base directory**: `shri-ganesh-frontend`
   - **Build command**: `npm ci && npm run build`
   - **Publish directory**: `dist`
6. Click "Deploy site".

## Step 3: Set Environment Variables (IMPORTANT - THIS FIXES THE LOGIN ERROR)

**If you see "Login is not available. Please contact admin: missing API or Google Client ID", you must add these environment variables:**

### How to Add Environment Variables in Netlify:

1. Go to your Netlify site dashboard.
2. Click **Site settings** (top menu).
3. Go to **Build & deploy** → **Environment**.
4. Click **Add environment variable** or **Edit variables**.
5. Add these three environment variables:

| Key | Value | Description |
|-----|-------|-------------|
| `VITE_API_URL` | `https://your-backend-url.com/api` | Your production backend API URL (e.g., Vercel, Heroku, etc.) |
| `VITE_GOOGLE_CLIENT_ID` | `your-google-client-id.apps.googleusercontent.com` | Get from Google Cloud Console |
| `VITE_GOOGLE_API_KEY` | `your-google-api-key` | Get from Google Cloud Console |

6. Click **Save**.
7. Trigger a new deploy (or push a commit to trigger automatic deploy).

### Example Values:
- `VITE_API_URL` = `https://shri-ganesh-api.vercel.app/api`
- `VITE_GOOGLE_CLIENT_ID` = `123456789-abc123def456.apps.googleusercontent.com`
- `VITE_GOOGLE_API_KEY` = `AIzaSyD1234567890abcdefghijklmnopqrst`

## Step 4: Redeploy and Test
1. Wait for Netlify to build and deploy.
2. Visit your site URL and test the login page.
3. The login page should now work on all devices (mobile, tablet, desktop).

## Troubleshooting

### "Login is not available" Error
- **Cause**: Environment variables are missing in Netlify.
- **Fix**: Add all three environment variables (see Step 3).

### "Cannot reach API" Error
- **Cause**: VITE_API_URL is wrong or backend is down.
- **Fix**: Check that your backend URL is correct and accessible.

### Backend on Vercel
If you deployed the backend to Vercel:
- `VITE_API_URL` should be: `https://your-vercel-project.vercel.app/api`
- Make sure CORS is enabled in your backend.

## After Deployment
- Login works on mobile and desktop.
- Frontend is deployed on Netlify.
- Backend can be on Vercel, Heroku, or any cloud service.
