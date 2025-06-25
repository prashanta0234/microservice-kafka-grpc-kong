# Kafka Setup for Microservices

This document provides instructions for setting up and running Kafka using Docker for the microservices project.

## Overview

The Kafka setup includes:

- **Zookeeper**: Required for Kafka cluster coordination
- **Kafka**: Message broker for event-driven communication
- **Kafka UI**: Web interface for monitoring and managing Kafka

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB of available RAM
- Ports 2181, 9092, 9101, and 8081 available

## Quick Start

### 1. Start Kafka Services

```bash
# Make the script executable (first time only)
chmod +x kafka-setup.sh

# Start Kafka and Zookeeper
./kafka-setup.sh start

# Start Kafka UI (optional)
./kafka-setup.sh start-ui
```

### 2. Create Required Topics

```bash
# Create the user-created topic used by the microservices
./kafka-setup.sh create-topics
```

### 3. Verify Setup

```bash
# Check service status
./kafka-setup.sh status

# List topics
./kafka-setup.sh list-topics

# Describe the user-created topic
./kafka-setup.sh describe user-created
```

## Services

### Kafka Broker

- **Port**: 9092 (external), 29092 (internal)
- **Purpose**: Message broker for event communication
- **Topics**: `user-created` (used by microservices)

### Zookeeper

- **Port**: 2181
- **Purpose**: Cluster coordination and metadata storage

### Kafka UI

- **URL**: http://localhost:8081
- **Purpose**: Web interface for monitoring topics, messages, and cluster health

## Configuration

### Docker Compose Services

The `docker-compose.yml` file defines three services:

1. **zookeeper**: Apache Zookeeper for cluster coordination
2. **kafka**: Apache Kafka broker
3. **kafka-ui**: Web-based Kafka management interface

### Environment Variables

Key Kafka configuration:

- `KAFKA_BROKER_ID`: Unique broker identifier
- `KAFKA_ZOOKEEPER_CONNECT`: Zookeeper connection string
- `KAFKA_ADVERTISED_LISTENERS`: Network listeners for client connections
- `KAFKA_AUTO_CREATE_TOPICS_ENABLE`: Auto-create topics when first accessed
- `KAFKA_DELETE_TOPIC_ENABLE`: Allow topic deletion

## Usage with Microservices

### Service1 (User Service)

- **Role**: Kafka Producer
- **Topic**: `user-created`
- **Port**: 3001 (HTTP), 5000 (gRPC)
- **Function**: Sends user creation events with associated products

### Service2 (Product Service)

- **Role**: Kafka Consumer
- **Topic**: `user-created`
- **Port**: 3000 (HTTP), 5001 (gRPC)
- **Function**: Consumes user events and creates products

## Management Commands

### Basic Operations

```bash
# Start all services
./kafka-setup.sh start

# Stop all services
./kafka-setup.sh stop

# Restart all services
./kafka-setup.sh restart

# Show service status
./kafka-setup.sh status
```

### Topic Management

```bash
# Create required topics
./kafka-setup.sh create-topics

# List all topics
./kafka-setup.sh list-topics

# Describe specific topic
./kafka-setup.sh describe user-created
```

### Monitoring

```bash
# View Kafka logs
./kafka-setup.sh logs kafka

# View Zookeeper logs
./kafka-setup.sh logs zookeeper

# View Kafka UI logs
./kafka-setup.sh logs kafka-ui
```

### Data Management

```bash
# Clean up all data (interactive)
./kafka-setup.sh cleanup
```

## Testing the Setup

### 1. Start the Microservices

```bash
# Terminal 1: Start Service1
cd service1
yarn start:dev

# Terminal 2: Start Service2
cd service2
yarn start:dev
```

### 2. Create a User with Products

```bash
# Using curl or your preferred HTTP client
curl -X POST http://localhost:3001/users \
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

### 3. Monitor Events

1. Open Kafka UI at http://localhost:8081
2. Navigate to the `user-created` topic
3. View messages being produced and consumed

## Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Check what's using the port
   netstat -tulpn | grep :9092

   # Stop conflicting services
   ./kafka-setup.sh stop
   ```

2. **Kafka Not Ready**

   ```bash
   # Wait for Kafka to start
   ./kafka-setup.sh status

   # Check logs for errors
   ./kafka-setup.sh logs kafka
   ```

3. **Topic Not Found**
   ```bash
   # Create the topic manually
   ./kafka-setup.sh create-topics
   ```

### Log Analysis

```bash
# View real-time logs
./kafka-setup.sh logs kafka

# View specific error patterns
docker-compose logs kafka | grep ERROR
```

### Performance Tuning

For production use, consider:

- Increasing memory limits
- Adjusting partition counts
- Configuring replication factors
- Setting up monitoring and alerting

## Cleanup

To completely remove Kafka and all data:

```bash
# Interactive cleanup
./kafka-setup.sh cleanup

# Or force cleanup
docker-compose down -v
docker volume prune
```

## Security Considerations

This setup is for development only. For production:

- Enable SSL/TLS encryption
- Configure authentication
- Use proper network segmentation
- Implement access controls
- Set up monitoring and alerting

## Support

For issues related to:

- **Kafka Setup**: Check this document and the management script
- **Microservices**: Refer to individual service README files
- **Docker**: Consult Docker documentation

## Additional Resources

- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Confluent Platform](https://docs.confluent.io/)
- [Kafka UI Documentation](https://github.com/provectus/kafka-ui)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
