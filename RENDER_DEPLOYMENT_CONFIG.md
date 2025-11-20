# Render Deployment Configuration

## 🚀 Deploy Backend to Render

### Step 1: Go to Render
Visit: https://render.com

### Step 2: Sign Up/Login
- Click "Get Started" or "Login"
- Sign in with GitHub account

### Step 3: Create New Web Service
1. Click "New +" button (top right)
2. Select "Web Service"
3. Connect your GitHub repository: `aspect2729/indostar_agrotech`
4. Click "Connect"

### Step 4: Configure Service

**Basic Settings:**
- **Name**: `indostar-backend`
- **Region**: Oregon (US West) or closest to you
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: Python 3
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1`

**Instance Type:**
- Select: **Free**

### Step 5: Add Environment Variables

Click "Advanced" button, then add these environment variables:

**Copy and paste these exactly:**

| Key | Value |
|-----|-------|
| `MONGODB_URL` | `mongodb+srv://advikgudodagi_db_user:YOUR_PASSWORD@cluster0.zz0gmfl.mongodb.net/indostar?retryWrites=true&w=majority` |
| `DATABASE_NAME` | `indostar` |
| `JWT_SECRET` | Click "Generate" button (Render will create secure random value) |
| `JWT_ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` |
| `GOOGLE_CLIENT_ID` | `your-google-client-id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `your-google-client-secret` |
| `GOOGLE_REDIRECT_URI` | `https://indostar-backend.onrender.com/api/auth/callback` |
| `CORS_ORIGINS` | `https://indostar-m10nlzk43-adviks-projects-996cbcc2.vercel.app,https://indostar.vercel.app` |
| `ENVIRONMENT` | `production` |
| `LOG_LEVEL` | `INFO` |

**⚠️ IMPORTANT**: Replace `YOUR_PASSWORD` in `MONGODB_URL` with your actual MongoDB Atlas password!

### Step 6: Create Web Service
Click "Create Web Service" button at the bottom

### Step 7: Wait for Deployment
- Deployment takes 5-10 minutes
- Watch the logs in real-time
- Wait for "Live" status

### Step 8: Get Your Backend URL
Once deployed, your backend will be available at:
`https://indostar-backend.onrender.com`

---

## ✅ After Deployment

### 1. Test Backend Health
Visit: `https://indostar-backend.onrender.com/api/health`

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 2. Update Vercel Frontend

Go to: https://vercel.com/adviks-projects-996cbcc2/indostar/settings/environment-variables

1. Find `REACT_APP_API_URL`
2. Click "Edit" (pencil icon)
3. Change value to: `https://indostar-backend.onrender.com`
4. Click "Save"

Then redeploy frontend:
```bash
vercel --prod
```

### 3. Update Google OAuth

Go to: https://console.cloud.google.com/apis/credentials

1. Click your OAuth 2.0 Client ID
2. Under "Authorized redirect URIs", add:
   - `https://indostar-backend.onrender.com/api/auth/callback`
3. Click "Save"

### 4. Seed Database (Optional)

To add sample products and data, you can run the seeding scripts locally:

```bash
# Update backend/.env with your Atlas connection string
MONGODB_URL=mongodb+srv://advikgudodagi_db_user:YOUR_PASSWORD@cluster0.zz0gmfl.mongodb.net/indostar?retryWrites=true&w=majority

# Run seeding
cd backend
python scripts/seed_all.py
```

---

## 🔍 Monitoring

### View Logs
1. Go to Render Dashboard
2. Click your service
3. Click "Logs" tab
4. View real-time logs

### Check Status
- Dashboard shows service status
- Green = Running
- Yellow = Deploying
- Red = Error

### Metrics
- Click "Metrics" tab
- View CPU, Memory, Request stats

---

## 🐛 Troubleshooting

### Build Fails

**Check logs for:**
- Missing dependencies
- Python version issues
- Import errors

**Solution:**
```bash
# Test locally first
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Database Connection Fails

**Check:**
1. MongoDB Atlas IP whitelist includes `0.0.0.0/0`
2. Database password is correct in connection string
3. Database user has read/write permissions

**Fix in MongoDB Atlas:**
1. Go to Network Access → Add IP Address → Allow from Anywhere
2. Go to Database Access → Verify user permissions

### Service Won't Start

**Check logs for:**
- Port binding issues
- Environment variable errors
- Import errors

**Common fix:**
- Ensure `PORT` environment variable is used (Render provides this automatically)
- Start command must be: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### CORS Errors

**Update CORS_ORIGINS:**
1. Go to Render Dashboard
2. Click your service
3. Go to "Environment" tab
4. Edit `CORS_ORIGINS` to include all your frontend URLs
5. Save and redeploy

---

## 📊 Free Tier Limits

Render Free Tier includes:
- ✅ 750 hours/month (enough for 1 service 24/7)
- ✅ Automatic SSL
- ✅ Automatic deployments from GitHub
- ⚠️ Service spins down after 15 minutes of inactivity
- ⚠️ Cold start takes ~30 seconds

**Note**: First request after inactivity will be slow (cold start). Subsequent requests will be fast.

---

## 🎯 Quick Checklist

- [ ] MongoDB Atlas connection string ready
- [ ] Render account created
- [ ] Web Service created with correct settings
- [ ] All environment variables added
- [ ] Service deployed successfully
- [ ] Health endpoint returns "healthy"
- [ ] Vercel frontend updated with backend URL
- [ ] Google OAuth updated with backend URL
- [ ] Test login flow works

---

## 🆘 Need Help?

1. **Check Render logs** - Most issues show up here
2. **Test health endpoint** - Verify backend is running
3. **Check MongoDB Atlas** - Ensure connection is allowed
4. **Review environment variables** - Ensure all are set correctly

---

**Ready to deploy?** Follow the steps above and your backend will be live in ~10 minutes!
