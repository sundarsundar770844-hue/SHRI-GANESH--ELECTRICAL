# Shri Ganesh Electricals

Mobile-first Electrical Shop Management Web App.

**GitHub:** https://github.com/sundarsundar770844-hue/SHRI-GANESH--ELECTRICAL

## Quick Deployment Links

- 🌐 **Frontend Live:** https://vercel-frontend-url (Deploy to Vercel)
- 🔌 **Backend API:** https://vercel-backend-url (Deploy to Vercel)
- 📖 **Full Deployment Guide:** [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
- 📚 **Alternative Netlify Guide:** [NETLIFY_SETUP.md](NETLIFY_SETUP.md) (Frontend only)

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (Mongoose)
- **Deployment:** Netlify (Frontend) + Vercel (Backend)

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env` (copy from `backend/.env.example`):

```
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/shri-ganesh?retryWrites=true&w=majority
# Or for local MongoDB: mongodb://localhost:27017/shri-ganesh
JWT_SECRET=your-secret-key-change-in-production
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com  # For Google login
```

Run backend:

```bash
npm run dev
```

**Without MongoDB?** Use demo mode (in-memory):

```bash
npm run demo
```

### 2. Frontend

```bash
cd shri-ganesh-frontend
npm install
```

Create `shri-ganesh-frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com  # For Google Sign-In
```

Run frontend:

```bash
npm run dev
```

### 3. Google Sign-In (optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project, enable Google+ API
3. Create OAuth 2.0 credentials (Web application)
4. Add `http://localhost:5173` to authorized origins
5. Copy Client ID to both backend `.env` (GOOGLE_CLIENT_ID) and frontend `.env` (VITE_GOOGLE_CLIENT_ID)

Without Google: Use **Create account** and **Sign in** with email/password.

## Login & Auth

- **Create account** – Sign up with email, name, password
- **Sign in** – Email + password
- **Sign in with Google** – When GOOGLE_CLIENT_ID is configured
- **Forgot password** – Enter email to get reset link (token shown in dev mode)
- **Reset password** – Enter token from email + new password
- **Logout** – Tap profile icon (👤) in bottom nav → Logout

**Data per account:** Each user sees only their own products and bills. Different Google/email accounts = different data.

## Features

- Home: Today's sales, low stock alerts
- Products: Search, category filter, add to bill, remove
- Bill Centre: Customer name/phone, UPI QR, GST 18%, Save/Pay Later
- Bill History: View bills, edit Pay Later bills
- Admin: Add/Edit/Delete products, Update stock, Reset All
