# Backend 500 Error Fix

**Issue:** Email registration endpoint returning 500 error  
**Cause:** Backend on Render needs to be redeployed with latest code including password utilities

## The Problem

The error occurs at:
```
POST https://indostar-agrotech-1.onrender.com/api/auth/register/email
Status: 500 Internal Server Error
```

This is because:
1. The `password.py` utility file was added locally
2. The code was pushed to GitHub
3. But Render hasn't automatically redeployed the backend

## Solution: Trigger Render Redeploy

### Option 1: Manual Redeploy via Render Dashboard (Recommended)

1. Go to https://dashboard.render.com/
2. Log in with your credentials
3. Find your backend service: `indostar-agrotech-1`
4. Click on the service
5. Click **"Manual Deploy"** button (top right)
6. Select **"Deploy latest commit"**
7. Wait for deployment to complete (2-3 minutes)

### Option 2: Trigger via Git Push

Make a small change to force redeploy:

```bash
# Add a comment to trigger rebuild
echo "# Trigger redeploy" >> backend/README.md
git add backend/README.md
git commit -m "Trigger Render redeploy"
git push origin main
```

Render will automatically detect the push and redeploy.

### Option 3: Use Render CLI

If you have Render CLI installed:

```bash
render deploy --service indostar-agrotech-1
```

## What Will Be Fixed

After redeployment, the backend will have:

1. ✅ `backend/app/utils/password.py` - Password hashing utilities
2. ✅ `passlib[bcrypt]` package installed
3. ✅ Email registration endpoint working
4. ✅ Email login endpoint working
5. ✅ Phone login endpoint working

## Verify the Fix

After Render finishes deploying:

### 1. Check Backend Health

```bash
curl https://indostar-agrotech-1.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "database": {
    "status": "healthy",
    "connected": true
  }
}
```

### 2. Test Registration Endpoint

```bash
curl -X POST https://indostar-agrotech-1.onrender.com/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User",
    "role": "consumer"
  }'
```

Should return tokens and user info (not 500 error).

### 3. Test on Frontend

1. Go to https://indostar.vercel.app
2. Click "Email/Password" login option
3. Switch to "Register" tab
4. Fill in the form:
   - Email: test@example.com
   - Password: Test123!
   - Name: Test User
   - Role: Consumer
5. Click "Register"
6. Should successfully create account and log in

## Deployment Timeline

Render deployment typically takes:
- **Build time:** 1-2 minutes
- **Deploy time:** 30-60 seconds
- **Total:** 2-3 minutes

## Monitoring Deployment

### Via Render Dashboard

1. Go to your service page
2. Click on "Logs" tab
3. Watch for:
   ```
   ==> Building...
   ==> Installing dependencies...
   ==> Starting service...
   ==> Service is live
   ```

### Via Render API

Check deployment status:
```bash
curl https://indostar-agrotech-1.onrender.com/health
```

If it returns 503, deployment is still in progress.  
If it returns 200, deployment is complete.

## Common Issues

### Issue: Render Not Auto-Deploying

**Solution:** Enable auto-deploy in Render settings:
1. Go to service settings
2. Find "Auto-Deploy" section
3. Ensure it's set to "Yes"
4. Branch should be "main"

### Issue: Build Fails

**Check logs for:**
- Missing dependencies
- Python version mismatch
- Environment variables not set

**Solution:**
1. Check Render logs
2. Verify `requirements.txt` is correct
3. Ensure Python version is 3.11+ in `render.yaml`

### Issue: Service Starts But Crashes

**Check logs for:**
- Database connection errors
- Missing environment variables
- Import errors

**Solution:**
1. Verify all environment variables are set in Render
2. Check MongoDB connection string
3. Ensure all required packages are in `requirements.txt`

## Environment Variables to Verify

Make sure these are set in Render dashboard:

```
MONGODB_URL=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://indostar-agrotech-1.onrender.com/api/auth/callback
CORS_ORIGINS=https://indostar.vercel.app,https://indostar-adviks-projects-996cbcc2.vercel.app
```

## After Successful Deployment

1. ✅ Test email registration
2. ✅ Test email login
3. ✅ Test phone login
4. ✅ Test Google OAuth (should still work)
5. ✅ Verify all user roles work correctly

## Quick Fix Command

If you want to trigger redeploy immediately:

```bash
cd backend
echo "# Redeploy $(date)" >> README.md
cd ..
git add backend/README.md
git commit -m "Trigger backend redeploy for password utilities"
git push origin main
```

Then wait 2-3 minutes for Render to redeploy.

## Support

If deployment fails:
1. Check Render logs for specific errors
2. Verify all environment variables
3. Check MongoDB connection
4. Review `render.yaml` configuration

---

**Status:** Waiting for Render redeploy  
**ETA:** 2-3 minutes after triggering deployment  
**Next Step:** Trigger manual deploy in Render dashboard
