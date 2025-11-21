# Render Manual Deploy Instructions

## Current Situation

The backend code has been updated with the bcrypt fix, but Render needs to be manually redeployed to apply the changes.

**Issue:** Email registration returning 500 error
**Root Cause:** bcrypt version incompatibility (fixed in code, needs deployment)
**Solution:** Manual deploy on Render dashboard

---

## Step-by-Step Instructions

### 1. Go to Render Dashboard

Open your browser and navigate to:
```
https://dashboard.render.com/
```

### 2. Log In

Use your Render credentials to log in.

### 3. Find Your Backend Service

- Look for the service named: **`indostar-agrotech-1`**
- It should be in your services list
- Click on it to open the service details

### 4. Trigger Manual Deploy

On the service page:
1. Look for the **"Manual Deploy"** button (usually top-right corner)
2. Click on it
3. Select **"Deploy latest commit"** from the dropdown
4. Confirm the deployment

### 5. Monitor Deployment

Watch the deployment logs:
- Click on the **"Logs"** tab
- You'll see the build process in real-time
- Look for these stages:
  ```
  ==> Building...
  ==> Installing dependencies...
  ==> Installing bcrypt==4.0.1...
  ==> Starting service...
  ==> Service is live
  ```

### 6. Wait for Completion

Deployment typically takes **2-3 minutes**:
- Build: 1-2 minutes
- Deploy: 30-60 seconds

---

## Verify Deployment Success

### Test 1: Check Health Endpoint

Open PowerShell and run:
```powershell
curl https://indostar-agrotech-1.onrender.com/api/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "environment": "production"
}
```

### Test 2: Test Email Registration

Run the test script:
```powershell
python test_400_error.py
```

**Expected Result:**
- Status Code: **200** (not 500)
- Response contains: `access_token`, `refresh_token`, `user_id`, `email`, `name`, `role`

**If still 500:** Wait another minute and test again (Render might still be deploying)

### Test 3: Test on Frontend

1. Go to: https://indostar.vercel.app
2. Click **"Email/Password"** option
3. Switch to **"Register"** tab
4. Fill in the form:
   - Email: `yourname@example.com`
   - Password: `YourPass123!`
   - Name: `Your Name`
   - Role: `Consumer`
5. Click **"Register"**
6. Should successfully create account and redirect to dashboard

---

## Troubleshooting

### Issue: Can't find "Manual Deploy" button

**Solution:**
- Make sure you're on the service details page (not the dashboard)
- The button might be labeled "Deploy" or have a dropdown arrow
- Try clicking on the service name first

### Issue: Still getting 500 error after deployment

**Possible causes:**
1. **Deployment not complete** - Wait another 1-2 minutes
2. **Build cache** - Clear Render build cache:
   - Go to service settings
   - Find "Clear build cache" option
   - Click it and redeploy

3. **Environment variables missing** - Verify these are set:
   ```
   MONGODB_URL=mongodb+srv://...
   JWT_SECRET=your-secret-key
   ```

### Issue: Build fails

**Check logs for:**
- `ERROR: Could not find a version that satisfies...`
  - Solution: Check requirements.txt syntax
- `ModuleNotFoundError: No module named 'passlib'`
  - Solution: Verify passlib[bcrypt]==1.7.4 is in requirements.txt

### Issue: Service starts but crashes immediately

**Check logs for:**
- Database connection errors
- Import errors
- Missing environment variables

**Solution:**
1. Verify MongoDB connection string is correct
2. Check all environment variables are set
3. Review startup logs for specific error messages

---

## Alternative: Trigger Deploy via Git

If you can't access Render dashboard, trigger deploy by pushing a commit:

```powershell
# Make a small change
cd backend
echo "# Deploy trigger" >> README.md

# Commit and push
cd ..
git add backend/README.md
git commit -m "Trigger Render redeploy"
git push origin main
```

Render will automatically detect the push and start deploying.

---

## What the Fix Does

The bcrypt version downgrade (4.1.2 → 4.0.1) fixes:

1. ✅ Password hashing works correctly
2. ✅ Email registration endpoint returns 200
3. ✅ Email login endpoint works
4. ✅ Phone login endpoint works
5. ✅ User passwords are securely hashed

---

## After Successful Deployment

### Test All Auth Methods

1. **Google OAuth** (already working)
   - Click "Login with Google"
   - Should redirect and authenticate

2. **Email Registration** (will work after deploy)
   - Register new account
   - Should create user and log in

3. **Email Login** (will work after deploy)
   - Log in with registered email
   - Should authenticate successfully

4. **Phone Login** (will work after deploy)
   - Log in with phone number
   - Should authenticate successfully

### Verify All User Roles

Test registration for each role:
- ✅ Consumer
- ✅ Distributor
- ✅ Owner

Each should redirect to their respective dashboard.

---

## Quick Reference

| Action | Command/URL |
|--------|-------------|
| Render Dashboard | https://dashboard.render.com/ |
| Backend Service | indostar-agrotech-1 |
| Health Check | `curl https://indostar-agrotech-1.onrender.com/api/health` |
| Test Registration | `python test_400_error.py` |
| Frontend URL | https://indostar.vercel.app |

---

## Timeline

| Time | Action | Status |
|------|--------|--------|
| 10:00 | Fixed bcrypt version, pushed to GitHub | ✅ Complete |
| 10:02 | Waiting for auto-deploy | ⏳ In progress |
| 10:05 | **Manual deploy needed** | 👉 **DO THIS NOW** |
| 10:08 | Deployment should be complete | ⏳ Pending |
| 10:10 | Test and verify | ⏳ Pending |

---

## Need Help?

If deployment fails or you encounter issues:

1. **Check Render logs** for specific error messages
2. **Verify environment variables** are all set correctly
3. **Check MongoDB connection** is working
4. **Review requirements.txt** for any syntax errors

---

**Next Step:** Go to Render dashboard and click "Manual Deploy" now!

**ETA:** 2-3 minutes after you trigger the deploy

**Test Command:** `python test_400_error.py` (should return 200 after deploy)
