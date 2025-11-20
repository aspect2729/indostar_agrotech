# Vercel Quick Start Guide

## 🚀 Deploy in 3 Steps

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

**For Windows:**
```bash
deploy-vercel.bat
```

**For Mac/Linux:**
```bash
npm install -g vercel
cd frontend
npm install
npm run build
cd ..
vercel --prod
```

## 📋 Pre-Deployment Checklist

- [ ] Backend API is deployed and accessible
- [ ] MongoDB database is set up (Atlas recommended)
- [ ] Google OAuth credentials are configured
- [ ] Environment variables are ready

## 🔧 Required Environment Variables

Set these in Vercel Dashboard (Settings → Environment Variables):

1. **REACT_APP_API_URL**
   - Your backend API URL
   - Example: `https://your-backend.herokuapp.com`

2. **REACT_APP_GOOGLE_CLIENT_ID**
   - Your Google OAuth Client ID
   - Example: `your-google-client-id.apps.googleusercontent.com`

## 🔍 Check Deployment Status

**For Windows:**
```bash
check-vercel-status.bat
```

**For Mac/Linux:**
```bash
vercel ls          # List deployments
vercel logs        # View logs
vercel env ls      # List environment variables
```

## 🐛 Troubleshooting

### Build Fails

```bash
# Test build locally first
cd frontend
npm install
npm run build
```

### API Connection Issues

1. Check browser console (F12)
2. Verify `REACT_APP_API_URL` in Vercel dashboard
3. Ensure backend allows CORS from Vercel domain

### OAuth Not Working

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Add Vercel URL to Authorized JavaScript origins
3. Add backend callback URL to Authorized redirect URIs

## 📊 View Logs

```bash
# Real-time logs
vercel logs --follow

# Last 100 lines
vercel logs

# Specific deployment
vercel logs [deployment-url]
```

## 🔄 Update Deployment

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

## 📱 Access Your App

After deployment, Vercel provides:
- **Preview URL**: `https://your-app-xxx.vercel.app`
- **Production URL**: `https://your-app.vercel.app`

## 🎯 Post-Deployment

1. **Test the application**
   - Login with Google
   - Check all features
   - Verify API connections

2. **Update Google OAuth**
   - Add Vercel URLs to Google Console
   - Test OAuth flow

3. **Monitor performance**
   - Check Vercel Analytics
   - Review error logs
   - Monitor API calls

## 📚 Additional Resources

- [Full Deployment Guide](./VERCEL_DEPLOYMENT.md)
- [Vercel Documentation](https://vercel.com/docs)
- [Troubleshooting Guide](./VERCEL_DEPLOYMENT.md#troubleshooting)

## 🆘 Need Help?

1. Check logs: `vercel logs`
2. Review [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
3. Check browser console for errors
4. Verify environment variables

---

**Ready to deploy?** Run `deploy-vercel.bat` (Windows) or `vercel --prod` (Mac/Linux)
