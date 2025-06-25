# Kong API Gateway Setup for Microservices

This document provides instructions for setting up and running Kong API Gateway using Docker for the microservices project.

## Overview

Kong API Gateway provides:

- **API Gateway**: Single entry point for all microservices
- **Load Balancing**: Distribute traffic across services
- **Authentication**: Centralized auth management
- **Rate Limiting**: Protect services from abuse
- **CORS**: Handle cross-origin requests
- **Monitoring**: Request/response logging and metrics

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │───▶│   Kong Gateway  │───▶│  Microservices  │
│                 │    │   (Port 8000)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  Kong Manager   │
                       │   (Port 8002)   │
                       └─────────────────┘
```

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB of available RAM
- Ports 8000, 8001, 8002, and 5432 available
- Microservices running on ports 3000 and 3001

## Quick Start

### 1. Start Kong Services

```bash
# Make the script executable (first time only)
chmod +x kong-setup.sh

# Start Kong services
./kong-setup.sh start

# Wait for Kong to be ready (about 30 seconds)
```

### 2. Setup Kong Configuration

```bash
# Configure services, routes, and plugins
./kong-setup.sh setup
```

### 3. Verify Setup

```bash
# Check Kong status
./kong-setup.sh status

# Test connectivity
./kong-setup.sh test

# Show available endpoints
./kong-setup.sh endpoints
```

## Services

### Kong API Gateway

- **Proxy Port**: 8000 (public API access)
- **Admin Port**: 8001 (configuration API)
- **Purpose**: Route requests to microservices

### Kong Manager

- **Port**: 8002
- **Purpose**: Web-based management interface

### Kong Database (PostgreSQL)

- **Port**: 5432
- **Purpose**: Store Kong configuration and data

## Configuration

### Services Configured

1. **user-service**: Routes to Service1 (port 3001)
2. **product-service**: Routes to Service2 (port 3000)

### Routes Configured

- `/api/users/*` → user-service
- `/api/products/*` → product-service

### Plugins Enabled

- **CORS**: Allows cross-origin requests
- **Rate Limiting**: Protects against abuse (configurable)
- **Logging**: Request/response logging

## API Endpoints

### Public API (via Kong Gateway)

```bash
# User Service Endpoints
GET    http://localhost:8000/api/users          # Get all users
GET    http://localhost:8000/api/users/{id}     # Get user by ID
POST   http://localhost:8000/api/users          # Create user
PUT    http://localhost:8000/api/users/{id}     # Update user
DELETE http://localhost:8000/api/users/{id}     # Delete user

# Product Service Endpoints
GET    http://localhost:8000/api/products       # Get all products
GET    http://localhost:8000/api/products/{id}  # Get product by ID
POST   http://localhost:8000/api/products       # Create product
PUT    http://localhost:8000/api/products/{id}  # Update product
DELETE http://localhost:8000/api/products/{id}  # Delete product
```

### Admin API

```bash
# Kong Status
GET http://localhost:8001/status

# Services
GET http://localhost:8001/services
POST http://localhost:8001/services

# Routes
GET http://localhost:8001/routes
POST http://localhost:8001/routes

# Plugins
GET http://localhost:8001/plugins
POST http://localhost:8001/plugins
```

## Management Commands

### Basic Operations

```bash
# Start Kong services
./kong-setup.sh start

# Stop Kong services
./kong-setup.sh stop

# Restart Kong services
./kong-setup.sh restart

# Show service status
./kong-setup.sh status
```

### Configuration

```bash
# Setup Kong configuration
./kong-setup.sh setup

# Show available endpoints
./kong-setup.sh endpoints

# Test connectivity
./kong-setup.sh test
```

### Monitoring

```bash
# View Kong logs
./kong-setup.sh logs kong

# View database logs
./kong-setup.sh logs kong-database

# View manager logs
./kong-setup.sh logs kong-manager
```

### Data Management

```bash
# Clean up all data (interactive)
./kong-setup.sh cleanup
```

## Testing the Setup

### 1. Start Microservices

```bash
# Terminal 1: Start Service1
cd service1
yarn start:dev

# Terminal 2: Start Service2
cd service2
yarn start:dev
```

### 2. Test API Gateway

```bash
# Test user service via Kong
curl http://localhost:8000/api/users

# Test product service via Kong
curl http://localhost:8000/api/products

# Create a user via Kong
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "products": [
      {
        "name": "Test Product",
        "description": "A test product",
        "price": 99.99,
        "stock": 10
      }
    ]
  }'
```

### 3. Monitor via Kong Manager

1. Open Kong Manager at http://localhost:8002
2. Navigate to Services to see configured services
3. Check Routes to see API endpoints
4. Monitor Plugins for enabled features

## Advanced Configuration

### Adding Rate Limiting

```bash
# Add rate limiting to user service
curl -X POST http://localhost:8001/services/user-service/plugins \
  -d name=rate-limiting \
  -d config.minute=100 \
  -d config.hour=1000
```

### Adding Authentication

```bash
# Add key authentication to product service
curl -X POST http://localhost:8001/services/product-service/plugins \
  -d name=key-auth
```

### Custom Routes

```bash
# Add a custom route
curl -X POST http://localhost:8001/services/user-service/routes \
  -d name=custom-user-route \
  -d paths[]=/api/v1/users \
  -d strip_path=false
```

## Troubleshooting

### Common Issues

1. **Kong Not Starting**

   ```bash
   # Check logs
   ./kong-setup.sh logs kong

   # Check database
   ./kong-setup.sh logs kong-database
   ```

2. **Services Not Accessible**

   ```bash
   # Verify microservices are running
   curl http://localhost:3001
   curl http://localhost:3000

   # Check Kong configuration
   ./kong-setup.sh setup
   ```

3. **CORS Issues**
   ```bash
   # Check CORS plugin
   curl http://localhost:8001/plugins | grep cors
   ```

### Log Analysis

```bash
# View real-time logs
./kong-setup.sh logs kong

# View specific error patterns
docker-compose logs kong | grep ERROR
```

### Performance Tuning

For production use, consider:

- Increasing memory limits
- Configuring connection pooling
- Setting up monitoring and alerting
- Implementing caching strategies

## Security Considerations

This setup is for development only. For production:

- Enable SSL/TLS encryption
- Configure authentication and authorization
- Implement rate limiting
- Set up proper logging and monitoring
- Use secure database credentials

## Integration with Microservices

### Service1 (User Service)

- **Direct Access**: http://localhost:3001
- **Via Kong**: http://localhost:8000/api/users
- **gRPC**: localhost:5000

### Service2 (Product Service)

- **Direct Access**: http://localhost:3000
- **Via Kong**: http://localhost:8000/api/products
- **gRPC**: localhost:5001

## Cleanup

To completely remove Kong and all data:

```bash
# Interactive cleanup
./kong-setup.sh cleanup

# Or force cleanup
docker-compose down kong kong-manager kong-migration kong-database
docker volume rm microservice-test_kong-database
```

## Support

For issues related to:

- **Kong Setup**: Check this document and the management script
- **Microservices**: Refer to individual service README files
- **Docker**: Consult Docker documentation

## Additional Resources

- [Kong Documentation](https://docs.konghq.com/)
- [Kong Admin API Reference](https://docs.konghq.com/gateway/latest/admin-api/)
- [Kong Plugin Hub](https://docs.konghq.com/hub/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
