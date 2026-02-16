# Deployment Guide

## Production Deployment Summary

### GitHub Repository
**https://github.com/sundarsundar770844-hue/SHRI-GANESH--ELECTRICAL**

### Quick Deploy Steps

#### 1. Deploy Frontend to Netlify

**Repository:** https://github.com/sundarsundar770844-hue/SHRI-GANESH--ELECTRICAL

Steps:
1. Go to https://netlify.com → "Add new site" → "Import from Git"
2. Select your GitHub repository
3. Build settings:
   - **Base directory:** `shri-ganesh-frontend`
   - **Build command:** `npm ci && npm run build`
   - **Publish directory:** `dist`
4. Add environment variables in Netlify (Site settings → Environment):
   ```
   VITE_API_URL = https://your-vercel-backend.vercel.app/api
   VITE_GOOGLE_CLIENT_ID = your-google-client-id
   VITE_GOOGLE_API_KEY = your-google-api-key
   ```
5. Deploy!

**Detailed guide:** [NETLIFY_SETUP.md](NETLIFY_SETUP.md)

#### 2. Deploy Backend to Vercel

**Repository:** https://github.com/sundarsundar770844-hue/SHRI-GANESH--ELECTRICAL

Steps:
1. Go to https://vercel.com/new → Import from Git
2. Select your GitHub repository
3. Set **Root Directory** to: `backend`
4. Add environment variables:
   ```
   MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/dbname
   JWT_SECRET = your-random-secret-key
   GOOGLE_CLIENT_ID = your-google-client-id
   ```
5. Deploy!

**Detailed guide:** [BACKEND_DEPLOYMENT.md](BACKEND_DEPLOYMENT.md)

#### 3. Update Netlify with Backend URL

After Vercel deployment:
1. Get your Vercel backend URL (e.g., `https://shri-ganesh-api.vercel.app`)
2. Go to Netlify → Site settings → Environment
3. Update `VITE_API_URL = https://your-vercel-backend.vercel.app/api`
4. Redeploy on Netlify

#### 4. Test Login

- Visit your Netlify site
- Try logging in on mobile and desktop
- Test all features

### Environment Variables Checklist

#### Netlify (Frontend)
- [ ] `VITE_API_URL` = Your Vercel backend URL
- [ ] `VITE_GOOGLE_CLIENT_ID` = Google Client ID
- [ ] `VITE_GOOGLE_API_KEY` = Google API Key

#### Vercel (Backend)
- [ ] `MONGO_URI` = MongoDB connection string
- [ ] `JWT_SECRET` = Random secret key
- [ ] `GOOGLE_CLIENT_ID` = Google Client ID

### Live URLs (After Deploy)
- Frontend: `https://your-netlify-site.netlify.app`
- Backend: `https://your-vercel-project.vercel.app`
- API: `https://your-vercel-project.vercel.app/api`

### Troubleshooting

| Error | Solution |
|-------|----------|
| "Login is not available" | Set env vars in Netlify and redeploy |
| 404 error | Check VITE_API_URL is correct |
| Backend 500 error | Check MONGO_URI is set in Vercel |
| Mobile doesn't work | Clear browser cache, test in incognito |

---

**Need help?** Check the individual deployment guides:
- [NETLIFY_SETUP.md](NETLIFY_SETUP.md)
- [BACKEND_DEPLOYMENT.md](BACKEND_DEPLOYMENT.md)
