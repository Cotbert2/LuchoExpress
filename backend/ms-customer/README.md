# Customer Microservice

Este microservicio maneja la gestión de clientes para LuchoExpress siguiendo los principios de Clean Architecture.

## Características

- **Clean Architecture**: Separación clara entre capas (Domain, Application, Infrastructure, Presentation)
- **Spring Boot 3.x**: Framework principal
- **PostgreSQL**: Base de datos principal
- **Spring Data JPA**: Acceso a datos
- **Validación**: Validaciones en DTOs usando Bean Validation

## Estructura del Proyecto

```
src/main/java/com/bitcrack/luchoexpress/luchoexpress_customer_microservice/
├── domain/                          # Capa de dominio
│   └── Customer.java               # Entidad principal
├── application/                     # Capa de aplicación
│   ├── dto/                        # DTOs
│   │   ├── CreateCustomerRequest.java
│   │   ├── UpdateCustomerRequest.java
│   │   └── CustomerResponse.java
│   ├── mapper/                     # Mappers
│   │   └── CustomerMapper.java
│   └── service/                    # Servicios de aplicación
│       └── CustomerService.java
├── infrastructure/                  # Capa de infraestructura
│   └── exceptions/                 # Manejo de excepciones
│       ├── CustomerNotFoundException.java
│       ├── CustomerAlreadyExistsException.java
│       └── GlobalExceptionHandler.java
├── persistance/                    # Capa de persistencia
│   └── repositories/
│       └── CustomerRepository.java
└── presentation/                   # Capa de presentación
    └── CustomerController.java    # Controlador REST
```

## API Endpoints

### Endpoints de Clientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/customers` | Crear un cliente |
| GET | `/api/customers` | Listar todos los clientes |
| GET | `/api/customers/{id}` | Obtener cliente por ID |
| GET | `/api/customers/email/{email}` | Obtener cliente por email |
| PUT | `/api/customers/{id}` | Actualizar cliente |
| DELETE | `/api/customers/{id}` | Desactivar cliente |
| GET | `/api/customers/{id}/exists` | Verificar existencia del cliente |

### Ejemplos de Uso

#### Crear Cliente
```bash
POST /api/customers
Content-Type: application/json

{
  "documentId": "12345678",
  "name": "Juan Pérez",
  "email": "juan.perez@email.com",
  "phone": "+51987654321",
  "address": "Av. Example 123, Lima, Perú"
}
```

#### Obtener Cliente por Email
```bash
GET /api/customers/email/juan.perez@email.com
```

#### Actualizar Cliente
```bash
PUT /api/customers/{id}
Content-Type: application/json

{
  "name": "Juan Carlos Pérez",
  "phone": "+51987654322"
}
```

## Modelo de Datos

### Customer Entity

```java
{
  "id": "uuid",
  "documentId": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "enabled": "boolean"
}
```

## Configuración

### Variables de Entorno

```properties
# Database
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=customers_db
DB_USER=admin
DB_PASSWORD=admin

# Server
PORT=8082
```

### Base de Datos

1. Crear la base de datos PostgreSQL:
```sql
CREATE DATABASE customers_db;
```

2. El microservicio creará automáticamente las tablas usando JPA/Hibernate

## Ejecución

### Desarrollo Local

1. Asegurarse de que PostgreSQL esté ejecutándose
2. Configurar las variables de entorno
3. Ejecutar la aplicación:

```bash
mvn spring-boot:run
```

### Docker (futuro)

```bash
docker-compose up -d
```

## Validaciones

### CreateCustomerRequest
- `documentId`: Requerido, máximo 50 caracteres, único
- `name`: Requerido, máximo 100 caracteres
- `email`: Requerido, formato de email válido, máximo 100 caracteres, único
- `phone`: Opcional, máximo 20 caracteres
- `address`: Opcional, máximo 255 caracteres

### UpdateCustomerRequest
- Todos los campos son opcionales
- Si se proporciona `email`, debe ser válido y único
- Si se proporciona `documentId`, debe ser único

## Manejo de Errores

El microservicio incluye manejo global de excepciones que retorna respuestas JSON estructuradas:

### Errores de Validación (400)
```json
{
  "status": 400,
  "error": "Validation failed",
  "fieldErrors": {
    "email": "Email must be valid",
    "name": "Name is required"
  },
  "timestamp": "2025-08-01T10:30:00"
}
```

### Cliente No Encontrado (404)
```json
{
  "status": 404,
  "error": "Customer not found",
  "message": "Customer with ID {id} not found",
  "timestamp": "2025-08-01T10:30:00"
}
```

### Cliente Ya Existe (409)
```json
{
  "status": 409,
  "error": "Customer already exists",
  "message": "Customer with email user@email.com already exists",
  "timestamp": "2025-08-01T10:30:00"
}
```



## Comandos cURL para Probar Endpoints

### Crear Cliente
```bash
curl -X POST http://localhost:8082/api/customers \
    -H "Content-Type: application/json" \
    -d '{
        "documentId": "12345678",
        "name": "Juan Pérez",
        "email": "juan.perez@email.com",
        "phone": "+51987654321",
        "address": "Av. Example 123, Lima, Perú"
    }'
```

### Listar Todos los Clientes
```bash
curl http://localhost:8082/api/customers
```

### Obtener Cliente por ID
```bash
curl http://localhost:8082/api/customers/{id}
```

### Obtener Cliente por Email
```bash
curl http://localhost:8082/api/customers/email/juan.perez@email.com
```

### Actualizar Cliente
```bash
curl -X PUT http://localhost:8082/api/customers/{id} \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Juan Carlos Pérez",
        "phone": "+51987654322"
    }'
```

### Desactivar Cliente
```bash
curl -X DELETE http://localhost:8082/api/customers/{id}
```

### Verificar Existencia del Cliente
```bash
curl http://localhost:8082/api/customers/{id}/exists
```