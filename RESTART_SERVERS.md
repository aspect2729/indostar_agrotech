# Restart Servers

The dev login code has been fixed. Please restart both servers:

## Step 1: Stop Current Servers

Press `Ctrl+C` in both terminal windows to stop the servers.

## Step 2: Restart Backend

```bash
cd backend
uvicorn main:app --reload
```

Wait for: `Application startup complete.`

## Step 3: Restart Frontend

```bash
cd frontend
npm start
```

## Step 4: Try Dev Login Again

Go to: http://localhost:3000/dev-login

Click any quick login button!

## What Was Fixed

1. ✅ Fixed duplicate key error in dev_auth.py
2. ✅ Cleaned up database with cleanup script
3. ✅ Added better error handling
4. ✅ Made google_id generation more robust

## If Still Having Issues

Run the cleanup script again:

```bash
cd backend
python cleanup_dev_users.py
```

This will remove any problematic users from the database.
