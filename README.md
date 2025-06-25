# Microservices Architecture with Environment Configuration

This project demonstrates a complete microservices architecture with:

- **Service1 (User Service)**: Manages user data with HTTP API and gRPC server
- **Service2 (Product Service)**: Manages product data with HTTP API and gRPC server
- **Kafka**: Message broker for event-driven communication
- **Kong API Gateway**: API gateway for routing and management
- **Environment-specific configurations**: Development and production setups

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Kong Gateway  │    │   Kafka UI      │    │   Kong Manager  │
│   (Port 8000)   │    │   (Port 8081)   │    │   (Port 8002)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Service1      │    │     Kafka       │    │   PostgreSQL    │
│   (Users)       │◄──►│   (Port 9092)   │    │   (Kong DB)     │
│   Port 3001     │    └─────────────────┘    └─────────────────┘
│   gRPC: 5000    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Service2      │
│   (Products)    │
│   Port 3000     │
│   gRPC: 5001    │
└─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js (v18 or higher)
- Yarn package manager

### Development Environment

1. **Start development services:**

   ```bash
   ./start-dev.sh start
   ```

2. **Access the services:**
   - Kong API Gateway: http://localhost:8000
   - Service1 (Users): http://localhost:3001
   - Service2 (Products): http://localhost:3000
   - Kafka UI: http://localhost:8081
   - Kong Manager: http://localhost:8002

### Production Environment

1. **Start production services:**

   ```bash
   ./start-all.sh start
   ```

2. **Access the services:**
   - Kong API Gateway: http://localhost:8000
   - Kafka UI: http://localhost:8081
   - Kong Manager: http://localhost:8002

## 📁 Project Structure

```
microservice-test/
├── service1/                          # User Service
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── user-client.service.ts # gRPC client for Service2
│   │   │   └── kafka-producer.service.ts
│   │   ├── proto/
│   │   └── app.module.ts
│   ├── .env.development               # Development config
│   ├── .env.production                # Production config
│   └── package.json
├── service2/                          # Product Service
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── product-client.service.ts
│   │   │   └── kafka-consumer.service.ts
│   │   ├── proto/
│   │   └── app.module.ts
│   ├── .env.development               # Development config
│   ├── .env.production                # Production config
│   └── package.json
├── docker-compose.yml                 # Production setup
├── docker-compose.dev.yml             # Development setup
├── start-all.sh                       # Production startup script
├── start-dev.sh                       # Development startup script
└── README.md
```

## 🔧 Environment Configuration

### Service1 (User Service)

**Development (.env.development):**

```env
NODE_ENV=development
PORT=3001
KAFKA_BROKER=localhost:9092
GRPC_HOST=localhost
GRPC_PORT=5000
LOG_LEVEL=debug
```

**Production (.env.production):**

```env
NODE_ENV=production
PORT=3001
KAFKA_BROKER=kafka:29092
GRPC_HOST=0.0.0.0
GRPC_PORT=5000
LOG_LEVEL=info
```

### Service2 (Product Service)

**Development (.env.development):**

```env
NODE_ENV=development
KAFKA_BROKER=localhost:9092
GRPC_HOST=0.0.0.0
GRPC_PORT=5001
```

**Production (.env.production):**

```env
NODE_ENV=production
KAFKA_BROKER=kafka:29092
GRPC_HOST=0.0.0.0
GRPC_PORT=5001
```

## 🌐 API Endpoints

### Via Kong Gateway (Port 8000)

#### User Operations

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Product Operations

- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Direct Service Access

#### Service1 (Port 3001)

- All user endpoints: `http://localhost:3001/users/*`
- Cross-service product calls: `http://localhost:3001/users/products/*`

#### Service2 (Port 3000)

- All product endpoints: `http://localhost:3000/products/*`
- Cross-service user calls: `http://localhost:3000/products/users/*`

## 📡 Communication Patterns

### 1. HTTP API Communication

- RESTful APIs for CRUD operations
- Cross-service calls via gRPC clients

### 2. gRPC Communication

- **Service1 gRPC server**: Port 5000 (exposes UserService)
- **Service2 gRPC server**: Port 5001 (exposes ProductService)
- **Service1 → Service2**: `service2:5001` (ProductService calls)
- **Service2 → Service1**: `service1:5000` (UserService calls)
- Bidirectional communication between services using Docker service names

