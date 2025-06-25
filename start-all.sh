#!/bin/bash

# Production Environment Startup Script
# This script starts all services in production mode with containerized configurations

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

# Function to start production services
start_production() {
    print_status "Starting production environment..."
    
    # Build and start all services using production compose file
    print_status "Building and starting production services..."
    docker-compose up -d --build
    
    print_success "Production services started"
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 60
    
    # Check if services are running
    print_status "Checking service status..."
    docker-compose ps
    
    print_success "Production services are running"
}

# Function to setup Kong configuration for production
setup_kong_production() {
    print_status "Setting up Kong configuration for production..."
    
    # Wait for Kong to be ready
    sleep 30
    
    # Create services using container names
    print_status "Creating Kong services for production..."
    
    # Service1 (User Service) - using container name
    curl -s -X POST http://localhost:8001/services \
        -d name=user-service \
        -d url=http://service1:3001
    
    # Service2 (Product Service) - using container name
    curl -s -X POST http://localhost:8001/services \
        -d name=product-service \
        -d url=http://service2:3000
    
    print_success "Kong services created for production"
    
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
    
    print_success "Kong configuration completed for production"
}

# Function to create Kafka topics
create_kafka_topics() {
    print_status "Creating Kafka topics..."
    
    # Wait for Kafka to be ready
    sleep 30
    
    # Create user-created topic
    docker-compose exec kafka kafka-topics \
        --create \
        --bootstrap-server kafka:9092 \
        --topic user-created \
        --partitions 3 \
        --replication-factor 1 \
        --if-not-exists
    
    print_success "Kafka topics created"
}

# Function to show production endpoints
show_production_endpoints() {
    print_status "Production Environment Endpoints:"
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
    echo "📈 Monitoring:"
    echo "  - Kafka UI: http://localhost:8081"
    echo ""
    echo "📝 Example API Calls:"
    echo "  - Get all users: curl http://localhost:8000/users"
    echo "  - Get all products: curl http://localhost:8000/products"
    echo "  - Create user: curl -X POST http://localhost:8000/users -H 'Content-Type: application/json' -d '{\"name\":\"John\",\"email\":\"john@example.com\"}'"
    echo ""
    echo "🔧 Production Notes:"
    echo "  - Services use container names for communication"
    echo "  - Environment: NODE_ENV=production"
    echo "  - All services are containerized"
}

# Function to stop production services
stop_production() {
    print_status "Stopping production services..."
    docker-compose down
    print_success "Production services stopped"
}

# Function to restart production services
restart_production() {
    print_status "Restarting production services..."
    stop_production
    start_production
    setup_kong_production
    create_kafka_topics
    print_success "Production services restarted"
}

# Function to show logs
show_logs() {
    local service=${1:-service1}
    print_status "Showing logs for $service:"
    docker-compose logs -f $service
}

# Function to show help
show_help() {
    echo "Production Environment Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start production services (containerized configs)"
    echo "  setup       Setup Kong configuration for production"
    echo "  stop        Stop production services"
    echo "  restart     Restart production services"
    echo "  endpoints   Show production endpoints"
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
        start_production
        setup_kong_production
        create_kafka_topics
        show_production_endpoints
        ;;
    setup)
        setup_kong_production
        create_kafka_topics
        ;;
    stop)
        stop_production
        ;;
    restart)
        check_docker
        restart_production
        show_production_endpoints
        ;;
    endpoints)
        show_production_endpoints
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