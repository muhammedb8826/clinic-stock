# Docker Setup for Clinic Stock Management System

This document provides instructions for running the Clinic Stock Management System using Docker and Docker Compose.

## Quick Start

1. **Start all services**:
   ```bash
   docker-compose up --build -d
   ```

2. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - API Documentation: http://localhost:4000/api/docs
   - Database: localhost:5432

## Services

### Frontend (Next.js)
- **Port**: 3000
- **Container**: pharmacy-frontend
- **Access**: http://localhost:3000

### Backend API (NestJS)
- **Port**: 4000
- **Container**: pharmacy-api
- **Access**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api/docs

### Database (PostgreSQL)
- **Port**: 5432
- **Container**: pharmacy
- **Database**: pharmacy
- **Username**: postgres
- **Password**: postgres

## Docker Commands

### Basic Operations

```bash
# Start all services
docker-compose up -d

# Start with build
docker-compose up --build -d

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose down -v

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f db
```

### Development

```bash
# Rebuild specific service
docker-compose build api
docker-compose up -d api

# Execute commands in running container
docker-compose exec api npm run migration:run
docker-compose exec db psql -U postgres -d pharmacy
```

### Monitoring

```bash
# Check service status
docker-compose ps

# View resource usage
docker stats
```

## Database Management

### Accessing the Database

```bash
# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d pharmacy

# Backup database
docker-compose exec db pg_dump -U postgres pharmacy > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres pharmacy < backup.sql
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: If ports 3000, 3001, or 5432 are already in use, modify the ports in `docker-compose.yml`

2. **Build failures**: 
   - Check Docker logs: `docker-compose logs`
   - Rebuild without cache: `docker-compose build --no-cache`

3. **Database connection issues**: Wait for the database to be ready:
   ```bash
   docker-compose logs db
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs api
docker-compose logs frontend
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f --tail=100 api
```

### Reset Everything

```bash
# Stop and remove everything (including volumes)
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Remove all unused Docker resources
docker system prune -a
```

## Environment Variables

The application uses environment variables defined in `docker.env`:

```env
# Database
DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=pharmacy

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Application
NODE_ENV=production
PORT=4000
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## File Structure

```
clinic-stock/
├── api/
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml
├── docker.env
├── .dockerignore
└── DOCKER_SETUP.md
```
