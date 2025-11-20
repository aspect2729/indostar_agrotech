# Backend Deployment Guide

## 🚀 Quick Deploy Options

Your backend is ready to deploy! Choose one of these platforms:

### Option 1: Render (Recommended - Easiest)

**Why Render?**
- ✅ Free tier available
- ✅ Automatic deployments from GitHub
- ✅ Easy environment variable management
- ✅ Built-in SSL
- ✅ No credit card required for free tier

**Steps:**

1. **Go to Render**: https://render.com
2. **Sign up/Login** with GitHub
3. **Click "New +"** → **"Web Service"**
4. **Connect your repository**: `aspect2729/indostar_agrotech`
5. **Configure:**
   - **Name**: `indostar-backend`
   - **Region**: Oregon (US West) or closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

6. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):

```
MONGODB_URL = mongodb+srv://username:password@cluster.mongodb.net/indostar
DATABASE_NAME = indostar
JWT_SECRET = [Click "Generate" for secure random value]
JWT_ALGORITHM = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7
GOOGLE_CLIENT_ID = your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = your-google-client-secret
GOOGLE_REDIRECT_URI = https://your-backend-name.onrender.com/api/auth/callback
CORS_ORIGINS = https://indostar-m10nlzk43-adviks-projects-996cbcc2.vercel.app,https://indostar.vercel.app
ENVIRONMENT = production
LOG_LEVEL = INFO
```

7. **Click "Create Web Service"**
8. **Wait for deployment** (5-10 minutes)
9. **Your backend URL**: `https://indostar-backend.onrender.com`

---

### Option 2: Railway

**Why Railway?**
- ✅ Very simple setup
- ✅ Free tier with $5 credit/month
- ✅ Automatic deployments
- ✅ Great developer experience

**Steps:**

1. **Go to Railway**: https://railway.app
2. **Sign up/Login** with GitHub
3. **Click "New Project"** → **"Deploy from GitHub repo"**
4. **Select**: `aspect2729/indostar_agrotech`
5. **Configure:**
   - Railway auto-detects Python
   - Set **Root Directory**: `backend`
6. **Add Environment Variables** (Settings → Variables):
   - Same variables as Render above
7. **Deploy automatically**
8. **Get URL** from Settings → Domains

---

### Option 3: Heroku

**Why Heroku?**
- ✅ Well-established platform
- ✅ Good documentation
- ✅ Easy CLI tools

**Steps:**

1. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli

2. **Login**:
   ```bash
   heroku login
   ```

3. **Create app**:
   ```bash
   cd backend
   heroku create indostar-backend
   ```

4. **Add environment variables**:
   ```bash
   heroku config:set MONGODB_URL="mongodb+srv://username:password@cluster.mongodb.net/indostar"
   heroku config:set DATABASE_NAME="indostar"
   heroku config:set JWT_SECRET="your-secret-key"
   heroku config:set JWT_ALGORITHM="HS256"
   heroku config:set ACCESS_TOKEN_EXPIRE_MINUTES="30"
   heroku config:set REFRESH_TOKEN_EXPIRE_DAYS="7"
   heroku config:set GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
   heroku config:set GOOGLE_CLIENT_SECRET="your-google-client-secret"
   heroku config:set GOOGLE_REDIRECT_URI="https://indostar-backend.herokuapp.com/api/auth/callback"
   heroku config:set CORS_ORIGINS="https://indostar-m10nlzk43-adviks-projects-996cbcc2.vercel.app,https://indostar.vercel.app"
   heroku config:set ENVIRONMENT="production"
   heroku config:set LOG_LEVEL="INFO"
   ```

5. **Deploy**:
   ```bash
   git push heroku main
   ```

6. **Your backend URL**: `https://indostar-backend.herokuapp.com`

---

## 📋 Prerequisites: MongoDB Atlas Setup

Before deploying, you need a cloud MongoDB database:

### Set Up MongoDB Atlas (5 minutes)

