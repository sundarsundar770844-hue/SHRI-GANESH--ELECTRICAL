# 🚀 QUICK START - DEPLOY TO VERCEL IN 5 MINUTES

**GitHub Repository:** https://github.com/sundarsundar770844-hue/SHRI-GANESH--ELECTRICAL

---

## ⚡ FASTEST WAY TO DEPLOY

### STEP 1: Deploy Backend (2 minutes)

1. Go to https://vercel.com/new
2. **Import from Git** → Select GitHub
3. Search: `SHRI-GANESH--ELECTRICAL`
4. Click **Import**
5. **Project name:** `shri-ganesh-api`
6. **Framework:** Other
7. **Root Directory:** `backend` (MUST SET)
8. **Build Command:** `npm install`
9. Add **Environment Variables:**

```
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/shri-ganesh?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-12345
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

10. Click **Deploy** ✅
11. **Wait 2-3 minutes** for deployment
12. **Copy the URL** (e.g., `https://shri-ganesh-api.vercel.app`)

---

### STEP 2: Deploy Frontend (2 minutes)

1. Go to https://vercel.com/new-project
2. Click **Add New** → **Project**
3. Search: `SHRI-GANESH--ELECTRICAL`
4. Click **Import**
5. **Project name:** `shri-ganesh-web`
6. **Framework:** Vite
7. **Root Directory:** `shri-ganesh-frontend` (MUST SET)
8. **Build Command:** `npm run build`
9. **Output Directory:** `dist`
10. Add **Environment Variables:**

```
VITE_API_URL=https://shri-ganesh-api.vercel.app/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-google-api-key
```

11. Click **Deploy** ✅
12. **Wait 2-3 minutes** for deployment

---

### STEP 3: Test Your App ✅

1. Visit: `https://shri-ganesh-web.vercel.app`
2. Test on **mobile and desktop**
3. Try **Sign Up**
4. Try **Login**
5. Test **Products** page
6. Test **Create Bill**

---

## 🔧 Environment Variables You Need

### For MongoDB (Backend):
Get from: https://www.mongodb.com/cloud/atlas
```
MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

### For Google (Optional):
Get from: https://console.cloud.google.com
```
VITE_GOOGLE_CLIENT_ID = 123456789-abc123.apps.googleusercontent.com
VITE_GOOGLE_API_KEY = AIzaSy.....
GOOGLE_CLIENT_ID = 123456789-abc123.apps.googleusercontent.com (backend)
```

### For JWT (Backend):
```
JWT_SECRET = any-random-string-you-want
```

---

## 📱 Works On All Devices

✅ **Mobile** (iPhone, Android)  
✅ **Tablet** (iPad)  
✅ **Desktop** (Windows, Mac, Linux)  
✅ **All Browsers** (Chrome, Safari, Firefox, Edge)

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| **404 Not Found on /api** | Check MONGO_URI is set in Vercel backend |
| **Login not working** | Check VITE_API_URL in frontend (should end with `/api`) |
| **Mobile not working** | Clear browser cache, test in incognito |
| **Backend still 404** | Click **Redeploy** in Vercel Deployments |

---

## 📊 Your Live URLs (After Deploy)

```
Frontend: https://shri-ganesh-web.vercel.app
Backend:  https://shri-ganesh-api.vercel.app
API:      https://shri-ganesh-api.vercel.app/api
```

---

## 🔄 Auto-Deploy on Code Changes

Every time you `git push`, Vercel automatically redeploys!

```bash
git add .
git commit -m "Your changes"
git push origin main
```

**Done!** Vercel will automatically rebuild and deploy within 1-2 minutes.

---

**That's it! Your app is live on mobile and desktop!** 🎉
