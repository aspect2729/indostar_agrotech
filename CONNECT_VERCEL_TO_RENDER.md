# 🔗 How to Connect Vercel Frontend to Render Backend

**Simple 3-Step Process** | **Time: ~20 minutes**

---

## Overview

Your frontend (Vercel) needs to know where your backend (Render) is located. This is done through an environment variable called `REACT_APP_API_URL`.

**Current Problem:**
- Frontend is live on Vercel ✅
- Backend is NOT deployed yet ❌
- Frontend doesn't know where to send API requests ❌

**Solution:**
1. Deploy backend to Render
2. Tell Vercel where the backend is
3. Update CORS so backend accepts frontend requests

---

## Step 1: Deploy Backend to Render (15 min)

### 1.1 Go to Render
Visit: **https://render.com**

### 1.2 Sign Up/Login
- Click **"Get Started"** or **"Login"**
- Choose **"Sign in with GitHub"**
- Authorize Render to access your repositories

### 1.3 Create New Web Service
1. Click the **"New +"** button (top right)
2. Select **"Web Service"**
3. Find and click **"Connect"** next to `aspect2729/indostar_agrotech`

### 1.4 Configure Your Service

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `indostar-backend` |
| **Region** | Oregon (US West) or closest to you |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1` |
| **Instance Type** | Free |

### 1.5 Add Environment Variables

Click **"Advanced"** button, then click **"Add Environment Variable"** for each:

```
MONGODB_URL
mongodb+srv://advikgudodagi_db_user:indostar@cluster0.zz0gmfl.mongodb.net/indostar

DATABASE_NAME
indostar

JWT_SECRET
XYC8zTrKIQFf01dW6uiSbBTEv_7GypUO0wxX6Fqj5hs

JWT_ALGORITHM
HS256

ACCESS_TOKEN_EXPIRE_MINUTES
30

REFRESH_TOKEN_EXPIRE_DAYS
7

GOOGLE_CLIENT_ID
[YOUR_GOOGLE_CLIENT_ID]

GOOGLE_CLIENT_SECRET
[YOUR_GOOGLE_CLIENT_SECRET]

GOOGLE_REDIRECT_URI
https://indostar-backend.onrender.com/api/auth/callback

CORS_ORIGINS
https://indostar.vercel.app,https://indostar-jf0to49n7-adviks-projects-996cbcc2.vercel.app

ENVIRONMENT
production

LOG_LEVEL
INFO
```

**💡 Tip:** Copy each variable name and value exactly as shown above.

### 1.6 Deploy!

1. Click **"Create Web Service"** at the bottom
2. Wait 5-10 minutes while Render builds and deploys
3. Watch the logs - you'll see:
   - Installing dependencies
   - Starting application
   - "Application startup complete" ✅

### 1.7 Get Your Backend URL

Once deployed, your backend URL will be:
**`https://indostar-backend.onrender.com`**

You'll see this at the top of your service dashboard.

### 1.8 Test Backend

Visit: **https://indostar-backend.onrender.com/api/health**

You should see:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-11-21T..."
}
```

✅ **Backend is now live!**

---

## Step 2: Connect Vercel to Render (3 min)

Now tell your frontend where the backend is.

### 2.1 Go to Vercel Dashboard

Visit: **https://vercel.com/adviks-projects-996cbcc2/indostar/settings/environment-variables**

Or:
1. Go to https://vercel.com
2. Click your **"indostar"** project
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in left sidebar

### 2.2 Add API URL Variable

1. Click **"Add New"** button
2. Fill in:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://indostar-backend.onrender.com`
   - **Environments**: Check all three boxes:
     - ☑ Production
     - ☑ Preview
     - ☑ Development
3. Click **"Save"**

### 2.3 Redeploy Frontend

Open your terminal and run:

```bash
vercel --prod
```

Or in Vercel dashboard:
1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment
3. Confirm

Wait ~30 seconds for redeployment.

✅ **Frontend now knows where backend is!**

---

## Step 3: Update CORS & OAuth (5 min)

### 3.1 Update Backend CORS (Already Done!)

The CORS_ORIGINS we set in Step 1.5 already includes your Vercel URLs, so backend will accept requests from frontend. ✅

### 3.2 Update Google OAuth

Your Google OAuth needs to know about the backend callback URL.

1. Go to: **https://console.cloud.google.com/apis/credentials**
2. Click on your OAuth 2.0 Client ID: `355932236944-k5bubv3d2gu0p92bdk3kj4k6ngr0duli`
3. Scroll to **"Authorized JavaScript origins"**
   - Click **"+ ADD URI"**
   - Add: `https://indostar.vercel.app`
