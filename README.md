# Microservice Test Setup

This project contains two microservices with bidirectional communication using gRPC and HTTP APIs.

## Architecture

- **Service1 (User Service)**: Manages user data, runs on HTTP port 3001 and gRPC port 5000
- **Service2 (Product Service)**: Manages product data, runs on HTTP port 3000 and gRPC port 5001
- Both services can call each other dynamically through gRPC

## Setup

### Prerequisites

- Node.js (v18 or higher)
- Yarn package manager

### Installation

1. Install dependencies for both services:

```bash
cd service1 && yarn install
cd ../service2 && yarn install
```

2. Start the services:

**Terminal 1 - Start Service1:**

```bash
cd service1
yarn start:dev
```

**Terminal 2 - Start Service2:**

```bash
cd service2
yarn start:dev
```

## API Endpoints

### Service1 (User Service) - Port 3001

#### User Operations

- `GET /users` - Get all users (with pagination: ?page=1&limit=10)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Cross-Service Product Operations

- `GET /users/products` - Get all products from Service2
- `GET /users/products/:id` - Get product by ID from Service2
- `POST /users/products` - Create product in Service2
- `PUT /users/products/:id` - Update product in Service2
- `DELETE /users/products/:id` - Delete product in Service2

### Service2 (Product Service) - Port 3000

#### Product Operations

- `GET /products` - Get all products (with pagination: ?page=1&limit=10)
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

#### Cross-Service User Operations

- `GET /products/users` - Get all users from Service1
- `GET /products/users/:id` - Get user by ID from Service1
- `POST /products/users` - Create user in Service1
- `PUT /products/users/:id` - Update user in Service1
- `DELETE /products/users/:id` - Delete user in Service1

## Example Usage

### Create a User via Service1

```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

### Create a Product via Service2

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop", "description": "High-performance laptop", "price": 999.99, "stock": 10}'
```

### Get Products from Service1 (Cross-Service Call)

```bash
curl http://localhost:3001/users/products
```

### Get Users from Service2 (Cross-Service Call)

```bash
curl http://localhost:3000/products/users
```

## Data Storage

Both services use in-memory storage with fake JSON data for demonstration purposes. The data persists only during the service runtime.

### Sample Data

**Service1 (Users):**

- John Doe (john@example.com)
- Jane Smith (jane@example.com)

**Service2 (Products):**

- Laptop ($999.99, 10 in stock)
- Smartphone ($699.99, 25 in stock)

## gRPC Communication

The services communicate via gRPC on ports:

- Service1: 5000
- Service2: 5001

Each service exposes its own gRPC methods and can call the other service's methods dynamically.

## Features

- ✅ Bidirectional communication between services
- ✅ Full CRUD operations for both users and products
- ✅ Pagination support
- ✅ Dynamic parameter passing
- ✅ Error handling
- ✅ TypeScript interfaces for type safety
- ✅ HTTP and gRPC endpoints
- ✅ In-memory data storage with fake JSON data

## Development

To run in development mode with auto-reload:

```bash
# Service1
cd service1 && yarn start:dev

# Service2
cd service2 && yarn start:dev
```

To build for production:

```bash
# Service1
cd service1 && yarn build && yarn start:prod

# Service2
cd service2 && yarn build && yarn start:prod
```
