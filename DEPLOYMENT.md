# Vercel Deployment Guide for MediRemind+

## New Project Structure
```
backend/          ← Express.js API
frontend/         ← React/Vite application
package.json
```

**Backend and Frontend are now completely separate!**

## Overview
Your application will be deployed as two separate projects on Vercel:
- **Frontend**: Deployed to Vercel
- **Backend**: Deployed to Render or Railway (recommended)

## Prerequisites
1. Vercel account ([create one](https://vercel.com/signup))
2. GitHub account with your code pushed
3. MongoDB Atlas account ([create one](https://www.mongodb.com/cloud/atlas))
4. Render or Railway account for backend

---

## Step 1: Push Changes to GitHub

```bash
git add .
git commit -m "Separate frontend and backend into root directories"
git push origin main
```

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **Framework**: Select "Vite"
5. **Root Directory**: `frontend`
6. Click "Deploy"

### 2.2 Add Environment Variables
After deployment, go to Settings → Environment Variables and add:
- **VITE_API_URL**: `https://your-backend-url.onrender.com/api`

Then redeploy.

---

## Step 3: Deploy Backend to Render or Railway

### 🚀 Option A: Deploy to Render (Recommended)

1. Go to [Render](https://render.com)
2. Create account and connect GitHub
3. Click "New" → "Web Service"
4. Select your repository
5. Configure:
   - **Name**: `mediremind-plus-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Click "Advanced" and add Environment Variables:
   - **MONGO_URI**: Your MongoDB Atlas connection string
   - **JWT_SECRET**: Random string (run `openssl rand -base64 32`)
   - **JWT_EXPIRES_IN**: `7d`
   - **FRONTEND_URL**: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
   - **NODE_ENV**: `production`
7. Click "Create Web Service"

### 🚀 Option B: Deploy to Railway

1. Go to [Railway](https://railway.app)
2. Create account and connect GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add variables:
   - **MONGO_URI**: Your MongoDB connection string
   - **JWT_SECRET**: Random string
   - **JWT_EXPIRES_IN**: `7d`
   - **FRONTEND_URL**: Your Vercel URL
   - **NODE_ENV**: `production`
6. Set root directory to `backend`
7. Deploy

---

## Step 4: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free M0 tier)
3. Create database user
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/mediremind?retryWrites=true&w=majority`
5. **Important**: Add Render/Railway IP to Network Access (click "Allow access from anywhere" for free tier)

---

## Step 5: Update Frontend to Point to Backend

Your `frontend/src/api/axios.js` should already have:
```javascript
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
```

When you deploy to Vercel, set `VITE_API_URL` to your backend URL.

---

## Final Deployment URLs

Once complete:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com` (or Railway URL)
- **Database**: MongoDB Atlas cloud

---

## Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` in backend environment variables
- Restart backend after updating

### Database Connection Fails
- Check MongoDB Atlas IP whitelist
- Verify `MONGO_URI` is correct
- Test connection string in MongoDB Compass

### Build Fails
- Check logs in Render/Railway dashboard
- Ensure all dependencies in `package.json`
- Verify root directory is set correctly

---

## Local Development

After separation:
```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

Frontend will be at `http://localhost:5173`
Backend will be at `http://localhost:5000`

