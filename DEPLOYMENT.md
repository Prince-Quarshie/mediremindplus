# Vercel Deployment Guide for MediRemind+

## Overview
Your application will be deployed as two separate projects on Vercel:
- **Backend**: Express.js API server
- **Frontend**: React/Vite application

## Prerequisites
1. Vercel account ([create one](https://vercel.com/signup))
2. GitHub account with your code pushed to a repository
3. MongoDB Atlas account for production database ([create one](https://www.mongodb.com/cloud/atlas))

## Step 1: Prepare Your GitHub Repository

```bash
# In your project root
git add .
git commit -m "Add Vercel configuration"
git push origin main
```

---

## Step 2: Deploy Backend to Vercel

### 2.1 Set Up MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Create a database user and get your connection string:
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/mediremind?retryWrites=true&w=majority`

### 2.2 Deploy Backend
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select the `mediremind-plus/backend` folder as the root directory
5. Click "Environment Variables" and add:
   - **MONGO_URI**: Your MongoDB Atlas connection string
   - **JWT_SECRET**: Generate a random string (use `openssl rand -base64 32`)
   - **JWT_EXPIRES_IN**: `7d`
   - **PORT**: `3000` (Vercel assigns this automatically)
   - **NODE_ENV**: `production`
   - **TWILIO_ACCOUNT_SID**: (if using SMS features)
   - **TWILIO_AUTH_TOKEN**: (if using SMS features)
   - **TWILIO_PHONE_NUMBER**: (if using SMS features)

6. Click "Deploy"
7. Once deployed, note your backend URL: `https://your-backend-name.vercel.app`

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Update API Configuration
Edit `mediremind-plus/frontend/src/api/axios.js`:
```javascript
// Update baseURL to your deployed backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend-name.vercel.app/api';
```

Or set environment variable in Vercel dashboard:
- **VITE_API_URL**: `https://your-backend-name.vercel.app/api`

Then update your axios file to use:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

### 3.2 Deploy Frontend
1. Go to Vercel Dashboard → "Add New" → "Project"
2. Import your GitHub repository
3. Select the `mediremind-plus/frontend` folder as the root directory
4. Add Environment Variables:
   - **VITE_API_URL**: Your backend URL (e.g., `https://your-backend-name.vercel.app/api`)
5. Click "Deploy"

---

## Step 4: Enable CORS on Backend

Update `mediremind-plus/backend/server.js` to allow your frontend URL:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://your-frontend-domain.vercel.app'
  ],
  credentials: true
}));
```

Add to Environment Variables in Vercel:
- **FRONTEND_URL**: `https://your-frontend-domain.vercel.app`

---

## Step 5: Redeploy

After updating CORS and environment variables:
1. Push changes to GitHub
2. Both Vercel projects will auto-redeploy

---

## Environment Variables Checklist

### Backend (.env on Vercel)
- [ ] MONGO_URI
- [ ] JWT_SECRET
- [ ] JWT_EXPIRES_IN
- [ ] NODE_ENV = production
- [ ] FRONTEND_URL
- [ ] TWILIO_ACCOUNT_SID (optional)
- [ ] TWILIO_AUTH_TOKEN (optional)
- [ ] TWILIO_PHONE_NUMBER (optional)

### Frontend (.env on Vercel)
- [ ] VITE_API_URL = `https://your-backend.vercel.app/api`

---

## Testing After Deployment

1. Test authentication flow (Signup/Login)
2. Verify API calls reach the backend
3. Check browser console for CORS errors
4. Test all medication operations

---

## Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` environment variable in backend
- Check frontend `VITE_API_URL` points to correct backend

### Database Connection Issues
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for Vercel)
- Ensure database user has correct permissions

### Deployment Fails
- Check build logs in Vercel dashboard
- Verify `vercel.json` configuration
- Ensure all dependencies in `package.json`

---

## Optional: Custom Domain
1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

## CI/CD Benefits
- Auto-deploys on every push to main branch
- Preview deployments for pull requests
- Automatic rollbacks if needed
