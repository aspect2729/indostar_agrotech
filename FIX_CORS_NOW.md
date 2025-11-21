# URGENT: Fix CORS Error on Render

## Problem
Your Vercel frontend (`https://indostar-709gufjpc-adviks-projects-996cbcc2.vercel.app`) is being blocked by CORS because the backend on Render doesn't have the updated CORS_ORIGINS.

## Solution: Update Render Environment Variables

### Option 1: Via Render Dashboard (FASTEST)

1. Go to https://dashboard.render.com/
2. Select your backend service: `indostar-agrotech-1`
3. Click **Environment** in the left sidebar
4. Find `CORS_ORIGINS` and update it to:
```
https://indostar.vercel.app,https://indostar-709gufjpc-adviks-projects-996cbcc2.vercel.app,https://indostar-20j4f820u-adviks-projects-996cbcc2.vercel.app,https://indostar-jf0to49n7-adviks-projects-996cbcc2.vercel.app,http://localhost:3000
```

5. Click **Save Changes**
6. Render will automatically redeploy (takes ~2-3 minutes)

### Option 2: Via Render API

Run this command (replace YOUR_API_KEY with your Render API key):

```bash
curl -X PATCH https://api.render.com/v1/services/YOUR_SERVICE_ID/env-vars \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "CORS_ORIGINS": "https://indostar.vercel.app,https://indostar-709gufjpc-adviks-projects-996cbcc2.vercel.app,https://indostar-20j4f820u-adviks-projects-996cbcc2.vercel.app,https://indostar-jf0to49n7-adviks-projects-996cbcc2.vercel.app,http://localhost:3000"
  }'
```

## Why This Happened

The backend code already has `allow_origin_regex=r"https://.*\.vercel\.app"` which should match all Vercel deployments, BUT:
- The regex might not be working as expected on Render
- Adding the explicit URL to CORS_ORIGINS ensures it works

## Verify After Update

1. Wait for Render to finish redeploying (~2-3 minutes)
2. Check backend logs: https://dashboard.render.com/web/YOUR_SERVICE/logs
3. Look for: "CORS origins configured: ..."
4. Try logging in again on your Vercel app

## Alternative: Quick Test

If you want to test immediately, you can temporarily set CORS to allow all origins:

```
CORS_ORIGINS=*
```

⚠️ **WARNING:** Only use this for testing! Change it back to specific origins for production.

## Current Errors Explained

1. **CORS Error:** Backend rejecting requests from Vercel domain
2. **401 on manifest.json:** This is normal, manifest doesn't need auth
3. **400 on OTP verify:** This will work once CORS is fixed

## Status

- ✅ Local backend `.env` updated
- ⚠️ **ACTION REQUIRED:** Update Render environment variables
- ⏳ Waiting for Render redeploy
