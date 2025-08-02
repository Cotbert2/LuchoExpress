# Order Microservice

Este microservicio maneja la gestión de pedidos para LuchoExpress siguiendo los principios de Clean Architecture.

## Características

- **Clean Architecture**: Separación clara entre capas (Domain, Application, Infrastructure, Presentation)
- **Spring Boot 3.x**: Framework principal
- **MySQL**: Base de datos principal
- **Spring Data JPA**: Acceso a datos
- **Spring Security**: Seguridad con JWT OAuth2 Resource Server
- **Validación**: Validaciones en DTOs usando Bean Validation
- **No eliminación**: Los pedidos NO se pueden eliminar (ni física ni lógicamente)
- **Integración con servicios externos**: Product Service y Tracking Service
- **Procesamiento asíncrono**: Notificaciones a tracking service

## Estructura del Proyecto

```
src/main/java/com/bitcrack/luchoexpress/order_service/
├── domain/                          # Capa de dominio
│   ├── Order.java                  # Entidad principal orden
│   ├── OrderProduct.java          # Entidad producto de orden
│   └── OrderStatusEnum.java       # Enum de estados de orden
├── application/                     # Capa de aplicación
│   ├── dto/                        # DTOs
│   │   ├── CreateOrderRequest.java
│   │   ├── CreateOrderProductRequest.java
│   │   ├── UpdateOrderRequest.java
│   │   ├── OrderResponse.java
│   │   ├── OrderProductResponse.java
│   │   └── ProductValidationResponse.java
│   ├── mapper/                     # Mappers
│   │   └── OrderMapper.java
│   └── service/                    # Servicios de aplicación
│       ├── OrderService.java
│       ├── ProductServiceClient.java    # Interface para Product Service
│       └── TrackingServiceClient.java   # Interface para Tracking Service
├── infrastructure/                  # Capa de infraestructura
│   ├── config/                     # Configuraciones
│   │   ├── SecurityConfig.java
│   │   └── AppConfig.java
│   ├── clients/                    # Implementaciones de clientes externos
│   │   ├── ProductServiceClientImpl.java
│   │   └── TrackingServiceClientImpl.java
│   └── exceptions/                 # Manejo de excepciones
│       ├── OrderNotFoundException.java
│       ├── ProductNotFoundException.java
│       ├── UnauthorizedAccessException.java
│       ├── OrderCreationException.java
│       └── GlobalExceptionHandler.java
├── persistance/                    # Capa de persistencia
│   └── repositories/
│       ├── OrderRepository.java
│       └── OrderProductRepository.java
└── presentation/                   # Capa de presentación
    └── OrderController.java       # Controlador REST
```

## API Endpoints

### Crear Pedido
- **POST** `/api/orders`
- **Roles**: CLIENTE, ADMIN, ROOT
- **Descripción**: Crea un nuevo pedido
- **Validaciones**:
  - Validar existencia de productos vía Product Service
  - CLIENTE solo puede crear pedidos para sí mismo
  - Calcular totalAmount automáticamente

### Listar Pedidos Propios  
- **GET** `/api/orders/me`
- **Roles**: CLIENTE
- **Descripción**: Lista pedidos del cliente autenticado

### Listar Todos los Pedidos
- **GET** `/api/orders`
- **Roles**: ADMIN, ROOT
- **Descripción**: Lista todos los pedidos del sistema

### Obtener Pedido por ID
- **GET** `/api/orders/{id}`
- **Roles**: Todos (con restricciones)
- **Descripción**: Obtiene un pedido específico
- **Restricciones**:
  - CLIENTE solo puede ver sus propios pedidos
  - ADMIN/ROOT pueden ver cualquier pedido

### Actualizar Pedido
- **PUT** `/api/orders/{id}`
- **Roles**: ADMIN, ROOT
- **Descripción**: Actualiza estado o dirección de entrega

## Modelo de Datos

### Order Entity

