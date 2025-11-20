# Quick Debug Guide for Login Issues

## Step 1: Check if Backend is Running

Open a terminal and run:
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

Test it by opening: http://localhost:8000/docs

## Step 2: Check if Frontend is Running

Open another terminal and run:
```bash
cd frontend
npm start
```

The app should open at: http://localhost:3000

## Step 3: Use the Debug Tool

Open this file in your browser:
```
file:///C:/indostar/frontend/test-login.html
```

Or serve it:
```bash
cd frontend
npx serve -s . -p 3001
```

Then open: http://localhost:3001/test-login.html

## Step 4: Run the Tests

In the debug tool:

1. Click "Test Backend Connection" - should show ✓ Backend is running
2. Click "Test OAuth Initiation" - should show authorization URL
3. Click "Start Login (Customer)" - should redirect to Google

## Common Errors and Fixes

### Error: "Network error. Please check your connection"

**Cause:** Backend is not running or wrong URL

**Fix:**
1. Start backend: `cd backend && uvicorn main:app --reload`
2. Check `frontend/.env` has: `REACT_APP_API_URL=http://localhost:8000`

### Error: "redirect_uri_mismatch"

**Cause:** Google OAuth redirect URI not configured

**Fix:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Add these Authorized redirect URIs:
   - `http://localhost:8000/api/auth/callback`
   - `http://localhost:3000/login`
4. Click Save

### Error: "Invalid client"

**Cause:** Wrong Google Client ID or Secret

**Fix:**
1. Check `backend/.env` has correct:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
2. Check `frontend/.env` has correct:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your-client-id
   ```

### Error: MongoDB connection failed

**Cause:** MongoDB not running

**Fix (Local MongoDB):**
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

**Fix (MongoDB Atlas):**
1. Check `backend/.env` has correct connection string
2. Ensure your IP is whitelisted in Atlas

### Error: CORS policy error

**Cause:** CORS not configured

**Fix:**
Check `backend/.env` has:
```
CORS_ORIGINS=http://localhost:3000
```

Then restart backend.

## Manual Test Flow

### Test 1: Backend OAuth Endpoint

```bash
curl -X POST http://localhost:8000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"redirect_uri": "http://localhost:3000/login"}'
```

Expected response:
```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/auth?...",
  "state": "..."
}
```

### Test 2: Complete OAuth Flow

1. Get the authorization_url from Test 1
2. Open it in browser
3. Login with Google
4. You'll be redirected to: `http://localhost:3000/login?code=...&state=...`
5. The frontend should automatically exchange the code for tokens

## Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors (red text)
4. Common errors:
   - "Failed to fetch" = Backend not running
   - "CORS" = CORS not configured
   - "401" = Authentication failed
   - "redirect_uri_mismatch" = Google OAuth config issue

## Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Click login button
4. Look for `/api/auth/google` request
5. Check:
   - Status should be 200
   - Response should have `authorization_url`
   - No CORS errors

## Still Not Working?

### Get Detailed Logs

**Backend logs:**
The terminal running `uvicorn` shows all requests and errors.

**Frontend logs:**
Browser console (F12 → Console) shows all errors.

### Check Everything is Correct

Run this checklist:

```bash
# Backend
cd backend
cat .env | grep GOOGLE_CLIENT_ID
cat .env | grep GOOGLE_CLIENT_SECRET
cat .env | grep CORS_ORIGINS

# Frontend
cd frontend
cat .env | grep REACT_APP_API_URL
cat .env | grep REACT_APP_GOOGLE_CLIENT_ID
```

All values should match your Google Cloud Console credentials.

### Test with cURL

```bash
# Test OAuth initiation
curl -v -X POST http://localhost:8000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"redirect_uri": "http://localhost:3000/login"}'
```

Look for:
- HTTP 200 OK
- JSON response with authorization_url
- No CORS errors

## Need More Help?

Share these details:

1. **Error message** from browser console
2. **Network tab** screenshot showing the failed request
3. **Backend logs** from the terminal
4. **Environment files** (without secrets):
   ```bash
   # Backend
   cat backend/.env | grep -v SECRET
   
   # Frontend
   cat frontend/.env
   ```

## Quick Fix: Reset Everything

If nothing works, try resetting:

```bash
# Stop all servers (Ctrl+C)

# Clear browser data
# In browser: F12 → Application → Clear storage → Clear site data

# Restart backend
cd backend
uvicorn main:app --reload

# Restart frontend (in new terminal)
cd frontend
npm start
```

Then try logging in again.
