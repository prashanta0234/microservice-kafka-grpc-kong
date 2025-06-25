#!/bin/bash

# Kafka Setup and Management Script
# This script helps manage Kafka operations for the microservices project

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

# Function to start Kafka services
start_kafka() {
    print_status "Starting Kafka services..."
    docker-compose up -d zookeeper kafka
    print_success "Kafka services started"
    
    print_status "Waiting for Kafka to be ready..."
    sleep 30
    
    # Check if Kafka is ready
    if docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list > /dev/null 2>&1; then
        print_success "Kafka is ready"
    else
        print_warning "Kafka might still be starting up. Please wait a moment and try again."
    fi
}

# Function to start Kafka UI
start_kafka_ui() {
    print_status "Starting Kafka UI..."
    docker-compose up -d kafka-ui
    print_success "Kafka UI started at http://localhost:8081"
}

# Function to stop all services
stop_services() {
    print_status "Stopping all services..."
    docker-compose down
    print_success "All services stopped"
}

# Function to restart services
restart_services() {
    print_status "Restarting services..."
    stop_services
    start_kafka
    start_kafka_ui
    print_success "Services restarted"
}

# Function to show service status
show_status() {
    print_status "Service status:"
    docker-compose ps
}

# Function to show logs
show_logs() {
    local service=${1:-kafka}
    print_status "Showing logs for $service:"
    docker-compose logs -f $service
}

# Function to create topics
create_topics() {
    print_status "Creating Kafka topics..."
    
    # Create user-created topic (used by the microservices)
    docker-compose exec kafka kafka-topics \
        --create \
        --bootstrap-server localhost:9092 \
        --topic user-created \
        --partitions 3 \
        --replication-factor 1 \
        --if-not-exists
    
    print_success "Topics created successfully"
}

# Function to list topics
list_topics() {
    print_status "Listing Kafka topics:"
    docker-compose exec kafka kafka-topics \
        --bootstrap-server localhost:9092 \
        --list
}

# Function to describe topics
describe_topics() {
    local topic=${1:-user-created}
    print_status "Describing topic: $topic"
    docker-compose exec kafka kafka-topics \
        --bootstrap-server localhost:9092 \
        --describe \
        --topic $topic
}

# Function to clean up (remove volumes)
cleanup() {
    print_warning "This will remove all Kafka data. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up Kafka data..."
        docker-compose down -v
        print_success "Cleanup completed"
    else
        print_status "Cleanup cancelled"
    fi
}

# Function to show help
show_help() {
    echo "Kafka Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start Kafka and Zookeeper services"
    echo "  start-ui    Start Kafka UI"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  status      Show service status"
    echo "  logs [SERVICE] Show logs (default: kafka)"
    echo "  create-topics Create required topics"
    echo "  list-topics List all topics"
    echo "  describe [TOPIC] Describe topic (default: user-created)"
    echo "  cleanup     Remove all data (interactive)"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs zookeeper"
    echo "  $0 describe user-created"
}

# Main script logic
case "${1:-help}" in
    start)
        check_docker
        start_kafka
        ;;
    start-ui)
        check_docker
        start_kafka_ui
        ;;
    stop)
        stop_services
        ;;
    restart)
        check_docker
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs $2
        ;;
    create-topics)
        create_topics
        ;;
    list-topics)
        list_topics
        ;;
    describe)
        describe_topics $2
        ;;
    cleanup)
        cleanup
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