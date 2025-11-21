# Manual Render Deploy - DO THIS NOW

## Why It's Taking Long

Render free tier can be slow because:
1. **Cold starts** - Service spins down after inactivity
2. **Build queue** - May be waiting in queue
3. **Auto-deploy delay** - Can take 5-10 minutes to detect GitHub push
4. **Resource limits** - Free tier has limited build resources

## FASTEST SOLUTION: Manual Deploy

### Step 1: Go to Render Dashboard
1. Open: https://dashboard.render.com/
2. Log in with your credentials

### Step 2: Find Your Service
- Look for: **indostar-agrotech-1** (or similar name)
- It should be in your services list

### Step 3: Trigger Manual Deploy
1. Click on the service name
2. Look for **"Manual Deploy"** button (top right corner)
3. Click it
4. Select **"Deploy latest commit"** or **"Clear build cache & deploy"**
5. Click **"Deploy"**

### Step 4: Watch the Logs
- Stay on the page
- Click **"Logs"** tab
- Watch the deployment progress in real-time

## Expected Timeline

With manual deploy:
- **Queue time:** 0-30 seconds
- **Build time:** 2-3 minutes
- **Deploy time:** 30-60 seconds
- **Total:** 3-4 minutes

## What You'll See in Logs

```
==> Cloning from GitHub...
==> Checking out commit 6f8fadd...
==> Building...
==> Installing Python dependencies...
==> Installing passlib[bcrypt]==1.7.4
==> Installing bcrypt==4.1.2
==> Build successful
==> Starting service...
==> Your service is live 🎉
```

## Alternative: Check Current Status

If you don't want to manually deploy, check if it's already deploying:

### Check via Browser
Visit: https://indostar-agrotech-1.onrender.com/health

- **503 Error** = Still deploying or service down
- **200 OK** = Deployment complete!

### Check via Command
```bash
curl -I https://indostar-agrotech-1.onrender.com/health
```

## If Auto-Deploy Isn't Working

### Enable Auto-Deploy
1. Go to service settings
2. Find **"Auto-Deploy"** section
3. Set to **"Yes"**
4. Branch: **main**
5. Save changes

### Check GitHub Integration
1. In Render dashboard
2. Go to **Account Settings** → **GitHub**
3. Ensure repository access is granted
4. Reconnect if needed

## Troubleshooting

### Issue: Can't Find Service
- Check you're logged into correct Render account
- Service might be under a team account
- Check email for Render deployment notifications

### Issue: Manual Deploy Button Disabled
- Service might already be deploying
- Check the "Events" tab for current deployment
- Wait for current deployment to finish

### Issue: Build Fails
Check logs for errors:
- Missing environment variables
- Python version mismatch
- Dependency installation failures

**Solution:** Verify environment variables are set in Render dashboard

## Required Environment Variables

Make sure these are set in Render:

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

## After Deployment Completes

### Test Backend Health
```bash
curl https://indostar-agrotech-1.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "database": {
    "status": "healthy",
    "connected": true
  }
}
```

### Test Registration
```bash
curl -X POST https://indostar-agrotech-1.onrender.com/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test","role":"consumer"}'
```

Should return tokens (not 500 error)

### Test on Frontend
1. Go to https://indostar.vercel.app
2. Try email registration
3. Should work without errors

---

## QUICK ACTION ITEMS

1. ✅ Go to https://dashboard.render.com/
2. ✅ Click on **indostar-agrotech-1** service
3. ✅ Click **"Manual Deploy"** button
4. ✅ Select **"Deploy latest commit"**
5. ✅ Wait 3-4 minutes
6. ✅ Test the registration endpoint

**This is the fastest way to get your backend deployed!**
