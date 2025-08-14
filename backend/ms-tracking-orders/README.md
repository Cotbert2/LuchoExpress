# MS Tracking Orders - API Documentation

Este microservicio maneja el seguimiento de órdenes en tiempo real usando Redis como almacén de datos temporal.

**⚠️ NOTA: La autenticación JWT está temporalmente deshabilitada. Todos los endpoints son públicos.**

## Configuración

- **Puerto**: 8086
- **Base URL**: `http://localhost:8086`
- **Redis**: Puerto 6379
- **TTL**: 1 hora para los registros de tracking

## Endpoints

### 1. Crear/Actualizar Estado de Tracking

**POST** `/api/tracking`

Endpoint público para recibir actualizaciones del servicio de órdenes.

#### Request Body

```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "orderNumber": "ORD-2025-0001",
  "userId": "987fcdeb-51a2-43d1-b456-123456789abc",
  "status": "SHIPPED",
  "updatedAt": "2025-08-04T10:30:00"
}
```

#### Ejemplo con curl

```bash
curl -X POST http://localhost:8086/api/tracking \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "123e4567-e89b-12d3-a456-426614174000",
    "orderNumber": "ORD-2025-0001",
    "userId": "987fcdeb-51a2-43d1-b456-123456789abc",
    "status": "SHIPPED",
    "updatedAt": "2025-08-04T10:30:00"
  }'
```

#### Response

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "message": "Tracking status updated successfully"
}
```

### 2. Consultar Estado de Tracking

**GET** `/api/tracking/{orderNumber}`

~~Endpoint protegido con JWT para consultar el estado de una orden.~~ 
**Endpoint público (autenticación temporalmente deshabilitada)** para consultar el estado de una orden.

**Descripción:** Obtiene el estado actual de tracking de una orden por su número de orden. Utiliza una estrategia de cache inteligente que verifica la consistencia con el servicio de órdenes.

**Parámetros:**
- `orderNumber` (path): El número de la orden
- `refresh` (query, opcional): Forzar actualización desde el servicio de órdenes (`true`/`false`, default: `false`)

#### Estrategia de Cache
- **Cache Hit Consistente**: Si los datos en Redis coinciden con el servicio de órdenes, se retorna el cache
- **Cache Hit Inconsistente**: Si hay diferencias, se actualiza el cache con los datos más recientes
- **Cache Miss**: Se carga desde el servicio de órdenes y se guarda en cache
- **Force Refresh**: Se ignora el cache y se obtienen los datos más recientes

#### ~~Headers Requeridos~~ (Temporalmente no requeridos)

```
# Authorization: Bearer <JWT_TOKEN> - No requerido temporalmente
```

#### Ejemplo con curl

```bash
# Consulta pública (sin autenticación)
curl -X GET http://localhost:8086/api/tracking/ORD-2025-0001

# Consulta con refresh forzado
curl -X GET "http://localhost:8086/api/tracking/ORD-2025-0001?refresh=true"

# Los siguientes ejemplos con JWT no funcionarán hasta reactivar la autenticación:
# curl -X GET http://localhost:8086/api/tracking/ORD-2025-0001 \
#   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Response - Éxito (200 OK)

```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "orderNumber": "ORD-2025-0001",
  "userId": "987fcdeb-51a2-43d1-b456-123456789abc",
  "status": "SHIPPED",
  "updatedAt": "2025-08-04T10:30:00"
}
```

#### Response - No Encontrado (404 Not Found)

```json
{
  "error": "Order not found",
  "message": "No tracking information found for order ORD-2025-0001"
}
```

#### ~~Response - No Autorizado (403 Forbidden)~~ (No aplica temporalmente)

```json
// Este error no se produce actualmente ya que no hay autenticación
// {
//   "error": "Forbidden",
//   "message": "You are not authorized to access this order"
// }
```

## Estados de Orden Disponibles

- `PENDING`: Orden pendiente
- `SHIPPED`: Orden enviada
- `DELIVERED`: Orden entregada
- `CANCELLED`: Orden cancelada

## Seguridad (Temporalmente Deshabilitada)

