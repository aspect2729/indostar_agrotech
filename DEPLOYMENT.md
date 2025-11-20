# Deployment Guide - Indostar E-commerce Application

This guide provides comprehensive instructions for deploying the Indostar E-commerce Application in various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Google OAuth Configuration](#google-oauth-configuration)
5. [Docker Deployment](#docker-deployment)
6. [Manual Deployment](#manual-deployment)
7. [Production Considerations](#production-considerations)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Operating System**: Linux (Ubuntu 20.04+), macOS, or Windows 10+
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Disk Space**: Minimum 5GB free space
- **Network**: Stable internet connection for initial setup

### Software Requirements

#### For Docker Deployment
- Docker Engine 20.10+
- Docker Compose 2.0+

#### For Manual Deployment
- Node.js 16+ and npm
- Python 3.10+
- MongoDB 6.0+
- Nginx (for production)
- Git

### Installation Commands

**Ubuntu/Debian:**
```bash
# Update package list
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python
sudo apt install python3.10 python3-pip

# Install MongoDB (optional for local development)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
```

**macOS:**
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Docker Desktop
brew install --cask docker

# Install Node.js
brew install node

# Install Python
brew install python@3.10

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@6.0
```

**Windows:**
- Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)
- Download Node.js from [nodejs.org](https://nodejs.org/)
- Download Python from [python.org](https://www.python.org/)
- Download MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)

## Environment Configuration

### Backend Environment Variables

Create `backend/.env` file with the following configuration:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================

# Local MongoDB
MONGODB_URL=mongodb://localhost:27017

# OR MongoDB Atlas (Cloud)
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/indostar?retryWrites=true&w=majority

# Database name
DATABASE_NAME=indostar

# ============================================
# JWT CONFIGURATION
# ============================================

# Secret key for JWT token signing (CHANGE IN PRODUCTION!)
# Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
JWT_SECRET=your-secret-key-change-in-production

# JWT algorithm
JWT_ALGORITHM=HS256

# Token expiration times
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# ============================================
# GOOGLE OAUTH CONFIGURATION
# ============================================

# Get these from Google Cloud Console
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Redirect URI (update for production)
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback

# ============================================
# CORS CONFIGURATION
# ============================================

# Allowed origins (comma-separated for multiple)
CORS_ORIGINS=http://localhost:3000,http://localhost

# ============================================
# APPLICATION CONFIGURATION
# ============================================

# Environment: development, staging, production
ENVIRONMENT=development

# Log level: DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_LEVEL=INFO
```

### Frontend Environment Variables

Create `frontend/.env` file:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:8000

# Google OAuth Client ID (same as backend)
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Docker Environment Variables

Create `.env.docker` file in the root directory:

```env
# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=change-this-secure-password
MONGO_DATABASE=indostar

# Backend Configuration
JWT_SECRET=change-this-to-a-secure-random-string
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
CORS_ORIGINS=http://localhost:3000,http://localhost

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Generating Secure Secrets

**JWT Secret:**
```bash
# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# OpenSSL
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**MongoDB Password:**
```bash
# Generate strong password
openssl rand -base64 24
```

## Database Setup

### Option 1: Local MongoDB

#### Installation

**Ubuntu/Debian:**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
mongosh --eval "db.version()"
```

**macOS:**
```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community@6.0

# Start MongoDB
brew services start mongodb-community@6.0

# Verify installation
mongosh --eval "db.version()"
```

**Windows:**
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the MSI installer
3. Choose "Complete" installation
4. Install as a Windows Service
5. Start MongoDB service:
   ```powershell
   net start MongoDB
   ```

#### Configuration

Create MongoDB user (optional but recommended):

```bash
mongosh

# Switch to admin database
use admin

# Create admin user
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

# Create application user
use indostar
db.createUser({
  user: "indostar_app",
  pwd: "app_password",
  roles: [ { role: "readWrite", db: "indostar" } ]
})

exit
```

Update `backend/.env`:
```env
MONGODB_URL=mongodb://indostar_app:app_password@localhost:27017/indostar?authSource=indostar
```

#### Database Seeding and Migration

After setting up MongoDB, populate the database with initial data using the seeding scripts:

**Quick Start (Recommended):**
```bash
cd backend
python scripts/seed_all.py
```

This master script will:
- Create all database indexes for optimal performance
- Seed 12 products across all categories (jaggery, oil, chutney powder, pickles, milk)
- Create inventory records for all products
- Optionally create sample users for testing

**For Production (No Sample Users):**
```bash
cd backend
python scripts/seed_products.py
python scripts/seed_inventory.py
python scripts/migrate_indexes.py
python scripts/validate_data.py
```

**Verify Data Integrity:**
```bash
cd backend
python scripts/validate_data.py
```

For detailed information about seeding scripts, see:
- `backend/SEEDING_GUIDE.md` - Quick start guide
- `backend/scripts/README.md` - Complete documentation

**Manual Index Creation (Alternative):**

If you prefer to create indexes manually:

```bash
mongosh mongodb://localhost:27017/indostar

# Users collection indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "googleId": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })

# Products collection indexes
db.products.createIndex({ "name": 1 })
db.products.createIndex({ "category": 1 })
db.products.createIndex({ "isActive": 1 })
db.products.createIndex({ "name": "text", "description": "text" })

# Orders collection indexes
db.orders.createIndex({ "userId": 1 })
db.orders.createIndex({ "orderNumber": 1 }, { unique: true })
db.orders.createIndex({ "status": 1 })
db.orders.createIndex({ "createdAt": -1 })

# Inventory collection indexes
db.inventory.createIndex({ "productId": 1 }, { unique: true })
db.inventory.createIndex({ "quantity": 1 })

exit
```

### Option 2: MongoDB Atlas (Cloud)

#### Setup Steps

1. **Create Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up with email or Google account

2. **Create Cluster**
   - Click "Build a Database"
   - Select "M0 FREE" tier (no credit card required)
   - Choose cloud provider and region (closest to your users)
   - Name your cluster (e.g., "indostar-cluster")
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `indostar_admin`
   - Generate secure password (save it!)
   - Set privileges: "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IP addresses
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Select "Python" driver
   - Copy connection string

6. **Update Configuration**
   
   Update `backend/.env`:
   ```env
   MONGODB_URL=mongodb+srv://indostar_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/indostar?retryWrites=true&w=majority
   ```
   
   Replace:
   - `YOUR_PASSWORD` with your database user password
   - `cluster0.xxxxx` with your actual cluster address

#### Atlas Best Practices

- **Security**: Use IP whitelisting in production
- **Backups**: Enable automated backups (available in paid tiers)
- **Monitoring**: Use Atlas monitoring dashboard
- **Alerts**: Configure alerts for performance issues
- **Scaling**: Upgrade tier as needed for production

## Google OAuth Configuration

### Step-by-Step Setup

#### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Indostar E-commerce"
4. Click "Create"

#### 2. Enable Required APIs

1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on "Google+ API"
4. Click "Enable"

#### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type
3. Click "Create"
4. Fill in required information:
   - **App name**: Indostar E-commerce
   - **User support email**: Your email
   - **Developer contact**: Your email
5. Click "Save and Continue"
6. Add scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
7. Click "Save and Continue"
8. Add test users (your email addresses)
9. Click "Save and Continue"

#### 4. Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "+ Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Name: "Indostar Web Client"
5. Add Authorized JavaScript origins:
   - Development: `http://localhost:3000`, `http://localhost:8000`
   - Production: `https://yourdomain.com`
6. Add Authorized redirect URIs:
   - Development: `http://localhost:8000/api/auth/callback`
   - Production: `https://yourdomain.com/api/auth/callback`
7. Click "Create"
8. Copy Client ID and Client Secret

#### 5. Update Environment Files

Update `backend/.env`:
```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback
```

Update `frontend/.env`:
```env
REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

### Production OAuth Configuration

For production deployment:

1. **Update Authorized Origins**:
   - Add: `https://yourdomain.com`
   - Remove: `http://localhost:3000`, `http://localhost:8000`

2. **Update Redirect URIs**:
   - Add: `https://yourdomain.com/api/auth/callback`
   - Remove: `http://localhost:8000/api/auth/callback`

3. **Update Environment Variables**:
   ```env
   GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/callback
   ```

4. **Verify OAuth Consent Screen**:
   - Add privacy policy URL
   - Add terms of service URL
   - Submit for verification if needed

## Docker Deployment

### Quick Start

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd indostar-ecommerce-app
   ```

2. **Configure Environment**
   ```bash
   cp .env.docker.example .env.docker
   # Edit .env.docker with your values
   ```

3. **Build and Start**
   ```bash
   docker-compose --env-file .env.docker up -d --build
   ```

4. **Verify Deployment**
   ```bash
   docker-compose ps
   ```

5. **Access Application**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/api/docs

### Docker Commands Reference

```bash
# Start services
docker-compose --env-file .env.docker up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Restart services
docker-compose restart

# Rebuild and restart
docker-compose --env-file .env.docker up -d --build

# Execute commands in containers
docker-compose exec backend sh
docker-compose exec mongodb mongosh

# Remove all containers and volumes (WARNING: deletes data)
docker-compose down -v
```

### Docker Compose Configuration

The `docker-compose.yml` file defines three services:

1. **MongoDB**: Database service
2. **Backend**: FastAPI application
3. **Frontend**: React application with Nginx

### Health Checks

All services include health checks:

- **MongoDB**: Ping command every 10 seconds
- **Backend**: HTTP GET /api/health every 30 seconds
- **Frontend**: HTTP GET /health every 30 seconds

### Data Persistence

MongoDB data is persisted in Docker volumes:
- `indostar-mongodb-data`: Database files
- `indostar-mongodb-config`: Configuration files

### Backup and Restore

**Backup MongoDB:**
```bash
# Create backup
docker-compose exec mongodb mongodump --out /data/backup

# Copy backup to host
docker cp indostar-mongodb:/data/backup ./mongodb-backup-$(date +%Y%m%d)
```

**Restore MongoDB:**
```bash
# Copy backup to container
docker cp ./mongodb-backup indostar-mongodb:/data/restore

# Restore database
docker-compose exec mongodb mongorestore /data/restore
```

## Manual Deployment

### Backend Deployment

#### 1. Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3.10 python3-pip python3-venv -y

# Install Nginx (for reverse proxy)
sudo apt install nginx -y
```

#### 2. Deploy Backend

```bash
# Clone repository
git clone <repository-url>
cd indostar-ecommerce-app/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with production values

# Test backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### 3. Configure Systemd Service

Create `/etc/systemd/system/indostar-backend.service`:

```ini
[Unit]
Description=Indostar Backend API
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/var/www/indostar-ecommerce-app/backend
Environment="PATH=/var/www/indostar-ecommerce-app/backend/venv/bin"
ExecStart=/var/www/indostar-ecommerce-app/backend/venv/bin/gunicorn main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --access-logfile /var/log/indostar/access.log \
    --error-logfile /var/log/indostar/error.log

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable indostar-backend
sudo systemctl start indostar-backend
sudo systemctl status indostar-backend
```

### Frontend Deployment

#### 1. Build Frontend

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build
```

#### 2. Configure Nginx

Create `/etc/nginx/sites-available/indostar`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        root /var/www/indostar-ecommerce-app/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/indostar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 3. SSL/TLS Configuration (Production)

Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
```

Obtain certificate:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Auto-renewal:
```bash
sudo certbot renew --dry-run
```

## Production Considerations

### Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (UFW, iptables)
- [ ] Restrict MongoDB access
- [ ] Set up CORS properly
- [ ] Enable rate limiting
- [ ] Implement request validation
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Enable MongoDB authentication
- [ ] Use secure session cookies
- [ ] Implement CSRF protection
- [ ] Set up intrusion detection

### Performance Optimization

**Backend:**
- Use Gunicorn with multiple workers
- Enable response compression
- Implement caching (Redis)
- Optimize database queries
- Use connection pooling
- Enable async operations

**Frontend:**
- Enable Gzip compression
- Minify assets
- Use CDN for static files
- Implement lazy loading
- Optimize images
- Enable browser caching

**Database:**
- Create proper indexes
- Monitor query performance
- Use aggregation pipelines
- Implement sharding (if needed)
- Regular maintenance

### Monitoring Setup

**Application Monitoring:**
```bash
# Install monitoring tools
pip install prometheus-client
npm install prom-client
```

**Log Management:**
```bash
# Configure log rotation
sudo nano /etc/logrotate.d/indostar

/var/log/indostar/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

**Health Checks:**
- Backend: `http://localhost:8000/api/health`
- Frontend: `http://localhost/health`
- Database: `mongosh --eval "db.adminCommand('ping')"`

### Backup Strategy

**Database Backups:**
```bash
#!/bin/bash
# /usr/local/bin/backup-mongodb.sh

BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
mongodump --out "$BACKUP_DIR/$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/$DATE.tar.gz" "$BACKUP_DIR/$DATE"
rm -rf "$BACKUP_DIR/$DATE"

# Keep only last 7 days
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete
```

Schedule with cron:
```bash
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-mongodb.sh
```

**Application Backups:**
- Version control (Git)
- Configuration files
- Environment variables
- SSL certificates

### Scaling Considerations

**Horizontal Scaling:**
- Load balancer (Nginx, HAProxy)
- Multiple backend instances
- Session management (Redis)
- Database replication

**Vertical Scaling:**
- Increase server resources
- Optimize application code
- Database tuning

## Monitoring and Maintenance

### Log Locations

**Docker Deployment:**
```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

**Manual Deployment:**
- Backend: `/var/log/indostar/error.log`, `/var/log/indostar/access.log`
- Nginx: `/var/log/nginx/error.log`, `/var/log/nginx/access.log`
- MongoDB: `/var/log/mongodb/mongod.log`

### Health Check Endpoints

**Backend Health:**
```bash
curl http://localhost:8000/api/health
```

Response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Frontend Health:**
```bash
curl http://localhost/health
```

### Monitoring Commands

```bash
# Check service status
sudo systemctl status indostar-backend
sudo systemctl status nginx
sudo systemctl status mongod

# Check resource usage
htop
df -h
free -m

# Check network connections
netstat -tulpn | grep LISTEN

# Check MongoDB status
mongosh --eval "db.serverStatus()"

# Check application logs
tail -f /var/log/indostar/error.log
```

### Maintenance Tasks

**Weekly:**
- Review application logs
- Check disk space
- Monitor database size
- Review security logs

**Monthly:**
- Update dependencies
- Review performance metrics
- Test backup restoration
- Security audit

**Quarterly:**
- Update system packages
- Review and update documentation
- Capacity planning
- Disaster recovery drill

## Troubleshooting

### Common Issues

#### Backend Won't Start

**Symptom:** Backend service fails to start

**Solutions:**
1. Check MongoDB connection:
   ```bash
   mongosh $MONGODB_URL
   ```

2. Verify environment variables:
   ```bash
   cat backend/.env
   ```

3. Check Python dependencies:
   ```bash
   pip list
   pip install -r requirements.txt
   ```

4. Review logs:
   ```bash
   tail -f /var/log/indostar/error.log
   ```

#### Frontend Build Fails

**Symptom:** `npm run build` fails

**Solutions:**
1. Clear cache:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check Node version:
   ```bash
   node --version  # Should be 16+
   ```

3. Verify environment variables:
   ```bash
   cat frontend/.env
   ```

#### Database Connection Errors

**Symptom:** "Connection refused" or "Authentication failed"

**Solutions:**
1. Check MongoDB is running:
   ```bash
   sudo systemctl status mongod
   ```

2. Verify connection string:
   ```bash
   mongosh "$MONGODB_URL"
   ```

3. Check network access (Atlas):
   - Verify IP whitelist
   - Check credentials

4. Test connectivity:
   ```bash
   telnet localhost 27017
   ```

#### OAuth Errors

**Symptom:** "redirect_uri_mismatch" or "invalid_client"

**Solutions:**
1. Verify redirect URIs in Google Console match exactly
2. Check Client ID and Secret are correct
3. Ensure OAuth consent screen is configured
4. Add test users in Google Console
5. Clear browser cache and cookies

#### 502 Bad Gateway

**Symptom:** Nginx returns 502 error

**Solutions:**
1. Check backend is running:
   ```bash
   curl http://localhost:8000/api/health
   ```

2. Verify Nginx configuration:
   ```bash
   sudo nginx -t
   ```

3. Check Nginx logs:
   ```bash
   tail -f /var/log/nginx/error.log
   ```

4. Restart services:
   ```bash
   sudo systemctl restart indostar-backend
   sudo systemctl restart nginx
   ```

### Getting Help

1. Check application logs
2. Review this documentation
3. Search existing issues
4. Contact development team
5. Check MongoDB Atlas status (if using)
6. Review Google Cloud Console for OAuth issues

## Appendix

### Useful Commands

```bash
# System information
uname -a
lsb_release -a

# Check ports
sudo netstat -tulpn | grep LISTEN
sudo lsof -i :8000
sudo lsof -i :27017

# Process management
ps aux | grep python
ps aux | grep nginx
ps aux | grep mongod

# Disk usage
df -h
du -sh /var/lib/mongodb

# Memory usage
free -m
vmstat 1

# Network testing
ping google.com
curl -I http://localhost:8000
telnet localhost 27017
```

### Environment Variables Reference

See [Environment Configuration](#environment-configuration) section for complete list.

### Port Reference

- **3000**: Frontend development server
- **8000**: Backend API
- **80**: Frontend production (HTTP)
- **443**: Frontend production (HTTPS)
- **27017**: MongoDB

### Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

---

**For additional help, refer to the main [README.md](./README.md) or contact the development team.**
