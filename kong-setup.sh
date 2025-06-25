#!/bin/bash

# Kong API Gateway Setup and Management Script
# This script helps manage Kong operations for the microservices project

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

# Function to start Kong services
start_kong() {
    print_status "Starting Kong services..."
    docker-compose up -d kong-database kong-migration kong kong-manager
    print_success "Kong services started"
    
    print_status "Waiting for Kong to be ready..."
    sleep 30
    
    # Check if Kong is ready
    if curl -s http://localhost:8001/status > /dev/null 2>&1; then
        print_success "Kong is ready"
    else
        print_warning "Kong might still be starting up. Please wait a moment and try again."
    fi
}

# Function to stop Kong services
stop_kong() {
    print_status "Stopping Kong services..."
    docker-compose stop kong kong-manager kong-migration kong-database
    print_success "Kong services stopped"
}

# Function to restart Kong services
restart_kong() {
    print_status "Restarting Kong services..."
    stop_kong
    start_kong
    print_success "Kong services restarted"
}

# Function to show Kong status
show_status() {
    print_status "Kong service status:"
    docker-compose ps | grep kong
}

# Function to show Kong logs
show_logs() {
    local service=${1:-kong}
    print_status "Showing logs for $service:"
    docker-compose logs -f $service
}

# Function to setup Kong configuration
setup_kong() {
    print_status "Setting up Kong configuration..."
    
    # Wait for Kong to be ready
    sleep 30
    
    # Create services
    print_status "Creating Kong services..."
    
    # Service1 (User Service) - using Docker service name
    curl -s -X POST http://localhost:8001/services \
        -d name=user-service \
        -d url=http://service1:3001
    
    # Service2 (Product Service) - using Docker service name
    curl -s -X POST http://localhost:8001/services \
        -d name=product-service \
        -d url=http://service2:3000
    
    print_success "Kong services created"
    
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
    
    print_success "Kong configuration completed"
}

# Function to show Kong endpoints
show_endpoints() {
    print_status "Kong API Gateway Endpoints:"
    echo ""
    echo "🎯 Proxy (Public API):"
    echo "  - User Service: http://localhost:8000/api/users"
    echo "  - Product Service: http://localhost:8000/api/products"
    echo ""
    echo "🔧 Admin API:"
    echo "  - Status: http://localhost:8001/status"
    echo "  - Services: http://localhost:8001/services"
    echo "  - Routes: http://localhost:8001/routes"
    echo ""
    echo "📊 Kong Manager UI:"
    echo "  - Web Interface: http://localhost:8002"
    echo ""
    echo "📝 Example API Calls:"
    echo "  - Get all users: curl http://localhost:8000/api/users"
    echo "  - Get all products: curl http://localhost:8000/api/products"
    echo "  - Create user: curl -X POST http://localhost:8000/api/users -H 'Content-Type: application/json' -d '{\"name\":\"John\",\"email\":\"john@example.com\"}'"
}

# Function to test Kong connectivity
test_kong() {
    print_status "Testing Kong connectivity..."
    
    # Test Kong status
    if curl -s http://localhost:8001/status > /dev/null; then
        print_success "Kong Admin API is accessible"
    else
        print_error "Kong Admin API is not accessible"
        return 1
    fi
    
    # Test services
    if curl -s http://localhost:8001/services > /dev/null; then
        print_success "Kong services are configured"
    else
        print_warning "Kong services might not be configured yet"
    fi
    
    print_success "Kong connectivity test completed"
}

# Function to clean up Kong
cleanup_kong() {
    print_warning "This will remove all Kong data. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up Kong data..."
        docker-compose down kong kong-manager kong-migration kong-database
        docker volume rm microservice-test_kong-database 2>/dev/null || true
        print_success "Kong cleanup completed"
    else
        print_status "Kong cleanup cancelled"
    fi
}

# Function to show help
show_help() {
    echo "Kong API Gateway Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start Kong services"
    echo "  stop        Stop Kong services"
    echo "  restart     Restart Kong services"
    echo "  setup       Setup Kong configuration (services, routes, plugins)"
    echo "  status      Show Kong service status"
    echo "  logs [SERVICE] Show logs (default: kong)"
    echo "  endpoints   Show Kong endpoints and example usage"
    echo "  test        Test Kong connectivity"
    echo "  cleanup     Remove all Kong data (interactive)"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 setup"
    echo "  $0 endpoints"
    echo "  $0 logs kong-database"
}

# Main script logic
case "${1:-help}" in
    start)
        check_docker
        start_kong
        ;;
    stop)
        stop_kong
        ;;
    restart)
        check_docker
        restart_kong
        ;;
    setup)
        setup_kong
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs $2
        ;;
    endpoints)
        show_endpoints
        ;;
    test)
        test_kong
        ;;
    cleanup)
        cleanup_kong
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