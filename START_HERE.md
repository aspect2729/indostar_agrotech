# 🚀 START HERE - Quick Start Guide

## Google OAuth is Bypassed! ✅

You can now test the application without setting up Google OAuth.

## 3 Simple Steps

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

Browser will open automatically.

### Step 3: Login
Go to:
```
http://localhost:3000/dev-login
```

Click any button:
- **🛒 Consumer** - Shop for products
- **💼 Distributor** - Bulk orders
- **👑 Owner** - Manage everything

## Done! 🎉

You're now logged in and can test the full application.

## What You Can Do

### As Consumer:
- Browse products by category
- View product details
- Add items to cart
- Place orders
- View order history

### As Distributor:
- View bulk pricing
- Place wholesale orders
- Track order status

### As Owner:
- Manage inventory
- View all orders
- See analytics
- Update product information

## Need Help?

- **Dev Login Guide**: See `DEV_LOGIN_GUIDE.md`
- **OAuth Bypass Info**: See `OAUTH_BYPASS_COMPLETE.md`
- **Troubleshooting**: See `QUICK_DEBUG_GUIDE.md`

## When You're Ready for Real OAuth

1. Get Google OAuth credentials from Google Cloud Console
2. Update `backend/.env` and `frontend/.env`
3. Remove dev login files (see `OAUTH_BYPASS_COMPLETE.md`)
4. Use regular login at `http://localhost:3000/login`

---

**Ready? Start the servers and go to http://localhost:3000/dev-login! 🚀**
