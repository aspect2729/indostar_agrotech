# Google OAuth Setup - Quick Checklist

## ✅ Step-by-Step Checklist

### 1. Enable Google+ API
- [ ] Go to **APIs & Services** → **Library**
- [ ] Search for "Google+ API"
- [ ] Click **Enable**

### 2. Configure OAuth Consent Screen
- [ ] Go to **APIs & Services** → **OAuth consent screen**
- [ ] Choose **External** user type
- [ ] Fill in:
  - [ ] App name: `Indostar E-commerce`
  - [ ] User support email: Your email
  - [ ] Developer contact: Your email
- [ ] Add scopes: `userinfo.email`, `userinfo.profile`, `openid`
- [ ] Add test users: Your Gmail address
- [ ] Save

### 3. Create OAuth Client ID
- [ ] Go to **APIs & Services** → **Credentials**
- [ ] Click **+ Create Credentials** → **OAuth client ID**
- [ ] Application type: **Web application**
- [ ] Name: `Indostar Web Client`
- [ ] Add **Authorized JavaScript origins**:
  - [ ] `http://localhost:3000`
  - [ ] `http://localhost:8000`
- [ ] Add **Authorized redirect URIs**:
  - [ ] `http://localhost:8000/api/auth/callback`
  - [ ] `http://localhost:3000/auth/callback`
- [ ] Click **Create**

### 4. Copy Credentials
- [ ] Copy **Client ID** (looks like: `123456-abc.apps.googleusercontent.com`)
- [ ] Copy **Client Secret** (looks like: `GOCSPX-abc123`)

### 5. Update Backend Configuration
- [ ] Open `backend/.env`
- [ ] Update `GOOGLE_CLIENT_ID=` with your Client ID
- [ ] Update `GOOGLE_CLIENT_SECRET=` with your Client Secret
- [ ] Save file

### 6. Update Frontend Configuration
- [ ] Open `frontend/.env` (create if doesn't exist)
- [ ] Add `REACT_APP_GOOGLE_CLIENT_ID=` with your Client ID
- [ ] Save file

### 7. Restart Servers
- [ ] Restart backend (auto-reloads if using --reload)
- [ ] Restart frontend (Ctrl+C then `npm start`)

### 8. Test Login
- [ ] Open `http://localhost:3000`
- [ ] Click "Login with Google"
- [ ] Sign in with your Google account
- [ ] Verify you're logged in successfully

## 📋 Configuration Summary

### Google Cloud Console Settings:

**Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:8000
```

**Authorized redirect URIs:**
```
http://localhost:8000/api/auth/callback
http://localhost:3000/auth/callback
```

**Scopes:**
```
userinfo.email
userinfo.profile
openid
```

### Environment Files:

**backend/.env:**
```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback
```

**frontend/.env:**
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your-client-id-here
```

## 🚨 Common Issues

**"redirect_uri_mismatch"**
→ Check redirect URIs match exactly in Google Console

**"Access blocked"**
→ Add your email as a test user in OAuth consent screen

**"invalid_client"**
→ Double-check Client ID and Secret are correct

---

**Need detailed instructions? See `GOOGLE_OAUTH_SETUP.md`**
