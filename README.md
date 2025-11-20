# Indostar E-commerce Application

A full-stack e-commerce platform for Indostar Agrotech Private Limited, enabling the sale of organic products (jaggery, oil, chutney powder, pickles, and milk) through three distinct user portals: Consumer, Distributor, and Owner.

## 🌟 Features

### Consumer Portal
- Browse and search organic products by category
- View detailed product information with nutritional facts
- Add products to cart and place orders
- Track order history and status
- Smooth animations and responsive design

### Distributor Portal
- Access wholesale pricing for bulk orders
- Place large quantity orders with inter-state delivery
- Track order status and history
- Reorder functionality for repeat purchases

### Owner Dashboard
- Manage product inventory in real-time
- View and update order statuses
- Monitor low-stock alerts
- Access sales analytics and trends
- Manage all user orders

## 🛠️ Technology Stack

### Frontend
- **React 18+** with TypeScript
- **React Router** for navigation
- **Axios** for API communication
- **CSS3** with animations
- **Context API** for state management

### Backend
- **Python 3.10+**
- **FastAPI** framework
- **Pydantic** for data validation
- **Motor** (async MongoDB driver)
- **Google OAuth2** for authentication
- **JWT** for session management

### Database
- **MongoDB 6.0+**
- Collections: users, products, orders, inventory

### Deployment
- **Docker** and **Docker Compose**
- **Nginx** for frontend serving
- **Gunicorn + Uvicorn** for backend

## 📋 Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.10+
- **MongoDB** 6.0+ (local or Atlas)
- **Docker** and **Docker Compose** (for containerized deployment)
- **Google OAuth** credentials (optional for development)

## 🚀 Quick Start (Development)

### Option 1: Development Mode with Dev Login (Fastest)

This option bypasses Google OAuth for quick testing.

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd indostar-ecommerce-app
   ```

2. **Set up MongoDB**
   - Install MongoDB locally (see [MongoDB Setup](#mongodb-setup))
   - Or use MongoDB Atlas (see [MongoDB Atlas Setup](#mongodb-atlas-setup))

3. **Start Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   uvicorn main:app --reload
   ```

4. **Start Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm start
   ```

5. **Access the Application**
   - Open browser to: `http://localhost:3000/dev-login`
   - Click any role button to login without OAuth

### Option 2: Development Mode with Google OAuth

