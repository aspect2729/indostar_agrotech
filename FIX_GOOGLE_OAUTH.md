# Fix Google OAuth Login - Step by Step Guide

## Problem Identified
The Google OAuth credentials in your `.env` files are **placeholder values**, not real Google OAuth credentials. This is why login is not working.

## Solution: Set Up Real Google OAuth Credentials

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project:**
   - Click on the project dropdown at the top
   - Click "New Project" or select existing project
   - Name it "Indostar Ecommerce" (or any name you prefer)

3. **Enable Google+ API:**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen:**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "External" user type
   - Click "Create"
   - Fill in required fields:
     - App name: `Indostar Ecommerce`
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - Skip "Scopes" (click "Save and Continue")
   - Add test users (your email addresses for testing)
   - Click "Save and Continue"

5. **Create OAuth 2.0 Client ID:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "Indostar Web Client"
   - **Authorized JavaScript origins:**
     - `http://localhost:3000`
     - `http://localhost:8000`
   - **Authorized redirect URIs:**
     - `http://localhost:8000/api/auth/callback`
     - `http://localhost:3000/login`
   - Click "Create"
   - **IMPORTANT:** Copy the Client ID and Client Secret that appear

### Step 2: Update Backend Configuration

1. **Edit `backend/.env`:**
   ```bash
   cd backend
   # Open .env in your editor
   ```

2. **Replace placeholder values with real credentials:**
   ```env
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_NAME=indostar
   JWT_SECRET=your-secret-key-change-in-production
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   
   # Replace these with YOUR actual Google OAuth credentials:
   GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
   GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET_HERE
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback
   
   CORS_ORIGINS=http://localhost:3000
   ENVIRONMENT=development
   ```

3. **Save the file**

### Step 3: Update Frontend Configuration

1. **Edit `frontend/.env`:**
   ```bash
   cd frontend
   # Open .env in your editor
   ```

2. **Replace placeholder with real Client ID:**
   ```env
   REACT_APP_API_URL=http://localhost:8000
   
   # Replace with YOUR actual Google Client ID:
   REACT_APP_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
   ```

3. **Save the file**

### Step 4: Restart Servers

1. **Stop both servers** (Ctrl+C in both terminals)

2. **Restart Backend:**
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```

3. **Restart Frontend:**
   ```bash
   cd frontend
   npm start
   ```

### Step 5: Test OAuth Login

1. **Open browser:** http://localhost:3000/login

2. **Open DevTools:** Press F12

3. **Click "Continue with Google"**

4. **Expected flow:**
   - Redirects to Google login page
   - You log in with your Google account
   - Google redirects back to your app
   - You're logged in successfully

## Verification Script

After updating credentials, run this to verify:

```bash
cd backend
python test_oauth_config.py
```

Expected output should show:
- ✓ Backend is running
- ✓ OAuth endpoint working
- ✓ Authorization URL generated

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution:** Go back to Google Cloud Console and verify redirect URIs exactly match:
- `http://localhost:8000/api/auth/callback`
- `http://localhost:3000/login`

### Error: "invalid_client"
**Solution:** Double-check you copied the Client ID and Secret correctly (no extra spaces)

### Error: "Access blocked: This app's request is invalid"
**Solution:** 
1. Make sure OAuth consent screen is configured
2. Add your email as a test user
3. Enable Google+ API

### Still Not Working?
1. Check browser console for errors (F12 > Console)
2. Check backend logs for errors
3. Verify both servers are running
4. Clear browser cache and cookies
5. Try in incognito/private browsing mode

## Quick Alternative: Use Dev Login

If you need to test the app immediately without setting up Google OAuth:

1. Navigate to: http://localhost:3000/dev-login
2. Enter any email and name
3. Select role (consumer/distributor/owner)
4. Click "Dev Login"

**Note:** Dev login should be disabled in production!

## Security Notes

⚠️ **IMPORTANT:**
- Never commit real credentials to Git
- Add `.env` to `.gitignore`
- Use different credentials for production
- Enable HTTPS in production
- Restrict OAuth to your domain in production

## Production Setup

When deploying to production:

1. Create new OAuth credentials for production domain
2. Update redirect URIs to production URLs:
   - `https://yourdomain.com/api/auth/callback`
   - `https://yourdomain.com/login`
3. Update `.env` files with production credentials
4. Disable dev login endpoint
5. Enable HTTPS
6. Publish OAuth consent screen (remove "Testing" status)

## Need Help?

If you're still having issues:
1. Share the error message from browser console
2. Share the error from backend logs
3. Verify you completed all steps above
4. Check that both servers are running

---

**Summary:**
The main issue is that your `.env` files contain placeholder values instead of real Google OAuth credentials. Follow the steps above to create real credentials and update your configuration files.
