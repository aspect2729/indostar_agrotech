# Development Login Guide (OAuth Bypass)

## Quick Start

I've created a temporary bypass for Google OAuth so you can test the application immediately.

### Step 1: Start Backend

```bash
cd backend
uvicorn main:app --reload
```

Wait for: `Application startup complete.`

### Step 2: Start Frontend

```bash
cd frontend
npm start
```

### Step 3: Access Dev Login

Open your browser to:
```
http://localhost:3000/dev-login
```

### Step 4: Quick Login

Click one of the quick login buttons:
- **🛒 Consumer** - Access consumer portal
- **💼 Distributor** - Access distributor portal  
- **👑 Owner** - Access owner dashboard

That's it! You'll be logged in immediately without Google OAuth.

## How It Works

The dev login:
1. Creates a test user in MongoDB (if doesn't exist)
2. Generates JWT tokens
3. Stores tokens in localStorage
4. Redirects you to the appropriate dashboard

## Custom Login

You can also enter a custom email and select a role:

1. Enter email (optional): `myemail@test.com`
2. Select role: Consumer, Distributor, or Owner
3. Click "Dev Login"

## Test Users

The quick login creates these test users:
- `consumer@test.com` - Consumer role
- `distributor@test.com` - Distributor role
- `owner@test.com` - Owner role

## Accessing Different Portals

After logging in, you'll be redirected to:

**Consumer Portal:**
- Home: `http://localhost:3000/consumer/home`
- Products: `http://localhost:3000/consumer/products`
- Cart: `http://localhost:3000/consumer/cart`
- Orders: `http://localhost:3000/consumer/orders`

**Distributor Portal:**
- Dashboard: `http://localhost:3000/distributor/dashboard`

**Owner Dashboard:**
- Dashboard: `http://localhost:3000/owner/dashboard`

## Switching Roles

To test different roles:

1. Logout from current portal
2. Go back to: `http://localhost:3000/dev-login`
3. Click a different quick login button

## API Endpoint

The dev login uses this backend endpoint:
```
POST http://localhost:8000/api/auth/dev-login
```

Request body:
```json
{
  "email": "test@example.com",
  "role": "consumer"
}
```

## Testing with cURL

You can also test the dev login API directly:

```bash
# Consumer login
curl -X POST http://localhost:8000/api/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email": "consumer@test.com", "role": "consumer"}'

# Distributor login
curl -X POST http://localhost:8000/api/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email": "distributor@test.com", "role": "distributor"}'

# Owner login
curl -X POST http://localhost:8000/api/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email": "owner@test.com", "role": "owner"}'
```

## ⚠️ Important: Production Warning

**This dev login MUST be removed before deploying to production!**

To remove it:

1. Delete `backend/app/routes/dev_auth.py`
2. Remove dev_auth import from `backend/main.py`
3. Delete `frontend/src/pages/DevLogin.tsx`
4. Remove DevLogin from `frontend/src/pages/index.ts`
5. Remove `/dev-login` route from `frontend/src/App.tsx`

## Troubleshooting

### "Dev login failed"

**Check:**
- Backend is running on port 8000
- MongoDB is running
- No errors in backend terminal

### "Cannot connect to backend"

**Fix:**
```bash
# Restart backend
cd backend
uvicorn main:app --reload
```

### Tokens not working

**Fix:**
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Clear all `indostar_*` items
4. Try logging in again

## Next Steps

Once you have real Google OAuth credentials:

1. Update `backend/.env` with real credentials
2. Update `frontend/.env` with real Client ID
3. Remove dev login files (see Production Warning above)
4. Use the regular login at `http://localhost:3000/login`

## Need Help?

If dev login isn't working:

1. Check backend logs in terminal
2. Check browser console (F12 → Console)
3. Verify MongoDB is running
4. Try restarting both servers