1. Follow steps 1-4 from Option 1
2. Set up Google OAuth credentials (see [Google OAuth Setup](#google-oauth-setup))
3. Update `.env` files with OAuth credentials
4. Access at: `http://localhost:3000/login`

### Option 3: Docker Deployment (Production-Ready)

See the [DEPLOYMENT.md](./DEPLOYMENT.md) file for complete Docker deployment instructions.

## 📖 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[DOCKER_README.md](./DOCKER_README.md)** - Docker-specific instructions
- **[START_HERE.md](./START_HERE.md)** - Quick start guide
- **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** - OAuth configuration
- **[backend/MONGODB_LOCAL_SETUP.md](./backend/MONGODB_LOCAL_SETUP.md)** - Local MongoDB setup
- **[backend/MONGODB_ATLAS_SETUP.md](./backend/MONGODB_ATLAS_SETUP.md)** - Cloud MongoDB setup
- **[backend/SEEDING_GUIDE.md](./backend/SEEDING_GUIDE.md)** - Database seeding quick start
- **[backend/scripts/README.md](./backend/scripts/README.md)** - Seeding scripts documentation

## 🔧 Configuration

### Environment Variables

#### Backend (`backend/.env`)

```env
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=indostar

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Google OAuth (optional for dev)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback

# CORS
CORS_ORIGINS=http://localhost:3000

# Environment
ENVIRONMENT=development
```

#### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🗄️ MongoDB Setup

### Local MongoDB

1. Download and install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```
3. Verify connection:
   ```bash
   mongosh mongodb://localhost:27017
   ```

See [backend/MONGODB_LOCAL_SETUP.md](./backend/MONGODB_LOCAL_SETUP.md) for detailed instructions.

### MongoDB Atlas (Cloud)

1. Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Configure database user and network access
4. Get connection string and update `MONGODB_URL` in `.env`

See [backend/MONGODB_ATLAS_SETUP.md](./backend/MONGODB_ATLAS_SETUP.md) for detailed instructions.

### Database Seeding

After setting up MongoDB, populate it with initial data:

```bash
cd backend
python scripts/seed_all.py
```

This will:
- ✓ Create database indexes for optimal performance
- ✓ Seed 12 products (jaggery, oil, chutney powder, pickles, milk)
- ✓ Create inventory records
- ✓ Optionally add sample users for testing

**Verify the data:**
```bash
python scripts/validate_data.py
```

See [backend/SEEDING_GUIDE.md](./backend/SEEDING_GUIDE.md) for detailed seeding instructions.

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials
6. Add authorized origins and redirect URIs:
   - Origins: `http://localhost:3000`, `http://localhost:8000`
   - Redirect URIs: `http://localhost:8000/api/auth/callback`
7. Copy Client ID and Client Secret to `.env` files

See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for detailed step-by-step instructions.

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📁 Project Structure

```
indostar-ecommerce-app/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── models/         # Pydantic models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── schemas/        # Request/response schemas
│   │   ├── middleware/     # Custom middleware
│   │   └── utils/          # Utility functions
│   ├── tests/              # Backend tests
│   ├── main.py             # FastAPI application
│   └── requirements.txt    # Python dependencies
├── frontend/               # React TypeScript frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   ├── styles/        # CSS files
│   │   └── utils/         # Utility functions
│   └── package.json       # Node dependencies
├── docker-compose.yml     # Docker orchestration
└── README.md             # This file
```

## 🚢 Deployment

For production deployment:

1. **Using Docker** (Recommended)
   - See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions
   - Configure production environment variables
   - Use Docker Compose for orchestration

2. **Manual Deployment**
   - Deploy backend with Gunicorn + Uvicorn
   - Build frontend with `npm run build`
   - Serve frontend with Nginx
   - Use MongoDB Atlas for database
   - Configure SSL/TLS certificates

## 🔒 Security Considerations

- Change default JWT secret in production
- Use strong MongoDB passwords
- Enable HTTPS in production
- Restrict CORS origins to production domains
- Keep dependencies updated
- Use environment-specific configurations
- Never commit `.env` files to version control

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB is running: `mongosh mongodb://localhost:27017`
- Verify `.env` file exists and has correct values
- Check Python version: `python --version` (should be 3.10+)

### Frontend won't start
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version` (should be 16+)
- Verify `.env` file exists

### Database connection errors
- Verify MongoDB is running
- Check connection string in `.env`
- Ensure database user has proper permissions (Atlas)
- Check network access settings (Atlas)

### OAuth errors
- Verify Google OAuth credentials are correct
- Check redirect URIs match in Google Console
- Ensure OAuth consent screen is configured
- Add test users in Google Console

## 📝 API Documentation

Once the backend is running, access interactive API documentation at:
- **Swagger UI**: `http://localhost:8000/api/docs`
- **ReDoc**: `http://localhost:8000/api/redoc`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## 📄 License

[Add your license information here]

## 👥 Team

Indostar Agrotech Private Limited

## 📞 Support

For issues or questions:
- Check the documentation in the `/docs` folder
- Review troubleshooting section above
- Check existing issues on GitHub
- Contact the development team

## 🎯 Roadmap

### Version 1.0 (Current)
- ✅ Consumer, Distributor, and Owner portals
- ✅ Google OAuth authentication
- ✅ Product catalog and search
- ✅ Order management
- ✅ Inventory tracking
- ✅ Inter-state delivery support

### Version 2.0 (Planned)
- 🔄 Razorpay payment integration
- 🔄 Product reviews and ratings
- 🔄 Wishlist functionality
- 🔄 Email notifications
- 🔄 SMS notifications
- 🔄 Advanced analytics
- 🔄 Promotional codes and discounts

---

**Built with ❤️ for Indostar Agrotech Private Limited**
