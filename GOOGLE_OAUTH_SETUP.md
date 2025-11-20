# Google OAuth Setup Guide

## Step-by-Step Instructions

You've already created a project on Google Cloud Console. Now let's get your OAuth credentials!

### Step 1: Enable Google+ API

1. In your Google Cloud Console project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click on **"Google+ API"**
4. Click **"Enable"** button
5. Wait for it to enable (takes a few seconds)

### Step 2: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"** (left sidebar)

2. **Choose User Type**:
   - Select **"External"** (for testing with any Google account)
   - Click **"Create"**

3. **Fill in App Information**:
   - **App name**: `Indostar E-commerce` (or your preferred name)
   - **User support email**: Your email address
   - **App logo**: (Optional - skip for now)
   - **Application home page**: `http://localhost:3000`
   - **Application privacy policy link**: (Optional - can skip for development)
   - **Application terms of service link**: (Optional - can skip for development)
   - **Authorized domains**: Leave empty for localhost testing
   - **Developer contact information**: Your email address
   - Click **"Save and Continue"**

4. **Scopes** (Step 2):
   - Click **"Add or Remove Scopes"**
   - Select these scopes:
     - `userinfo.email`
     - `userinfo.profile`
     - `openid`
   - Click **"Update"**
   - Click **"Save and Continue"**

5. **Test Users** (Step 3):
   - Click **"Add Users"**
   - Add your Gmail address (and any other test users)
   - Click **"Add"**
   - Click **"Save and Continue"**

6. **Summary** (Step 4):
   - Review your settings
   - Click **"Back to Dashboard"**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"** (left sidebar)

2. Click **"+ Create Credentials"** at the top

3. Select **"OAuth client ID"**

4. **Configure OAuth Client**:
   - **Application type**: Select **"Web application"**
   - **Name**: `Indostar Web Client` (or your preferred name)
   
5. **Authorized JavaScript origins**:
   - Click **"+ Add URI"**
   - Add: `http://localhost:3000`
   - Click **"+ Add URI"** again
   - Add: `http://localhost:8000`

6. **Authorized redirect URIs**:
   - Click **"+ Add URI"**
   - Add: `http://localhost:8000/api/auth/callback`
   - Click **"+ Add URI"** again  
   - Add: `http://localhost:3000/auth/callback`

7. Click **"Create"**

### Step 4: Copy Your Credentials

After clicking Create, a popup will appear with your credentials:

1. **Copy the Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
2. **Copy the Client Secret** (looks like: `GOCSPX-abc123def456`)
3. Click **"OK"**

**Important**: Keep these credentials secure! Don't share them publicly.

### Step 5: Update Your Configuration Files

Now update your environment files with these credentials:

#### Backend `.env` file:

Open `backend/.env` and update these lines:

```env
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback
```

Replace `YOUR_CLIENT_ID_HERE` and `YOUR_CLIENT_SECRET_HERE` with your actual credentials.

#### Frontend `.env` file:

Open `frontend/.env` (create it if it doesn't exist) and add:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

Replace `YOUR_CLIENT_ID_HERE` with your actual Client ID.

### Step 6: Restart Your Servers

After updating the configuration files:

1. **Restart Backend**:
   - The backend should auto-reload if using `--reload` flag
   - Or stop and restart: `uvicorn main:app --reload`

2. **Restart Frontend**:
   - Stop the frontend (Ctrl+C)
   - Start again: `npm start`

### Step 7: Test the Login

1. Open your browser to: `http://localhost:3000`
2. Click the **"Login with Google"** button
3. You should see the Google sign-in page
4. Sign in with your Google account
5. Grant permissions when asked
6. You should be redirected back to your app and logged in!

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem**: The redirect URI doesn't match what's configured in Google Console.

**Solution**:
1. Go back to Google Cloud Console → Credentials
2. Click on your OAuth client ID
3. Make sure these URIs are added:
   - `http://localhost:8000/api/auth/callback`
   - `http://localhost:3000/auth/callback`
4. Save and try again

### Error: "Access blocked: This app's request is invalid"

**Problem**: OAuth consent screen not properly configured.

**Solution**:
1. Go to OAuth consent screen
2. Make sure you've added your email as a test user
3. Make sure the app is in "Testing" mode (not "Production")

### Error: "invalid_client"

**Problem**: Client ID or Client Secret is incorrect.

**Solution**:
1. Double-check you copied the credentials correctly
2. Make sure there are no extra spaces
3. Verify the credentials in Google Cloud Console

### Can't Find OAuth Consent Screen

**Problem**: You might be in the wrong project.

**Solution**:
1. Check the project name at the top of Google Cloud Console
2. Make sure you're in the correct project
3. Use the project selector dropdown if needed

## Security Notes for Production

When deploying to production:

1. **Update Authorized Origins**:
   - Add your production domain (e.g., `https://yourdomain.com`)
   - Remove localhost URLs

2. **Update Redirect URIs**:
   - Add production callback URL (e.g., `https://yourdomain.com/api/auth/callback`)
   - Remove localhost URLs

3. **OAuth Consent Screen**:
   - Submit for verification if needed
   - Update privacy policy and terms of service links

4. **Environment Variables**:
   - Use secure environment variable management
   - Never commit credentials to version control
   - Use different credentials for dev/staging/production

## Quick Reference

### Required URLs for OAuth Configuration:

**Authorized JavaScript origins**:
- `http://localhost:3000`
- `http://localhost:8000`

**Authorized redirect URIs**:
- `http://localhost:8000/api/auth/callback`
- `http://localhost:3000/auth/callback`

### Required Scopes:
- `userinfo.email`
- `userinfo.profile`
- `openid`

---

**Once configured, your Google OAuth login will work perfectly!** 🎉
