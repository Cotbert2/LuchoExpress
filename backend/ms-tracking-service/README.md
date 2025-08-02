# Tracking Service

This microservice handles order tracking for LuchoExpress using Redis for high-performance caching and Spring Security OAuth2 for authorization.

## Features

- **Clean Architecture**: Clear separation between layers (Domain, Application, Infrastructure, Presentation)
- **Spring Boot 3.x**: Main framework
- **Spring Security OAuth2**: JWT Resource Server for authorization
- **Redis**: High-performance in-memory storage for order tracking data
- **Spring Data Redis**: Data access and repository pattern
- **Low Latency**: Designed for sub-500ms response times
- **Lombok**: Reduces boilerplate code

## Project Structure

```
src/main/java/com/bitcrack/luchoexpress/lucho_express_tracking_orders/
├── domain/                          # Domain layer
│   ├── OrderTrackingStatus.java   # Main entity (Redis)
│   └── OrderStatusEnum.java       # Order status enum
├── application/                     # Application layer
│   ├── dto/                        # DTOs
│   │   ├── OrderTrackingResponse.java
│   │   └── UpdateTrackingRequest.java
│   ├── mapper/                     # Mappers
│   │   └── OrderTrackingMapper.java
│   └── service/                    # Application services
│       ├── OrderTrackingService.java
│       └── JwtService.java
├── infrastructure/                  # Infrastructure layer
│   ├── config/                     # Configurations
│   │   ├── SecurityConfig.java
│   │   ├── RedisConfig.java
│   │   └── JwtAuthenticationFilter.java
│   └── exceptions/                 # Exception handling
│       ├── OrderTrackingNotFoundException.java
│       ├── UnauthorizedOperationException.java
│       ├── RedisConnectionException.java
│       └── GlobalExceptionHandler.java
├── persistence/                     # Persistence layer
│   └── repositories/
│       └── OrderTrackingRepository.java
└── presentation/                   # Presentation layer
    └── OrderTrackingController.java # REST controller
```

## Data Model

### OrderTrackingStatus Entity (Redis)

```java
{
  "orderId": "uuid",
  "orderNumber": "string",
  "status": "PENDING|SHIPPED|DELIVERED|CANCELLED",
  "estimatedDeliveryDate": "date",
  "lastUpdatedAt": "datetime",
  "customerId": "uuid"  // For access control
}
```

### JWT Token Claims

```json
{
  "sub": "username",
  "role": "USER|ADMIN|ROOT",
  "username": "username",
  "email": "user@email.com",
  "userId": "uuid",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## API Endpoints

### Protected Endpoints

| Method | Endpoint | Description | Authorization |
|--------|----------|-------------|--------------|
| GET | `/api/tracking/{orderId}` | Get order tracking status | Authenticated users (customers can only see their own) |
| POST | `/api/tracking/update` | Update order tracking (used by order-service) | ADMIN, ROOT |

### Usage Examples

#### Get Order Tracking
```bash
GET /api/tracking/{orderId}
Authorization: Bearer {jwt-token}
```

**Response:**
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "orderNumber": "ORD-2025-001",
  "status": "SHIPPED",
  "estimatedDeliveryDate": "2025-08-05",
  "lastUpdatedAt": "2025-08-02T14:30:00"
}
```

#### Update Order Tracking (ADMIN/ROOT only)
```bash
POST /api/tracking/update
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "orderNumber": "ORD-2025-001",
  "status": "SHIPPED",
  "estimatedDeliveryDate": "2025-08-05",
  "customerId": "456e7890-e89b-12d3-a456-426614174000"
}
```

## Security & Authorization

### Access Control
- **USER**: Can only view their own order tracking
- **ADMIN**: Can view any order tracking and update tracking data
- **ROOT**: Full access to all operations

### JWT Validation
- OAuth2 Resource Server configuration
- Stateless session management
- Role-based access control

## Configuration

### Environment Variables

```properties
# Server
PORT=8087

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=myVerySecureSecretKeyForJWT1234567890123456789012345678901234567890123456789012345678901234567890
```

### Redis

1. Install and start Redis:
```bash
# Using Docker
docker run --name redis -p 6379:6379 -d redis:latest

# Or install locally
sudo apt-get install redis-server
redis-server
```

2. Verify Redis connection:
```bash
redis-cli ping
# Should return: PONG
```

## Error Handling

### Order Not Found (404)
```json
{
  "status": 404,
  "error": "Order tracking not found",
  "message": "Order tracking not found for order ID: 123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2025-08-02T10:30:00"
}
```

### Unauthorized Access (403)
```json
{
  "status": 403,
  "error": "Operation not authorized",
  "message": "You can only access your own orders",
  "timestamp": "2025-08-02T10:30:00"
}
```

### Redis Connection Error (503)
```json
{
  "status": 503,
  "error": "Service temporarily unavailable",
  "message": "Tracking service is currently unavailable. Please try again later.",
  "timestamp": "2025-08-02T10:30:00"
}
```

### Validation Error (400)
```json
{
  "status": 400,
  "error": "Validation failed",
  "fieldErrors": {
    "orderId": "Order ID is required",
    "status": "Status is required"
  },
  "timestamp": "2025-08-02T10:30:00"
}
```

## Performance Characteristics

- **Target Latency**: < 500ms for read operations
- **Cache Strategy**: In-memory Redis storage
- **Consistency**: Eventually consistent with order-service
- **Availability**: High availability with Redis clustering (optional)

## Integration

### With Order Service
The order-service pushes updates to this tracking service whenever an order status changes:

```java
// Called by order-service when order status changes
POST /api/tracking/update
{
  "orderId": "...",
  "orderNumber": "...",
  "status": "SHIPPED",
  "estimatedDeliveryDate": "2025-08-05",
  "customerId": "..."
}
```

## Running

### Local Development

1. Start Redis server
2. Set up environment variables
3. Run the application:

```bash
mvn spring-boot:run
```

### Testing

```bash
# Run tests
mvn test

# Check Redis connection
curl http://localhost:8087/actuator/health
```

## Example cURL Commands

### Get Order Tracking
```bash
curl -X GET http://localhost:8087/api/tracking/123e4567-e89b-12d3-a456-426614174000 \
    -H "Authorization: Bearer {jwt-token}"
```

### Update Order Tracking (ADMIN/ROOT)
```bash
curl -X POST http://localhost:8087/api/tracking/update \
    -H "Authorization: Bearer {jwt-token}" \
    -H "Content-Type: application/json" \
    -d '{
        "orderId": "123e4567-e89b-12d3-a456-426614174000",
        "orderNumber": "ORD-2025-001",
        "status": "DELIVERED",
        "estimatedDeliveryDate": null,
        "customerId": "456e7890-e89b-12d3-a456-426614174000"
    }'
```

## Monitoring

The service includes actuator endpoints for monitoring:

- `/actuator/health` - Health check
- `/actuator/info` - Application info
- `/actuator/metrics` - Application metrics

Monitor Redis performance and connection status through these endpoints.
