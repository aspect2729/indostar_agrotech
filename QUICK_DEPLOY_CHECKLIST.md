# 🚀 Quick Deploy Checklist

## Backend Deployment (Render)

### Prerequisites
- [x] MongoDB Atlas connection string: `mongodb+srv://advikgudodagi_db_user:<password>@cluster0.zz0gmfl.mongodb.net/indostar`
- [ ] MongoDB Atlas password ready
- [ ] GitHub account connected to Render

### Deployment Steps

1. **Go to Render**: https://render.com
2. **New Web Service** → Connect `aspect2729/indostar_agrotech`
3. **Configure**:
   - Name: `indostar-backend`
   - Root Directory: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Plan: Free

4. **Environment Variables** (see RENDER_DEPLOYMENT_CONFIG.md):
   ```
   MONGODB_URL = mongodb+srv://advikgudodagi_db_user:YOUR_PASSWORD@cluster0.zz0gmfl.mongodb.net/indostar?retryWrites=true&w=majority
   DATABASE_NAME = indostar
   JWT_SECRET = [Generate]
   JWT_ALGORITHM = HS256
   ACCESS_TOKEN_EXPIRE_MINUTES = 30
   REFRESH_TOKEN_EXPIRE_DAYS = 7
   GOOGLE_CLIENT_ID = your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET = your-google-client-secret
   GOOGLE_REDIRECT_URI = https://indostar-backend.onrender.com/api/auth/callback
   CORS_ORIGINS = https://indostar-m10nlzk43-adviks-projects-996cbcc2.vercel.app,https://indostar.vercel.app
   ENVIRONMENT = production
   LOG_LEVEL = INFO
   ```

5. **Deploy** → Wait 5-10 minutes

6. **Test**: Visit `https://indostar-backend.onrender.com/api/health`

---

## Frontend Update (Vercel)

1. **Go to**: https://vercel.com/adviks-projects-996cbcc2/indostar/settings/environment-variables

2. **Update `REACT_APP_API_URL`**:
   - Edit value to: `https://indostar-backend.onrender.com`
   - Save

3. **Redeploy**:
   ```bash
   vercel --prod
   ```

---

## Google OAuth Update

1. **Go to**: https://console.cloud.google.com/apis/credentials

2. **Add Redirect URI**:
   - `https://indostar-backend.onrender.com/api/auth/callback`

3. **Save**

---

## Test Everything

- [ ] Backend health: `https://indostar-backend.onrender.com/api/health`
- [ ] Frontend loads: `https://indostar-m10nlzk43-adviks-projects-996cbcc2.vercel.app`
- [ ] Login with Google works
- [ ] API calls succeed (check browser console)
- [ ] No CORS errors

---

## 📚 Detailed Guides

- **Backend**: [RENDER_DEPLOYMENT_CONFIG.md](./RENDER_DEPLOYMENT_CONFIG.md)
- **Frontend**: [VERCEL_ENV_VARIABLES.md](./VERCEL_ENV_VARIABLES.md)
- **Full Guide**: [BACKEND_DEPLOYMENT_GUIDE.md](./BACKEND_DEPLOYMENT_GUIDE.md)

---

**Estimated Time**: 15 minutes total
