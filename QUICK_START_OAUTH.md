# Quick Start: Fix Google OAuth in 5 Minutes

## The Problem
Google OAuth login isn't working because you're using placeholder credentials.

## The Solution (Choose One)

### Option A: Use Dev Login (Fastest - 30 seconds)
Perfect for testing the app immediately without OAuth setup.

1. Start servers (if not running):
   ```bash
   # Terminal 1 - Backend
   cd backend
   uvicorn main:app --reload

   # Terminal 2 - Frontend  
   cd frontend
   npm start
   ```

2. Go to: **http://localhost:3000/dev-login**

3. Enter any email, name, and select role

4. Click "Dev Login" - Done! ✓

### Option B: Set Up Real Google OAuth (5-10 minutes)
Required for production deployment.

#### Step 1: Get Google Credentials (3 minutes)
1. Go to: https://console.cloud.google.com/
2. Create project → "Indostar Ecommerce"
3. APIs & Services → Credentials → Create OAuth Client ID
4. Add redirect URIs:
   - `http://localhost:8000/api/auth/callback`
   - `http://localhost:3000/login`
5. Copy Client ID and Client Secret

#### Step 2: Update Config Files (1 minute)

**backend/.env:**
```env
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET_HERE
```

**frontend/.env:**
```env
REACT_APP_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
```

#### Step 3: Restart Servers (1 minute)
```bash
# Stop both servers (Ctrl+C)
# Restart backend
cd backend
uvicorn main:app --reload

# Restart frontend
cd frontend
npm start
```

#### Step 4: Test (30 seconds)
1. Go to: http://localhost:3000/login
2. Click "Continue with Google"
3. Log in with Google
4. Done! ✓

## Verify Setup

Run this to check if everything is configured correctly:
```bash
cd backend
python test_oauth_config.py
```

## Need More Help?

- **Detailed setup guide:** See `FIX_GOOGLE_OAUTH.md`
- **Troubleshooting:** See `GOOGLE_OAUTH_DEBUG.md`
- **Issue explanation:** See `OAUTH_ISSUE_RESOLVED.md`

## Quick Commands

```bash
# Run setup script (Windows)
setup_oauth.bat

# Run setup script (Linux/Mac)
chmod +x setup_oauth.sh
./setup_oauth.sh

# Test configuration
cd backend
python test_oauth_config.py

# Start backend
cd backend
uvicorn main:app --reload

# Start frontend
cd frontend
npm start
```

## What's Working vs What's Not

✓ **Working:**
- OAuth implementation code
- Backend endpoints
- Frontend integration
- Dev login (temporary solution)

✗ **Not Working:**
- Google OAuth (needs real credentials)

## Bottom Line

Your app is fully functional! You just need to either:
1. Use dev login for testing (quick)
2. Set up real Google OAuth credentials (production-ready)

Both options take less than 5 minutes. Choose based on your needs!
