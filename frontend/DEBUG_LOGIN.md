# Login Debug Guide

## Common Login Issues and Solutions

### Issue 1: Backend Not Running
**Symptom:** Network errors, "Failed to fetch", or connection refused errors

**Solution:**
```bash
# Start the backend server
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Issue 2: MongoDB Not Running
**Symptom:** Backend starts but crashes when trying to authenticate

**Solution:**
```bash
# Start MongoDB (Windows)
net start MongoDB

# Or if using MongoDB Atlas, check your connection string in backend/.env
```

### Issue 3: Google OAuth Redirect URI Mismatch
**Symptom:** Google shows "redirect_uri_mismatch" error

**Solution:**
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Navigate to APIs & Services > Credentials
3. Click on your OAuth 2.0 Client ID
4. Under "Authorized redirect URIs", ensure you have:
   - `http://localhost:8000/api/auth/callback`
   - `http://localhost:3000/login`

### Issue 4: CORS Errors
**Symptom:** Browser console shows CORS policy errors

**Solution:**
Check `backend/.env` has:
```
CORS_ORIGINS=http://localhost:3000
```

### Issue 5: Environment Variables Not Loaded
**Symptom:** "Missing environment variables" warnings

**Solution:**
1. Ensure `frontend/.env` exists with:
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your-client-id
```

2. Restart the frontend dev server:
```bash
cd frontend
npm start
```

## Testing the Login Flow

### Step 1: Check Backend Health
Open browser to: http://localhost:8000/docs
You should see the FastAPI Swagger documentation.

### Step 2: Test OAuth Initiation
```bash
curl -X POST http://localhost:8000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"redirect_uri": "http://localhost:3000/login"}'
```

Expected response:
```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/auth?...",
  "state": "some-random-state"
}
```

### Step 3: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "Login as Customer" or "Login as Owner/Distributor"
4. Look for any error messages

### Step 4: Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click login button
4. Look for the `/api/auth/google` request
5. Check if it returns 200 OK
6. Check the response body

## Quick Fix Checklist

- [ ] Backend server is running on port 8000
- [ ] Frontend server is running on port 3000
- [ ] MongoDB is running (local or Atlas)
- [ ] Google OAuth credentials are correct in both `.env` files
- [ ] Redirect URIs are configured in Google Cloud Console
- [ ] CORS is properly configured
- [ ] No browser console errors
- [ ] Network requests are successful

## Still Having Issues?

### Check Backend Logs
The backend should show logs when you try to login. Look for:
- "Generated Google OAuth URL" - means OAuth initiation worked
- "User authenticated successfully" - means callback worked
- Any error messages

### Check Frontend Console
Look for:
- Network errors
- Authentication errors
- State management errors

### Verify Google OAuth Setup
1. Client ID matches in both frontend and backend `.env`
2. Client Secret is correct in backend `.env`
3. Redirect URIs are whitelisted in Google Cloud Console
4. OAuth consent screen is configured

## Manual Test

Try this manual flow:

1. Get OAuth URL:
```bash
curl -X POST http://localhost:8000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"redirect_uri": "http://localhost:8000/api/auth/callback"}'
```

2. Copy the `authorization_url` from response
3. Paste it in browser
4. Complete Google login
5. You should be redirected back with a code parameter

If this works, the issue is in the frontend integration.
