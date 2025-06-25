#!/bin/bash

# Development Environment Startup Script
# This script starts all services in development mode with localhost configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to start development services
start_dev() {
    print_status "Starting development environment..."
    
    # Build and start all services using development compose file
    print_status "Building and starting development services..."
    docker-compose -f docker-compose.dev.yml up -d --build
    
    print_success "Development services started"
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 60
    
    # Check if services are running
    print_status "Checking service status..."
    docker-compose -f docker-compose.dev.yml ps
    
    print_success "Development services are running"
}

# Function to setup Kong configuration for development
setup_kong_dev() {
    print_status "Setting up Kong configuration for development..."
    
    # Wait for Kong to be ready
    sleep 30
    
    # Create services using localhost URLs
    print_status "Creating Kong services for development..."
    
    # Service1 (User Service) - using localhost
    curl -s -X POST http://localhost:8001/services \
        -d name=user-service \
        -d url=http://host.docker.internal:3001
    
    # Service2 (Product Service) - using localhost
    curl -s -X POST http://localhost:8001/services \
        -d name=product-service \
        -d url=http://host.docker.internal:3000
    
    print_success "Kong services created for development"
    
    # Create routes
    print_status "Creating Kong routes..."
    
    # User service routes
    curl -s -X POST http://localhost:8001/services/user-service/routes \
        -d name=user-routes \
        -d paths[]=/users \
        -d strip_path=false
    
    # Product service routes
    curl -s -X POST http://localhost:8001/services/product-service/routes \
        -d name=product-routes \
        -d paths[]=/products \
        -d strip_path=false
    
    print_success "Kong routes created"
    
    # Enable CORS plugin
    print_status "Enabling CORS plugin..."
    curl -s -X POST http://localhost:8001/plugins \
        -d name=cors \
        -d config.origins=* \
        -d config.methods=GET,POST,PUT,DELETE,OPTIONS \
        -d config.headers=Content-Type,Authorization \
        -d config.exposed_headers=Content-Length \
        -d config.credentials=true \
        -d config.max_age=3600
    
    print_success "CORS plugin enabled"
    
    print_success "Kong configuration completed for development"
}

# Function to create Kafka topics
create_kafka_topics() {
    print_status "Creating Kafka topics..."
    
    # Wait for Kafka to be ready
    sleep 30
    
    # Create user-created topic
    docker-compose -f docker-compose.dev.yml exec kafka kafka-topics \
        --create \
        --bootstrap-server localhost:9092 \
        --topic user-created \
        --partitions 3 \
        --replication-factor 1 \
        --if-not-exists
    
    print_success "Kafka topics created"
}

# Function to show development endpoints
show_dev_endpoints() {
    print_status "Development Environment Endpoints:"
    echo ""
    echo "🎯 Kong API Gateway:"
    echo "  - Proxy: http://localhost:8000"
    echo "  - Admin API: http://localhost:8001"
    echo "  - Manager UI: http://localhost:8002"
    echo ""
    echo "📊 Microservices (via Kong):"
    echo "  - Users: http://localhost:8000/users"
    echo "  - Products: http://localhost:8000/products"
    echo ""
    echo "🔧 Direct Microservices (Development):"
    echo "  - Service1 (Users): http://localhost:3001"
    echo "  - Service2 (Products): http://localhost:3000"
    echo ""
    echo "📈 Monitoring:"
    echo "  - Kafka UI: http://localhost:8081"
    echo ""
    echo "📝 Example API Calls:"
    echo "  - Get all users: curl http://localhost:8000/users"
    echo "  - Get all products: curl http://localhost:8000/products"
    echo "  - Create user: curl -X POST http://localhost:8000/users -H 'Content-Type: application/json' -d '{\"name\":\"John\",\"email\":\"john@example.com\"}'"
    echo ""
    echo "🔧 Development Notes:"
    echo "  - Services use localhost:9092 for Kafka"
    echo "  - Kong forwards to host.docker.internal for microservices"
    echo "  - Environment: NODE_ENV=development"
}

# Function to stop development services
stop_dev() {
    print_status "Stopping development services..."
    docker-compose -f docker-compose.dev.yml down
    print_success "Development services stopped"
}

# Function to restart development services
restart_dev() {
    print_status "Restarting development services..."
    stop_dev
    start_dev
    setup_kong_dev
    create_kafka_topics
    print_success "Development services restarted"
}

# Function to show logs
show_logs() {
    local service=${1:-service1}
    print_status "Showing logs for $service:"
    docker-compose -f docker-compose.dev.yml logs -f $service
}

# Function to show help
show_help() {
    echo "Development Environment Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start development services (localhost configs)"
    echo "  setup       Setup Kong configuration for development"
    echo "  stop        Stop development services"
    echo "  restart     Restart development services"
    echo "  endpoints   Show development endpoints"
    echo "  logs [SERVICE] Show logs (default: service1)"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 setup"
    echo "  $0 logs service2"
}

# Main script logic
case "${1:-help}" in
    start)
        check_docker
        start_dev
        setup_kong_dev
        create_kafka_topics
        show_dev_endpoints
        ;;
    setup)
        setup_kong_dev
        create_kafka_topics
        ;;
    stop)
        stop_dev
        ;;
    restart)
        check_docker
        restart_dev
        show_dev_endpoints
        ;;
    endpoints)
        show_dev_endpoints
        ;;
    logs)
        show_logs $2
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 