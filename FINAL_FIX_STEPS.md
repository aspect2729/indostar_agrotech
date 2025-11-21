# 🔧 FINAL FIX - Do These 3 Steps

## The Problem

Your frontend is calling: `https://indostar-backend.onrender.com` ❌  
Your actual backend is at: `https://indostar-agrotech-1.onrender.com` ✅

## The Solution (3 Steps - 5 Minutes)

### Step 1: Add Environment Variable in Vercel

**Option A: Via Dashboard (Recommended)**

1. Go to: https://vercel.com/adviks-projects-996cbcc2/indostar/settings/environment-variables
2. Click **"Add New"** button
3. Fill in:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://indostar-agrotech-1.onrender.com`
   - **Environments**: Check all 3 boxes (Production, Preview, Development)
4. Click **"Save"**

**Option B: Via Command Line**

Open your terminal and run:

```bash
vercel env add REACT_APP_API_URL production
```

When prompted, enter: `https://indostar-agrotech-1.onrender.com`

Then do the same for preview and development:

```bash
vercel env add REACT_APP_API_URL preview
```
Enter: `https://indostar-agrotech-1.onrender.com`

```bash
vercel env add REACT_APP_API_URL development
```
Enter: `https://indostar-agrotech-1.onrender.com`

---

### Step 2: Redeploy Frontend

In your terminal, run:

```bash
vercel --prod
```

Wait for it to finish (~30 seconds). You'll see:
```
✅ Production: https://indostar.vercel.app [copied to clipboard]
```

---

### Step 3: Clear Browser Cache

**Hard refresh your browser:**
- Windows: **Ctrl + Shift + R**
- Mac: **Cmd + Shift + R**

Or open in **Incognito/Private mode** to test with a clean cache.

---

## How to Verify It Worked

After completing all 3 steps:

1. Open browser console (F12)
2. Look for this log:
   ```
   [INFO] [API] API client initialized with base URL: https://indostar-agrotech-1.onrender.com
   ```

3. Try logging in - you should see requests going to `indostar-agrotech-1.onrender.com` (not `indostar-backend.onrender.com`)

4. **No more CORS errors!** ✅

---

## Why This Fixes It

- **Before**: Frontend doesn't know where backend is → uses wrong URL → CORS error
- **After**: Frontend knows correct backend URL → makes requests to right place → works!

---

## If It Still Doesn't Work

1. **Check Vercel environment variables:**
   ```bash
   vercel env ls
   ```
   You should see `REACT_APP_API_URL` in the list.

2. **Check if you redeployed:**
   ```bash
   vercel ls
   ```
   The latest deployment should be recent (within last few minutes).

3. **Check browser is not cached:**
   - Try incognito mode
   - Or clear all browser data for the site

---

## Summary

✅ **Step 1**: Add `REACT_APP_API_URL` to Vercel  
✅ **Step 2**: Redeploy with `vercel --prod`  
✅ **Step 3**: Hard refresh browser  

**That's it!** Your app will work after these 3 steps.

---

**Current Status:**
- ❌ You haven't done Step 1 yet (environment variable not added)
- ❌ You haven't done Step 2 yet (not redeployed)
- ❌ You haven't done Step 3 yet (browser still cached)

**Do all 3 steps now and it will work!**