### 3. Event-Driven Communication (Kafka)

- **Producer**: Service1 sends user-created events
- **Consumer**: Service2 processes events and creates related products
- **Topic**: `user-created`

## 🐳 Docker Container Communication

### Production Environment

In production (Docker containers), services communicate using Docker service names:

- **Service1 gRPC client** → `service2:5001` (connects to Service2's ProductService)
- **Service2 gRPC client** → `service1:5000` (connects to Service1's UserService)
- **Kafka broker**: `kafka:29092` (internal Docker network)
- **Kong database**: `kong-database:5432` (PostgreSQL)

### Development Environment

In development, services can run locally while infrastructure runs in Docker:

- **Local services** → `localhost:9092` (Kafka)
- **Local services** → `localhost:8001` (Kong Admin API)
- **Kong** → `host.docker.internal:3001` (Service1)
- **Kong** → `host.docker.internal:3000` (Service2)

## 🛠️ Management Scripts

### Development Scripts (`start-dev.sh`)

```bash
# Start development environment
./start-dev.sh start

# Setup Kong configuration
./start-dev.sh setup

# Stop services
./start-dev.sh stop

# Restart services
./start-dev.sh restart

# Show endpoints
./start-dev.sh endpoints

# View logs
./start-dev.sh logs [service-name]
```

### Production Scripts (`start-all.sh`)

```bash
# Start production environment
./start-all.sh start

# Setup Kong configuration
./start-all.sh setup

# Stop services
./start-all.sh stop

# Restart services
./start-all.sh restart

# Show endpoints
./start-all.sh endpoints

# View logs
./start-all.sh logs [service-name]
```

## 🔍 Monitoring & Debugging

### Kafka UI

- **URL**: http://localhost:8081
- **Features**: Topic management, message browsing, consumer groups

### Kong Manager

- **URL**: http://localhost:8002
- **Features**: API gateway management, route configuration

### Kong Admin API

- **URL**: http://localhost:8001
- **Features**: Programmatic gateway management

## 📝 Example Usage

### Create a User

```bash
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

### Create a Product

```bash
curl -X POST http://localhost:8000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "stock": 10
  }'
```

### Get All Users

```bash
curl http://localhost:8000/users
```

### Get All Products

```bash
curl http://localhost:8000/products
```

## 🔧 Configuration Details

### Docker Compose Files

**Production (`docker-compose.yml`):**

- All services containerized
- Uses container names for communication
- Production environment variables

**Development (`docker-compose.dev.yml`):**

- Infrastructure services only (Kafka, Kong, etc.)
- Microservices run locally for development
- Uses localhost configurations

### Environment Variables

The services use `@nestjs/config` to load environment-specific configurations:

```typescript
ConfigModule.forRoot({
  envFilePath: path.resolve(
    __dirname,
    `../.env.${process.env.NODE_ENV || "development"}`
  ),
  isGlobal: true,
});
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 3001, 8000, 8001, 8002, 8081, 9092 are available
2. **Docker not running**: Start Docker before running scripts
3. **Permission denied**: Make scripts executable with `chmod +x *.sh`
4. **Service not found**: Check if all containers are running with `docker-compose ps`

### Logs and Debugging

```bash
# View service logs
./start-dev.sh logs service1
./start-dev.sh logs service2

# View all logs
docker-compose -f docker-compose.dev.yml logs -f

# Check service status
docker-compose -f docker-compose.dev.yml ps
```

## 🔄 Development Workflow

1. **Start development environment**: `./start-dev.sh start`
2. **Make code changes** in `service1/` or `service2/`
3. **Restart specific service** or use `./start-dev.sh restart`
4. **Test endpoints** via Kong gateway or direct service access
5. **Monitor logs** for debugging
6. **Stop environment**: `./start-dev.sh stop`

## 📚 Technologies Used

- **NestJS**: Framework for building scalable server-side applications
- **gRPC**: High-performance RPC framework
- **Kafka**: Distributed streaming platform
- **Kong**: API Gateway
- **Docker**: Containerization
- **TypeScript**: Type-safe JavaScript
- **PostgreSQL**: Database for Kong
- **Zookeeper**: Distributed coordination service for Kafka

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Update environment configurations as needed
3. Test both development and production environments
4. Update documentation for any new features

## 📄 License

This project is for educational and demonstration purposes.
