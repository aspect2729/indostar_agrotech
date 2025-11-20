# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email or Google account
3. Complete the registration

## Step 2: Create a Free Cluster

1. After logging in, click **"Build a Database"**
2. Choose **"M0 FREE"** tier (no credit card required)
3. Select a cloud provider and region (choose one closest to you)
4. Name your cluster (e.g., "indostar-cluster")
5. Click **"Create"** (this takes 3-5 minutes)

## Step 3: Create Database User

1. Click **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create a username (e.g., "indostar_admin")
5. Create a strong password (save this!)
6. Set privileges to **"Read and write to any database"**
7. Click **"Add User"**

## Step 4: Configure Network Access

1. Click **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - This adds `0.0.0.0/0` to the whitelist
4. Click **"Confirm"**

## Step 5: Get Connection String

1. Go back to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Python"** as the driver
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Backend Configuration

1. Open the `backend/.env` file (create it if it doesn't exist)
2. Replace the MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/indostar_db?retryWrites=true&w=majority
   ```
   
   **Important:** 
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Replace `cluster0.xxxxx` with your actual cluster address
   - Add `/indostar_db` before the `?` to specify the database name

3. Save the file

## Step 7: Restart Backend

After updating the `.env` file, restart your backend server:
```bash
# Stop the current backend (Ctrl+C)
# Then restart:
uvicorn main:app --reload
```

## Example Connection String

```
MONGODB_URI=mongodb+srv://indostar_admin:MySecurePassword123@cluster0.abc123.mongodb.net/indostar_db?retryWrites=true&w=majority
```

## Troubleshooting

### Connection Timeout
- Make sure you've added your IP to the whitelist (or use 0.0.0.0/0)
- Check that your username and password are correct
- Ensure there are no special characters in the password that need URL encoding

### Authentication Failed
- Verify the username and password are correct
- Make sure the user has proper permissions

### Database Not Found
- MongoDB Atlas creates databases automatically when you first write data
- The database name in the connection string will be created if it doesn't exist

## Security Notes

For production:
1. Use specific IP addresses instead of 0.0.0.0/0
2. Use environment variables for credentials
3. Enable additional security features in Atlas
4. Regularly rotate passwords
5. Use VPC peering for enhanced security

## Next Steps

Once configured:
1. The backend will automatically connect to MongoDB Atlas
2. Collections will be created automatically when data is first inserted
3. You can view your data in the Atlas web interface under "Browse Collections"