1. **Go to**: https://www.mongodb.com/cloud/atlas
2. **Sign up** (free, no credit card required)
3. **Create a cluster**:
   - Click "Build a Database"
   - Choose "M0 FREE" tier
   - Select region closest to your backend
   - Click "Create"

4. **Create database user**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `indostar_admin`
   - Password: Generate secure password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

5. **Whitelist IP addresses**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

6. **Get connection string**:
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Example: `mongodb+srv://indostar_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/indostar?retryWrites=true&w=majority`

7. **Use this as `MONGODB_URL`** in your deployment

---

## ✅ After Backend Deployment

### 1. Test Your Backend

Visit: `https://your-backend-url.com/api/health`

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 2. Update Frontend Environment Variable

Go to Vercel dashboard:
https://vercel.com/adviks-projects-996cbcc2/indostar/settings/environment-variables

1. Find `REACT_APP_API_URL`
2. Click "Edit"
3. Update value to: `https://your-backend-url.com`
4. Click "Save"

### 3. Redeploy Frontend

```bash
vercel --prod
```

### 4. Update Google OAuth

Go to Google Cloud Console:
https://console.cloud.google.com/apis/credentials

1. Click your OAuth 2.0 Client ID
2. Add to **Authorized redirect URIs**:
   - `https://your-backend-url.com/api/auth/callback`
3. Click "Save"

### 5. Seed Database (Optional)

If you want sample data:

```bash
# Install MongoDB tools locally
# Then connect to Atlas and run seeding scripts
python backend/scripts/seed_all.py
```

---

## 🔍 Monitoring & Logs

### Render
- Dashboard: https://dashboard.render.com
- Logs: Click your service → "Logs" tab
- Metrics: "Metrics" tab

### Railway
- Dashboard: https://railway.app/dashboard
- Logs: Click your project → "Deployments" → View logs
- Metrics: Built-in metrics view

### Heroku
```bash
# View logs
heroku logs --tail

# Check status
heroku ps

# Restart
heroku restart
```

---

## 🐛 Troubleshooting

### Build Fails

**Check:**
1. `requirements.txt` is in backend directory
2. Python version is compatible (3.10+)
3. All dependencies are listed

**Solution:**
```bash
# Test locally first
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Database Connection Fails

**Check:**
1. MongoDB Atlas IP whitelist includes 0.0.0.0/0
2. Database user has correct permissions
3. Connection string password is correct
4. Connection string is properly URL-encoded

### CORS Errors

**Check:**
1. `CORS_ORIGINS` includes your Vercel URL
2. No trailing slashes in URLs
3. Protocol (https://) is correct

**Update:**
```bash
# Render: Update environment variable in dashboard
# Railway: Update in Settings → Variables
# Heroku:
heroku config:set CORS_ORIGINS="https://indostar-m10nlzk43-adviks-projects-996cbcc2.vercel.app,https://indostar.vercel.app"
```

### OAuth Not Working

**Check:**
1. `GOOGLE_REDIRECT_URI` matches your backend URL
2. Google Console has backend URL in redirect URIs
3. Client ID and Secret are correct

---

## 📊 Deployment Comparison

| Feature | Render | Railway | Heroku |
|---------|--------|---------|--------|
| Free Tier | ✅ Yes | ✅ $5/month credit | ✅ Limited hours |
| Auto Deploy | ✅ Yes | ✅ Yes | ✅ Yes |
| Setup Time | 5 min | 3 min | 10 min |
| SSL | ✅ Auto | ✅ Auto | ✅ Auto |
| Logs | ✅ Good | ✅ Excellent | ✅ Good |
| Cold Start | ~30s | ~10s | ~30s |

**Recommendation**: Start with **Render** - easiest setup, good free tier, no credit card required.

---

## 🎯 Quick Start (Render)

1. Go to https://render.com
2. Sign up with GitHub
3. New Web Service → Connect repo
4. Root Directory: `backend`
5. Build: `pip install -r requirements.txt`
6. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Add environment variables (see above)
8. Deploy!

**That's it!** Your backend will be live in ~5 minutes.

---

Need help? Check the logs in your deployment platform's dashboard!
