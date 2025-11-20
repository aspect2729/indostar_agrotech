# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally
   ```bash
   npm install -g vercel
   ```

## Deployment Steps

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Configure Environment Variables

Before deploying, you need to set up environment variables in Vercel:

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to your project on [vercel.com](https://vercel.com)
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

**Production Environment:**
- `REACT_APP_API_URL`: Your backend API URL (e.g., `https://your-backend.herokuapp.com` or your backend deployment URL)
- `REACT_APP_GOOGLE_CLIENT_ID`: `your-google-client-id.apps.googleusercontent.com`

**Preview/Development Environment:**
- Same variables but can point to staging/dev backend

#### Option B: Via CLI

```bash
# Add production environment variables
vercel env add REACT_APP_API_URL production
# Enter: https://your-backend-url.com

vercel env add REACT_APP_GOOGLE_CLIENT_ID production
# Enter: your-google-client-id.apps.googleusercontent.com
```

### 4. Deploy to Vercel

#### First Time Deployment

```bash
# From project root
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? indostar-ecommerce (or your preferred name)
# - In which directory is your code located? ./
```

#### Production Deployment

```bash
vercel --prod
```

### 5. Update Google OAuth Settings

After deployment, you need to update your Google OAuth configuration:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Add your Vercel URLs to **Authorized JavaScript origins**:
   - `https://your-app.vercel.app`
   - `https://your-custom-domain.com` (if using custom domain)
5. Add to **Authorized redirect URIs**:
   - `https://your-backend-url.com/api/auth/callback`

### 6. Verify Deployment

After deployment completes, Vercel will provide a URL. Visit it and check:

1. **Frontend loads correctly**
2. **API connection works** (check browser console for errors)
3. **Google OAuth login works**
4. **All routes are accessible**

## Monitoring Deployment

### View Logs

```bash
# View deployment logs
vercel logs

# View specific deployment
vercel logs [deployment-url]
```

### Check Build Status

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. View **Deployments** tab
4. Click on a deployment to see:
   - Build logs
   - Runtime logs
   - Function logs (if any)

### Enable Vercel Analytics (Optional)

1. Go to your project dashboard
2. Navigate to **Analytics** tab
3. Enable Web Analytics for performance monitoring

## Troubleshooting

### Build Fails

**Check build logs:**
```bash
vercel logs --follow
```

**Common issues:**
- Missing dependencies: Check `package.json`
- Environment variables not set
- Build script errors

**Solution:**
```bash
# Test build locally first
cd frontend
npm run build
```

### Runtime Errors

**Check browser console:**
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed API calls

**Common issues:**
- CORS errors: Backend needs to allow Vercel domain
- API URL incorrect: Check environment variables
- OAuth redirect mismatch: Update Google Console

### API Connection Issues

**Verify environment variables:**
```bash
vercel env ls
```

**Check API URL:**
- Open browser DevTools
- Check Network tab
- Verify API calls are going to correct URL

**Update if needed:**
```bash
vercel env rm REACT_APP_API_URL production
vercel env add REACT_APP_API_URL production
# Enter correct URL
```

### OAuth Not Working

1. **Check Google Console settings:**
   - Authorized origins include Vercel URL
   - Redirect URIs are correct

2. **Check environment variable:**
   ```bash
   vercel env ls
   ```

3. **Verify Client ID matches:**
   - Frontend env var
   - Backend env var
   - Google Console

## Custom Domain Setup

### Add Custom Domain

1. Go to project **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain name
4. Follow DNS configuration instructions

### Update DNS Records

Add these records to your domain provider:

**For apex domain (example.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Update OAuth Settings

After adding custom domain, update Google OAuth:
- Add custom domain to Authorized JavaScript origins
- Update redirect URIs if needed

## Continuous Deployment

Vercel automatically deploys when you push to your Git repository:

### Connect Git Repository

1. Go to project **Settings** → **Git**
2. Connect your GitHub/GitLab/Bitbucket repository
3. Configure:
   - **Production Branch**: `main` or `master`
   - **Preview Branches**: All other branches

### Automatic Deployments

- **Push to main**: Deploys to production
- **Push to other branches**: Creates preview deployment
- **Pull requests**: Creates preview deployment with unique URL

## Environment-Specific Configuration

### Production

```bash
vercel env add REACT_APP_API_URL production
# Enter production backend URL
```

### Preview (Staging)

```bash
vercel env add REACT_APP_API_URL preview
# Enter staging backend URL
```

### Development

```bash
vercel env add REACT_APP_API_URL development
# Enter development backend URL
```

## Backend Deployment

**Note:** Vercel is primarily for frontend. For the FastAPI backend, consider:

1. **Vercel Serverless Functions** (requires restructuring)
2. **Heroku** (recommended for Python/FastAPI)
3. **Railway**
4. **Render**
5. **DigitalOcean App Platform**
6. **AWS/GCP/Azure**

### Quick Backend Deployment Options

#### Option 1: Heroku (Recommended)

```bash
# Install Heroku CLI
# Create Procfile in backend/
echo "web: uvicorn main:app --host 0.0.0.0 --port $PORT" > backend/Procfile

# Deploy
cd backend
heroku create indostar-backend
heroku config:set MONGODB_URL="your-mongodb-url"
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set GOOGLE_CLIENT_ID="your-client-id"
heroku config:set GOOGLE_CLIENT_SECRET="your-client-secret"
git push heroku main
```

#### Option 2: Railway

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Deploy from GitHub
4. Add environment variables
5. Railway provides URL automatically

#### Option 3: Render

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

## Performance Optimization

### Enable Caching

Vercel automatically caches static assets. For API responses:

```javascript
// In your API service
const config = {
  headers: {
    'Cache-Control': 'public, max-age=300' // 5 minutes
  }
};
```

### Enable Compression

Vercel automatically compresses responses with gzip/brotli.

### Optimize Images

Use Vercel Image Optimization:

```javascript
import Image from 'next/image'; // If using Next.js
// Or use optimized image formats (WebP, AVIF)
```

## Security Checklist

- [ ] Environment variables set correctly
- [ ] No secrets in code
- [ ] CORS configured properly on backend
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] OAuth redirect URIs updated
- [ ] API rate limiting enabled
- [ ] Security headers configured

## Monitoring and Logging

### Built-in Monitoring

Vercel provides:
- Real-time logs
- Performance metrics
- Error tracking
- Analytics

### Access Logs

```bash
# Real-time logs
vercel logs --follow

# Specific deployment
vercel logs [deployment-url]

# Filter by type
vercel logs --filter=error
```

### Integration with External Services

Consider integrating:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Datadog**: Full-stack monitoring
- **New Relic**: APM

## Rollback

If deployment has issues:

```bash
# List deployments
vercel ls

# Promote previous deployment to production
vercel promote [deployment-url]
```

Or via dashboard:
1. Go to **Deployments**
2. Find working deployment
3. Click **⋯** → **Promote to Production**

## Cost Considerations

### Vercel Free Tier Includes:
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS
- Preview deployments
- Analytics (basic)

### Paid Plans:
- **Pro**: $20/month - More bandwidth, team features
- **Enterprise**: Custom pricing - SLA, support, advanced features

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Deployment Best Practices](https://vercel.com/docs/concepts/deployments/overview)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)

## Quick Commands Reference

```bash
# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]

# Environment variables
vercel env ls
vercel env add [name] [environment]
vercel env rm [name] [environment]

# Link project
vercel link

# Pull environment variables
vercel env pull

# Check project info
vercel inspect
```

---

**Ready to deploy?** Run `vercel` from the project root and follow the prompts!
