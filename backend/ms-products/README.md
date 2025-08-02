# Product Microservice

Este microservicio maneja la gestión de productos y categorías para LuchoExpress siguiendo los principios de Clean Architecture.

## Características

- **Clean Architecture**: Separación clara entre capas (Domain, Application, Infrastructure, Presentation)
- **Spring Boot 3.x**: Framework principal
- **MySQL**: Base de datos principal
- **Spring Data JPA**: Acceso a datos
- **Spring Security**: Seguridad con JWT
- **Validación**: Validaciones en DTOs usando Bean Validation
- **No eliminación**: No se permite eliminar productos ni categorías

## Estructura del Proyecto

```
src/main/java/com/bitcrack/luchoexpress/lucho_express_products/
├── domain/                          # Capa de dominio
│   ├── Product.java                # Entidad principal producto
│   └── Category.java               # Entidad principal categoría
├── application/                     # Capa de aplicación
│   ├── dto/                        # DTOs
│   │   ├── CreateCategoryRequest.java
│   │   ├── UpdateCategoryRequest.java
│   │   ├── CategoryResponse.java
│   │   ├── CreateProductRequest.java
│   │   ├── UpdateProductRequest.java
│   │   ├── ProductResponse.java
│   │   └── CategoryWithProductsResponse.java
│   ├── mapper/                     # Mappers
│   │   ├── CategoryMapper.java
│   │   └── ProductMapper.java
│   └── service/                    # Servicios de aplicación
│       ├── CategoryService.java
│       ├── ProductService.java
│       └── JwtService.java
├── infrastructure/                  # Capa de infraestructura
│   ├── config/                     # Configuraciones
│   │   ├── SecurityConfig.java
│   │   └── JwtAuthenticationFilter.java
│   └── exceptions/                 # Manejo de excepciones
│       ├── CategoryNotFoundException.java
│       ├── CategoryAlreadyExistsException.java
│       ├── ProductNotFoundException.java
│       └── GlobalExceptionHandler.java
├── persistance/                    # Capa de persistencia
│   └── repositories/
│       ├── CategoryRepository.java
│       └── ProductRepository.java
└── presentation/                   # Capa de presentación
    ├── CategoryController.java     # Controlador REST categorías
    └── ProductController.java     # Controlador REST productos
```

## API Endpoints

### Categorías

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| POST | `/api/categories` | Crear categoría | ADMIN, ROOT |
| PATCH | `/api/categories/{id}` | Editar categoría | ADMIN, ROOT |
| GET | `/api/categories` | Listar todas las categorías | PÚBLICO |
| GET | `/api/categories-with-products` | Categorías con productos | PÚBLICO |
| GET | `/api/categories/{id}/products` | Productos por categoría | ADMIN, ROOT |

### Productos

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| POST | `/api/products` | Crear producto | ADMIN, ROOT |
| PATCH | `/api/products/{id}` | Editar producto | ADMIN, ROOT |

## Modelo de Datos

### Product Entity

```java
{
  "id": "uuid",
  "categoryId": "uuid",
  "name": "string",
  "imageUrl": "string",
  "description": "string",
  "price": "decimal",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "category": "Category"
}
```

### Category Entity

```java
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## Configuración

### Variables de Entorno

```properties
# Database
DB_HOST=localhost:3306
DB_DATABASE=product_db
DB_USER=admin
DB_PASSWORD=admin

# JWT
JWT_SECRET=myVerySecureSecretKeyForJWT1234567890123456789012345678901234567890123456789012345678901234567890

# Server
PORT=8085
```

### Base de Datos

1. Crear la base de datos MySQL:
```sql
CREATE DATABASE product_db;
```

2. El microservicio creará automáticamente las tablas usando JPA/Hibernate

## Ejecución

### Desarrollo Local

1. Asegurarse de que MySQL esté ejecutándose
2. Configurar las variables de entorno
3. Ejecutar la aplicación:

```bash
mvn spring-boot:run
```

## Validaciones

### Categorías
- **name**: Obligatorio, máximo 100 caracteres
- **description**: Opcional, máximo 500 caracteres

### Productos
- **categoryId**: Obligatorio, debe existir la categoría
- **name**: Obligatorio, máximo 100 caracteres
- **imageUrl**: Opcional, debe ser URL válida con extensión de imagen
- **description**: Opcional, máximo 500 caracteres
- **price**: Obligatorio, mayor que cero, formato decimal

## Seguridad

- Todos los endpoints protegidos requieren autenticación JWT
- Los tokens JWT deben incluir el rol del usuario
- Solo usuarios con rol ADMIN o ROOT pueden crear/editar productos y categorías
- Endpoints públicos: listado de categorías y categorías con productos

## Manejo de Errores

- **404 Not Found**: Cuando no se encuentra una categoría o producto
- **409 Conflict**: Cuando se intenta crear una categoría con nombre duplicado
- **400 Bad Request**: Errores de validación
- **401 Unauthorized**: Token JWT inválido o ausente
- **403 Forbidden**: Usuario sin permisos suficientes

## Comandos cURL para Probar Endpoints

### Obtener Token JWT (desde el microservicio de autenticación)
```bash
curl -X POST http://localhost:8080/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'
```

### Crear Categoría
```bash
curl -X POST http://localhost:8085/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Electrónicos",
    "description": "Productos electrónicos y tecnológicos"
  }'
```

### Listar Categorías (Público)
```bash
curl -X GET http://localhost:8085/api/categories
```

### Crear Producto
```bash
curl -X POST http://localhost:8085/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "categoryId": "CATEGORY_UUID",
    "name": "Smartphone Galaxy",
    "imageUrl": "https://example.com/phone.jpg",
    "description": "Smartphone de última generación",
    "price": 899.99
  }'
```

### Obtener Categorías con Productos (Público)
```bash
curl -X GET http://localhost:8085/api/categories-with-products
```

### Actualizar Categoría
```bash
curl -X PATCH http://localhost:8085/api/categories/CATEGORY_UUID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description": "Nueva descripción actualizada"
  }'
```

### Actualizar Producto
```bash
curl -X PATCH http://localhost:8085/api/products/PRODUCT_UUID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "price": 799.99,
    "description": "Precio actualizado por oferta especial"
  }'
```