**⚠️ IMPORTANTE: La autenticación y autorización están temporalmente deshabilitadas. Todos los endpoints son públicos.**

### ~~Roles de Usuario~~ (No aplican temporalmente)

- ~~**USER**: Solo puede acceder a sus propias órdenes~~
- ~~**ADMIN**: Puede acceder a cualquier orden~~
- ~~**ROOT**: Puede acceder a cualquier orden~~

### ~~Obtener Token JWT~~ (No requerido temporalmente)

~~Para obtener un token JWT, necesitas autenticarte con el servicio de autenticación (`ms-auth`):~~

```bash
# Este endpoint no es necesario mientras la autenticación esté deshabilitada
# curl -X POST http://localhost:8080/api/auth/login \
#   -H "Content-Type: application/json" \
#   -d '{
#     "email": "user@example.com",
#     "password": "password123"
#   }'
```

## Ejemplos de Flujo Completo

### 1. Crear una nueva orden de tracking

```bash
curl -X POST http://localhost:8086/api/tracking \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "123e4567-e89b-12d3-a456-426614174000",
    "orderNumber": "ORD-2025-0001",
    "userId": "987fcdeb-51a2-43d1-b456-123456789abc",
    "status": "PENDING",
    "updatedAt": "2025-08-04T09:00:00"
  }'
```

### 2. Actualizar el estado de la orden

```bash
curl -X POST http://localhost:8086/api/tracking \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "123e4567-e89b-12d3-a456-426614174000",
    "orderNumber": "ORD-2025-0001",
    "userId": "987fcdeb-51a2-43d1-b456-123456789abc",
    "status": "SHIPPED",
    "updatedAt": "2025-08-04T10:30:00"
  }'
```

### 3. Consultar el estado actual

```bash
# Consulta pública (sin autenticación requerida)
curl -X GET http://localhost:8086/api/tracking/ORD-2025-0001
```

### 4. Finalizar la orden

```bash
curl -X POST http://localhost:8086/api/tracking \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "123e4567-e89b-12d3-a456-426614174000",
    "orderNumber": "ORD-2025-0001",
    "userId": "987fcdeb-51a2-43d1-b456-123456789abc",
    "status": "DELIVERED",
    "updatedAt": "2025-08-04T14:00:00"
  }'
```

## Monitoreo y Health Check

### Actuator Endpoints (Públicos)

```bash
# Health check
curl http://localhost:8086/actuator/health

# Info de la aplicación
curl http://localhost:8086/actuator/info

# Métricas
curl http://localhost:8086/actuator/metrics
```

## Troubleshooting

### Errores Comunes

1. ~~**401 Unauthorized**: Token JWT faltante o inválido~~ (No aplica temporalmente)
2. ~~**403 Forbidden**: Usuario no autorizado para acceder a la orden~~ (No aplica temporalmente)
3. **404 Not Found**: Orden no encontrada en Redis
4. **500 Internal Server Error**: Error de conexión con Redis

### Verificar Conexión con Redis

```bash
# Verificar si Redis está corriendo
redis-cli ping

# Ver las claves de tracking en Redis
redis-cli keys "tracking:order:*"

# Ver el contenido de una clave específica
redis-cli get "tracking:order:ORD-2025-0001"
```

## Variables de Entorno

```bash
SERVER_PORT=8086
REDIS_HOST=localhost
REDIS_PORT=6379
# Las siguientes variables JWT están temporalmente deshabilitadas:
# JWT_SECRET=mySecretKey123456789012345678901234567890123456789012345678901234567890
# JWT_EXPIRATION=86400000
```

## Reactivar Autenticación

Para reactivar la autenticación JWT en el futuro:

1. **Descomentar dependencias en pom.xml**:
   - `spring-boot-starter-security`
   - `spring-boot-starter-oauth2-resource-server` 
   - `jjwt-api`, `jjwt-impl`, `jjwt-jackson`

2. **Descomentar configuración JWT en application.properties**:
   - `jwt.secret`
   - `jwt.expiration`

3. **Implementar SecurityConfig** con filtros JWT y configuración de endpoints protegidos

4. **Actualizar este README** eliminando las notas de "temporalmente deshabilitado"
