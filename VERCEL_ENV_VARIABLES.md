# Vercel Environment Variables Configuration

## 🔧 Frontend Environment Variables

Add these in Vercel Dashboard: https://vercel.com/adviks-projects-996cbcc2/indostar/settings/environment-variables

### Required Variables for Frontend

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `REACT_APP_API_URL` | `http://localhost:8000` (⚠️ Update after backend deployment) | Production, Preview, Development |
| `REACT_APP_GOOGLE_CLIENT_ID` | `your-google-client-id.apps.googleusercontent.com` | Production, Preview, Development |
| `CI` | `false` | Production, Preview, Development |
| `DISABLE_ESLINT_PLUGIN` | `true` | Production, Preview, Development |

## 📝 Step-by-Step Instructions

### 1. Go to Vercel Dashboard
Visit: https://vercel.com/adviks-projects-996cbcc2/indostar/settings/environment-variables

### 2. Add Each Variable

For each variable above:

1. Click **"Add New"** button
2. Enter **Name** (e.g., `REACT_APP_API_URL`)
3. Enter **Value** (from table above)
4. Select **Environments**: Check all three boxes
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **"Save"**

### 3. Update API URL After Backend Deployment

Once your backend is deployed:

1. Go back to Environment Variables
2. Find `REACT_APP_API_URL`
3. Click **Edit**
4. Update value to your backend URL (e.g., `https://your-backend.herokuapp.com`)
5. Click **Save**
6. Redeploy: `vercel --prod`

## 🚀 Backend Deployment (Required First)

Your backend needs to be deployed before the frontend will work. Here are the environment variables your backend needs:

### Backend Environment Variables (for Heroku/Railway/Render)

```bash
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=indostar

# JWT Configuration
JWT_SECRET=vyudi_7Rfik1_dDbbCF-ZUejFhOw_t2Ehjbux8SKvZk
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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y
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback

# CORS (Update with your Vercel URL)
CORS_ORIGINS=https://indostar-m10nlzk43-adviks-projects-996cbcc2.vercel.app,https://indostar.vercel.app

# Application
ENVIRONMENT=production
LOG_LEVEL=INFO
```

## 🔐 Security Notes

⚠️ **IMPORTANT**: The values shown above are from your local development environment. For production:

1. **Generate new JWT_SECRET**: 
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Use MongoDB Atlas** (not local MongoDB):
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create free cluster
   - Get connection string
   - Use as `MONGODB_URL`

3. **Update GOOGLE_REDIRECT_URI** to your production backend URL

4. **Update CORS_ORIGINS** to include your Vercel URL

## 📋 Quick Copy-Paste for Vercel CLI

If you prefer using CLI to add environment variables:

```bash
# Add API URL (update after backend deployment)
vercel env add REACT_APP_API_URL production
# Enter: http://localhost:8000 (temporary)

# Add Google Client ID
vercel env add REACT_APP_GOOGLE_CLIENT_ID production
# Enter: your-google-client-id.apps.googleusercontent.com

# Add CI flag
vercel env add CI production
# Enter: false

# Add ESLint disable flag
vercel env add DISABLE_ESLINT_PLUGIN production
# Enter: true

# Repeat for preview and development environments
```

## 🎯 After Adding Variables

1. **Redeploy your frontend**:
   ```bash
   vercel --prod
   ```

2. **Verify in browser console**:
   - Open https://indostar-m10nlzk43-adviks-projects-996cbcc2.vercel.app
   - Press F12 to open DevTools
   - Check Console for `[INFO] Environment initialized` log
   - Verify API URL is correct

## 🐛 Troubleshooting

### Variables Not Taking Effect

1. Make sure you selected all environments when adding
2. Redeploy after adding variables: `vercel --prod`
3. Clear browser cache
4. Check browser console for actual values being used

### API Calls Still Failing

1. Verify backend is deployed and accessible
2. Check `REACT_APP_API_URL` matches your backend URL exactly
3. Ensure backend CORS allows your Vercel domain
4. Check browser Network tab for actual API calls

---

**Next Step**: Deploy your backend first, then update `REACT_APP_API_URL` in Vercel!
