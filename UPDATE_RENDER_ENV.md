# Update Render Environment Variables

## Issue
The subscription endpoint is blocked by CORS because Render needs the updated environment variables.

## Steps to Fix

### 1. Go to Render Dashboard
Visit: https://dashboard.render.com/

### 2. Select Your Backend Service
Find and click on: `indostar-agrotech-1` (or your backend service name)

### 3. Go to Environment Tab
Click on "Environment" in the left sidebar

### 4. Update CORS_ORIGINS
Find the `CORS_ORIGINS` variable and update it to:
```
https://indostar.vercel.app,https://indostar-20j4f820u-adviks-projects-996cbcc2.vercel.app,https://indostar-jf0to49n7-adviks-projects-996cbcc2.vercel.app,http://localhost:3000
```

### 5. Save Changes
Click "Save Changes" button

### 6. Redeploy
The service should automatically redeploy. If not, click "Manual Deploy" → "Deploy latest commit"

### 7. Wait for Deployment
Wait 2-3 minutes for the service to redeploy

### 8. Test
Once deployed, refresh your website and try accessing subscriptions again.

## Alternative: Check Current CORS Settings

You can also check what CORS origins are currently set on Render by looking at the Environment variables in the Render dashboard.

## Quick Test
After updating, test the subscription endpoint:
```bash
curl -X GET https://indostar-agrotech-1.onrender.com/api/subscriptions \
  -H "Origin: https://indostar.vercel.app" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

If you see CORS headers in the response, it's working!
