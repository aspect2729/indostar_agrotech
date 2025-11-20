# Docker Deployment Guide

This guide explains how to build and run the Indostar E-commerce Application using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose 2.0 or higher
- At least 2GB of available RAM
- At least 5GB of available disk space

## Quick Start

### 1. Configure Environment Variables

Copy the example environment file and configure your values:

```bash
cp .env.docker.example .env.docker
```

Edit `.env.docker` and set the following required variables:
- `MONGO_ROOT_PASSWORD`: Strong password for MongoDB
- `JWT_SECRET`: Secret key for JWT token generation
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret

### 2. Build and Start Services

Build and start all services (MongoDB, Backend, Frontend):

```bash
docker-compose --env-file .env.docker up -d --build
```

### 3. Verify Services

Check that all services are running:

```bash
docker-compose ps
```

All services should show status as "Up" and "healthy".

### 4. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs
- **MongoDB**: localhost:27017

## Docker Commands

### Start Services

```bash
# Start all services
docker-compose --env-file .env.docker up -d

# Start specific service
docker-compose --env-file .env.docker up -d backend
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v
```

### View Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Rebuild Services

```bash
# Rebuild all services
docker-compose --env-file .env.docker up -d --build

# Rebuild specific service
docker-compose --env-file .env.docker up -d --build backend
```

### Execute Commands in Containers

```bash
# Access backend shell
docker-compose exec backend sh

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password

# Run backend tests
docker-compose exec backend pytest
```

## Service Details

### MongoDB Service

- **Image**: mongo:7.0
- **Port**: 27017
- **Data Persistence**: Volume `indostar-mongodb-data`
- **Health Check**: Ping command every 10 seconds

### Backend Service

- **Build Context**: ./backend
- **Port**: 8000
- **Dependencies**: MongoDB (waits for healthy status)
- **Workers**: 4 Gunicorn workers with Uvicorn
- **Health Check**: HTTP GET /api/health every 30 seconds

### Frontend Service

- **Build Context**: ./frontend
- **Port**: 80
- **Dependencies**: Backend (waits for healthy status)
- **Web Server**: Nginx
- **Health Check**: HTTP GET /health every 30 seconds

## Data Persistence

MongoDB data is persisted in Docker volumes:
- `indostar-mongodb-data`: Database files
- `indostar-mongodb-config`: Configuration files

To backup MongoDB data:

```bash
docker-compose exec mongodb mongodump --out /data/backup
docker cp indostar-mongodb:/data/backup ./mongodb-backup
```

To restore MongoDB data:

```bash
docker cp ./mongodb-backup indostar-mongodb:/data/backup
docker-compose exec mongodb mongorestore /data/backup
```

## Networking

All services communicate through the `indostar-network` bridge network:
- Services can reference each other by service name
- Backend connects to MongoDB using `mongodb:27017`
- Frontend connects to backend using the configured `REACT_APP_API_URL`

## Environment Variables

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URL | MongoDB connection string | mongodb://admin:password@mongodb:27017 |
| DATABASE_NAME | Database name | indostar |
| JWT_SECRET | JWT signing secret | (required) |
| GOOGLE_CLIENT_ID | Google OAuth client ID | (required) |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret | (required) |
| CORS_ORIGINS | Allowed CORS origins | http://localhost:3000,http://localhost |
| ENVIRONMENT | Environment name | production |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | http://localhost:8000 |
| REACT_APP_GOOGLE_CLIENT_ID | Google OAuth client ID | (required) |

## Troubleshooting

### Services Not Starting

Check service logs:
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

### Database Connection Issues

1. Verify MongoDB is healthy:
```bash
docker-compose ps mongodb
```

2. Check MongoDB logs:
```bash
docker-compose logs mongodb
```

3. Test MongoDB connection:
```bash
docker-compose exec mongodb mongosh -u admin -p password
```

### Frontend Not Loading

1. Check if backend is healthy:
```bash
curl http://localhost:8000/api/health
```

2. Verify environment variables are injected:
```bash
docker-compose exec frontend cat /usr/share/nginx/html/env-config.js
```

### Port Conflicts

If ports 80, 8000, or 27017 are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Frontend on port 8080
  - "8001:8000"  # Backend on port 8001
  - "27018:27017"  # MongoDB on port 27018
```

## Production Deployment

### Security Recommendations

1. **Change Default Passwords**: Use strong, unique passwords for MongoDB
2. **Secure JWT Secret**: Generate a strong random secret for JWT_SECRET
3. **Enable HTTPS**: Use a reverse proxy (Nginx, Traefik) with SSL certificates
4. **Restrict CORS**: Set CORS_ORIGINS to your production domain only
5. **Use Secrets Management**: Consider Docker Secrets or external secret managers
6. **Regular Updates**: Keep Docker images updated with security patches

### Performance Optimization

1. **Adjust Worker Count**: Modify Gunicorn workers based on CPU cores
2. **Enable Caching**: Configure Redis for session/cache storage
3. **Database Indexing**: Ensure MongoDB indexes are created
4. **Resource Limits**: Set memory and CPU limits in docker-compose.yml

Example resource limits:

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '1'
        memory: 1G
```

### Monitoring

Add monitoring services to docker-compose.yml:
- Prometheus for metrics collection
- Grafana for visualization
- ELK stack for log aggregation

## Development vs Production

For development, use the local setup with hot-reload:
- Backend: `cd backend && uvicorn main:app --reload`
- Frontend: `cd frontend && npm start`

For production, use Docker Compose as described in this guide.

## Support

For issues or questions:
1. Check service logs: `docker-compose logs -f`
2. Verify health checks: `docker-compose ps`
3. Review environment variables: `docker-compose config`
4. Consult the main README.md for application-specific documentation