```java
{
  "id": "uuid",
  "orderNumber": "string",       // Auto-generado: ORD-XXXXXXXX
  "customerId": "uuid",
  "products": [OrderProduct],
  "deliveryAddress": "string",
  "status": "OrderStatusEnum",   // PENDING, SHIPPED, DELIVERED, CANCELLED
  "orderDate": "date",
  "estimatedDeliveryDate": "date",
  "totalAmount": "decimal",      // Calculado automáticamente
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### OrderProduct Entity

```java
{
  "id": "uuid",
  "orderId": "uuid",
  "productId": "uuid",
  "quantity": "int",
  "productName": "string",       // Copiado al momento del pedido
  "unitPrice": "decimal"         // Copiado al momento del pedido
}
```

## Reglas de Negocio

1. **No eliminación**: Los pedidos NO se pueden eliminar (ni física ni lógicamente)
2. **Control de acceso**:
   - CLIENTE: Solo puede ver/crear sus propios pedidos
   - ADMIN/ROOT: Pueden ver/crear/actualizar todos los pedidos
3. **Validación de productos**: Se valida existencia vía Product Service antes de crear pedidos
4. **Cálculo automático**: totalAmount se calcula como suma de (quantity * unitPrice) de todos los productos
5. **Notificaciones**: Se envían notificaciones asíncronas al Tracking Service
6. **Tolerancia a fallos**: Si falla la comunicación con servicios externos, no se falla la operación principal

## Configuración

### Variables de Entorno

```bash
# Base de datos
DB_HOST=localhost:3307
DB_DATABASE=order_db
DB_USER=admin
DB_PASSWORD=admin

# JWT
JWT_SECRET=mySecretKey

# Servicios externos
PRODUCT_SERVICE_URL=http://localhost:8082
TRACKING_SERVICE_URL=http://localhost:8085

# Puerto
PORT=8084
```

### application.properties

```properties
spring.application.name=lucho-express-order-service
server.port=${PORT:8084}

# Database
spring.datasource.url=jdbc:mysql://${DB_HOST:localhost:3307}/${DB_DATABASE:order_db}
spring.datasource.username=${DB_USER:admin}
spring.datasource.password=${DB_PASSWORD:admin}

# JWT
jwt.secret=${JWT_SECRET:mySecretKey}

# External Services
product.service.url=${PRODUCT_SERVICE_URL:http://localhost:8082}
tracking.service.url=${TRACKING_SERVICE_URL:http://localhost:8085}
```

## Ejecución

### Requisitos
- Java 17+
- MySQL 8.0+
- Maven 3.6+

### Pasos
1. Configurar base de datos MySQL
2. Configurar variables de entorno
3. Ejecutar: `./mvnw spring-boot:run`

## Validaciones

- **CreateOrderRequest**: customerId requerido, lista de productos no vacía, dirección requerida
- **CreateOrderProductRequest**: productId requerido, quantity >= 1
- **UpdateOrderRequest**: Al menos un campo para actualizar

## Seguridad

- **OAuth2 Resource Server** con JWT
- **@PreAuthorize** para control de acceso por roles
- **Extracción segura** de información del token JWT
- **Validación de permisos** a nivel de servicio

## Manejo de Errores

- **OrderNotFoundException**: Pedido no encontrado (404)
- **ProductNotFoundException**: Producto no encontrado (404)
- **UnauthorizedAccessException**: Acceso no autorizado (403)
- **OrderCreationException**: Error en creación de pedido (400)
- **ValidationException**: Errores de validación (400)

## Integración con Servicios Externos

### Product Service
- **Validación de productos**: GET `/api/products/{id}`
- **Verificación de existencia**: GET `/api/products/{id}/exists`

### Tracking Service  
- **Notificación de creación**: POST `/api/tracking/order-created`
- **Notificación de actualización**: POST `/api/tracking/order-updated`

## Comandos cURL para Probar Endpoints

### Crear Pedido
```bash
curl -X POST http://localhost:8084/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "customerId": "123e4567-e89b-12d3-a456-426614174000",
    "products": [
      {
        "productId": "123e4567-e89b-12d3-a456-426614174001",
        "quantity": 2
      }
    ],
    "deliveryAddress": "Calle 123, Ciudad",
    "estimatedDeliveryDate": "2024-01-15"
  }'
```

### Listar Mis Pedidos
```bash
curl -X GET http://localhost:8084/api/orders/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Listar Todos los Pedidos (Admin)
```bash
curl -X GET http://localhost:8084/api/orders \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### Obtener Pedido por ID
```bash
curl -X GET http://localhost:8084/api/orders/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Actualizar Pedido (Admin)
```bash
curl -X PUT http://localhost:8084/api/orders/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "status": "SHIPPED",
    "deliveryAddress": "Nueva dirección",
    "estimatedDeliveryDate": "2024-01-20"
  }'
```