4. Scroll to **"Authorized redirect URIs"**
   - Click **"+ ADD URI"**
   - Add: `https://indostar-backend.onrender.com/api/auth/callback`
5. Click **"SAVE"** at the bottom

✅ **OAuth configured for production!**

---

## Step 4: Test the Connection (2 min)

### 4.1 Open Your App

Visit: **https://indostar.vercel.app**

### 4.2 Open Browser Console

Press **F12** to open DevTools, then click **"Console"** tab

### 4.3 Check Logs

You should see:
```
[INFO] Environment initialized
[INFO] API client initialized with base URL: https://indostar-backend.onrender.com
```

### 4.4 Test Login

1. Click **"Login with Google"**
2. Sign in with your Google account
3. You should be redirected to your dashboard

### 4.5 Check Network Tab

1. In DevTools, click **"Network"** tab
2. Try browsing products or making any action
3. Look for API calls going to `indostar-backend.onrender.com`
4. They should return **200 OK** status

✅ **Everything is connected!**

---

## 🎉 You're Done!

Your Vercel frontend is now connected to your Render backend!

**What's Working:**
- ✅ Frontend hosted on Vercel
- ✅ Backend hosted on Render
- ✅ Frontend sends API requests to backend
- ✅ Backend accepts requests from frontend (CORS)
- ✅ Google OAuth works in production
- ✅ Database connected

---

## 🔍 Troubleshooting

### Frontend Shows "Network Error"

**Check:**
1. Is backend running? Visit: https://indostar-backend.onrender.com/api/health
2. Is `REACT_APP_API_URL` set in Vercel? Check environment variables
3. Did you redeploy frontend after adding the variable?

**Fix:**
```bash
# Redeploy frontend
vercel --prod
```

### Backend Returns 403 or CORS Error

**Check:**
1. Open browser console (F12)
2. Look for CORS error message

**Fix:**
1. Go to Render dashboard
2. Click your service
3. Go to **"Environment"** tab
4. Edit `CORS_ORIGINS` to include: `https://indostar.vercel.app`
5. Save (service will redeploy automatically)

### Google Login Fails

**Check:**
1. Error message in browser console
2. Google Console redirect URIs

**Fix:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Verify redirect URI: `https://indostar-backend.onrender.com/api/auth/callback`
3. Verify JavaScript origin: `https://indostar.vercel.app`

### Backend is Slow (First Request)

**This is normal!** Render free tier:
- Spins down after 15 minutes of inactivity
- Takes ~30 seconds to wake up on first request
- Subsequent requests are fast

**Solution:** Upgrade to paid tier ($7/month) for always-on service, or accept the cold start delay.

---

## 📊 Quick Verification Checklist

- [ ] Backend deployed to Render
- [ ] Backend health endpoint returns "healthy"
- [ ] `REACT_APP_API_URL` added to Vercel
- [ ] Frontend redeployed
- [ ] CORS includes Vercel URLs
- [ ] Google OAuth redirect URIs updated
- [ ] Frontend loads without errors
- [ ] API calls succeed (check Network tab)
- [ ] Login with Google works

---

## 🆘 Need Help?

**Check Logs:**

Render Backend:
1. Go to Render dashboard
2. Click your service
3. Click **"Logs"** tab

Vercel Frontend:
```bash
vercel logs
```

Browser:
- Press F12
- Check Console tab for errors
- Check Network tab for failed requests

**Common Issues:**
- **"Cannot connect to backend"** → Check `REACT_APP_API_URL` in Vercel
- **"CORS error"** → Update `CORS_ORIGINS` in Render
- **"OAuth error"** → Update Google Console settings
- **"Backend not responding"** → Check Render logs for errors

---

## 📚 What Just Happened?

1. **Render Backend**: Your Python FastAPI backend is running on Render's servers
2. **Vercel Frontend**: Your React frontend is running on Vercel's CDN
3. **Environment Variable**: `REACT_APP_API_URL` tells frontend where backend is
4. **CORS**: Backend allows requests from your Vercel domain
5. **OAuth**: Google knows to redirect to your backend callback URL

**The Flow:**
```
User visits Vercel frontend
  ↓
Frontend makes API call to Render backend
  ↓
Backend checks CORS (allows Vercel domain)
  ↓
Backend processes request
  ↓
Backend sends response to frontend
  ↓
Frontend displays data to user
```

---

**That's it!** Your full-stack app is now live in production. 🚀
