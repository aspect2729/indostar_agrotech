# Indostar E-commerce Backend

Backend API for Indostar Agrotech Private Limited e-commerce platform built with FastAPI, MongoDB, and Python.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py          # Application configuration
│   ├── models/            # Pydantic models and schemas
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic layer
│   └── utils/             # Utility functions
├── main.py                # FastAPI application entry point
├── requirements.txt       # Python dependencies
├── .env.example          # Example environment variables
└── README.md             # This file
```

## Setup Instructions

### 1. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update with your configuration:

```bash
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac
```

Update the following variables in `.env`:
- `MONGODB_URL`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
- `CORS_ORIGINS`: Comma-separated list of allowed origins

### 4. Run the Application

```bash
# Development mode (with auto-reload)
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive API docs: http://localhost:8000/api/docs
- Alternative API docs: http://localhost:8000/api/redoc

## API Endpoints

### Health Check
- `GET /` - Root endpoint
- `GET /api/health` - Health check endpoint

### Authentication (Coming Soon)
- `POST /api/auth/google` - Initiate Google OAuth
- `POST /api/auth/callback` - OAuth callback handler
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Products (Coming Soon)
- `GET /api/products` - List products
- `GET /api/products/{id}` - Get product details
- `POST /api/products` - Create product (Owner only)
- `PUT /api/products/{id}` - Update product (Owner only)
- `DELETE /api/products/{id}` - Delete product (Owner only)

### Orders (Coming Soon)
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders
- `GET /api/orders/{id}` - Get order details
- `PUT /api/orders/{id}/status` - Update order status (Owner only)

### Inventory (Coming Soon)
- `GET /api/inventory` - List inventory (Owner only)
- `PUT /api/inventory/{product_id}` - Update inventory (Owner only)
- `GET /api/inventory/alerts` - Get low-stock alerts (Owner only)

### Users (Coming Soon)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Development

### Code Style
- Follow PEP 8 guidelines
- Use type hints for function parameters and return values
- Document functions with docstrings

### Testing
```bash
# Run tests (when implemented)
pytest

# Run with coverage
pytest --cov=app
```

## Dependencies

- **FastAPI**: Modern web framework for building APIs
- **Uvicorn**: ASGI server for running FastAPI
- **Motor**: Async MongoDB driver
- **Pydantic**: Data validation using Python type annotations
- **python-jose**: JWT token handling
- **python-dotenv**: Environment variable management
- **google-auth**: Google OAuth authentication

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URL | MongoDB connection string | mongodb://localhost:27017 |
| DATABASE_NAME | Database name | indostar |
| JWT_SECRET | Secret key for JWT signing | - |
| JWT_ALGORITHM | JWT algorithm | HS256 |
| ACCESS_TOKEN_EXPIRE_MINUTES | Access token expiration | 30 |
| REFRESH_TOKEN_EXPIRE_DAYS | Refresh token expiration | 7 |
| GOOGLE_CLIENT_ID | Google OAuth client ID | - |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret | - |
| GOOGLE_REDIRECT_URI | OAuth redirect URI | http://localhost:8000/api/auth/callback |
| CORS_ORIGINS | Allowed CORS origins | http://localhost:3000 |
| ENVIRONMENT | Environment (development/production) | development |

## License

Proprietary - Indostar Agrotech Private Limited
