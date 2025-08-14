# 🔐 LuchoExpress - Sistema de Autenticación y Seguridad

## 📋 Índice

1. [Arquitectura de Seguridad](#arquitectura-de-seguridad)
2. [Componentes del Sistema](#componentes-del-sistema)
3. [JWT (JSON Web Tokens)](#jwt-json-web-tokens)
4. [Endpoints y Rutas](#endpoints-y-rutas)
5. [Configuración de CORS](#configuración-de-cors)
6. [Testing con Postman](#testing-con-postman)
7. [Roles y Permisos](#roles-y-permisos)
8. [Bases de Datos y Modelos](#bases-de-datos-y-modelos)
9. [Flujo de Autenticación](#flujo-de-autenticación)
10. [Seguridad en Producción](#seguridad-en-producción)
11. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitectura de Seguridad

LuchoExpress implementa una **arquitectura de microservicios** con autenticación centralizada basada en **JWT (JSON Web Tokens)**. La seguridad se maneja en múltiples capas:

```mermaid
graph TB
    Client[Cliente Web/Móvil] --> Gateway[API Gateway :8080]
    Gateway --> Auth[MS Auth :8081]
    Gateway --> Customer[MS Customer :8082] 
    Gateway --> Orders[MS Orders :8084]
    Gateway --> Products[MS Products :8085]
    Gateway --> Tracking[MS Tracking :8086]
    
    Auth --> PostgresAuth[(PostgreSQL Auth DB)]
    Customer --> PostgresCustomer[(PostgreSQL Customer DB)]
    Orders --> MySQL[(MySQL Orders DB)]
    Products --> MySQLProducts[(MySQL Products DB)]
    Tracking --> Redis[(Redis)]
    
    Gateway -.->|CORS| Client
    Auth -.->|JWT| Gateway
```

### **Principios de Seguridad Implementados:**

1. **Autenticación Centralizada**: Un solo microservicio maneja toda la autenticación
2. **Autorización Distribuida**: Cada microservicio valida tokens JWT
3. **Principio de Menor Privilegio**: Acceso mínimo necesario por rol
4. **Separación de Responsabilidades**: Cada servicio maneja su dominio de seguridad
5. **Defensa en Profundidad**: Múltiples capas de seguridad

---

## 🧩 Componentes del Sistema

### **1. API Gateway (Puerto 8080)**
- **Función**: Punto de entrada único para todas las peticiones
- **Responsabilidades**:
  - Enrutamiento de peticiones a microservicios
  - Configuración de CORS
  - Balanceo de carga
  - Rate limiting (futuro)
  - Logging centralizado

### **2. Microservicio de Autenticación (Puerto 8081)**
- **Función**: Gestión completa de usuarios y autenticación
- **Base de Datos**: PostgreSQL (Puerto 5433)
- **Responsabilidades**:
  - Registro de usuarios
  - Autenticación (login)
  - Generación de tokens JWT
  - Gestión de roles y permisos
  - Validación de tokens

### **3. Microservicios Protegidos**
- **Customer Service (8082)**: Gestión de perfiles de clientes
- **Orders Service (8084)**: Procesamiento de pedidos
- **Products Service (8085)**: Catálogo de productos
- **Tracking Service (8086)**: Seguimiento de pedidos

---

## 🎫 JWT (JSON Web Tokens)

### **¿Qué es JWT?**
JWT es un estándar abierto (RFC 7519) que define una forma compacta y segura de transmitir información entre partes como un objeto JSON.

### **Estructura de JWT en LuchoExpress:**

```javascript
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "sub": "5ee71a74-f495-459f-b1fa-49b555179cfb",  // User ID
  "username": "testuser",
  "role": "USER",
  "iat": 1691712000,  // Issued At
  "exp": 1691798400   // Expiration (24 hours)
}

// Signature
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

### **Configuración JWT:**

```properties
# JWT Configuration (application.properties)
jwt.secret=myVerySecureSecretKeyForJWT1234567890...  # 256-bit key
jwt.expiration=86400000  # 24 hours in milliseconds
```

### **Ventajas de JWT:**
- ✅ **Stateless**: No requiere almacenamiento en servidor
- ✅ **Escalable**: Funciona perfecto en microservicios
- ✅ **Seguro**: Firmado criptográficamente
- ✅ **Compacto**: Fácil de transmitir
- ✅ **Estándar**: Ampliamente adoptado

---

## 🛣️ Endpoints y Rutas

### **Rutas del API Gateway:**

| Ruta | Microservicio | Puerto | Descripción |
|------|---------------|--------|-------------|
| `/auth/**` | MS Auth | 8081 | Autenticación y usuarios |
| `/api/customers/**` | MS Customer | 8082 | Gestión de clientes |
| `/api/orders/**` | MS Orders | 8084 | Procesamiento de pedidos |
| `/api/products/**` | MS Products | 8085 | Catálogo de productos |
| `/api/categories/**` | MS Products | 8085 | Categorías de productos |
| `/api/tracking/**` | MS Tracking | 8086 | Seguimiento de pedidos |

### **Endpoints del Microservicio de Auth:**

#### **🔓 Endpoints Públicos (No requieren autenticación):**

| Método | Endpoint | Descripción | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/auth/register` | Registro de nuevo usuario | `RegisterRequest` |
| `POST` | `/auth/token` | Login (autenticación) | `LoginRequest` |

#### **🔒 Endpoints Protegidos (Requieren JWT):**

| Método | Endpoint | Descripción | Roles Requeridos |
|--------|----------|-------------|------------------|
| `GET` | `/auth/me` | Perfil del usuario actual | Cualquier usuario autenticado |
| `GET` | `/auth/users` | Listar todos los usuarios | `ADMIN`, `ROOT` |
| `GET` | `/auth/users/{id}` | Obtener usuario por ID | Usuario propietario, `ADMIN`, `ROOT` |
| `POST` | `/auth/users` | Crear nuevo usuario | `ADMIN`, `ROOT` |
| `PATCH` | `/auth/users/{id}` | Actualizar usuario | Usuario propietario, `ADMIN`, `ROOT` |
| `PATCH` | `/auth/users/{id}/disable` | Deshabilitar usuario | `ADMIN`, `ROOT` |
| `PATCH` | `/auth/users/{id}/enable` | Habilitar usuario | `ADMIN`, `ROOT` |

---

## 🌐 Configuración de CORS

### **CORS en API Gateway:**

```yaml
spring:
  cloud:
    gateway:
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOriginPatterns: 
              - "http://localhost:4200"      # Angular Development
              - "http://127.0.0.1:4200"      # Localhost alternativo
            allowedMethods:
              - GET
              - POST
              - PUT
              - PATCH
              - DELETE
              - OPTIONS
              - HEAD
            allowedHeaders: "*"              # Todos los headers
            exposedHeaders: "*"              # Exponer todos los headers
            allowCredentials: true           # Permitir cookies/credentials
            maxAge: 3600                     # Cache preflight por 1 hora
```

### **¿Por qué CORS?**
- **Seguridad del Navegador**: Los navegadores bloquean peticiones cross-origin por seguridad
- **Control de Acceso**: Define qué dominios pueden acceder a la API
- **Frontend-Backend Separation**: Permite que el frontend (localhost:4200) acceda al backend (localhost:8080)

---

## 🧪 Testing con Postman

### **Configuración de Environment:**

```json
{
  "name": "LuchoExpress",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:8080"
    },
    {
      "key": "token",
      "value": ""
    },
    {
      "key": "user_id",
      "value": ""
    }
  ]
}
```

### **Colección de Requests:**

#### **1. Registro de Usuario**
```http
POST {{base_url}}/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "role": "USER"
}
```

#### **2. Login (Obtener Token)** ⚠️ **ENDPOINT CORRECTO**
```http
POST {{base_url}}/auth/token
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

**Script Post-Response (Tab Tests):**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.token);
    pm.environment.set("user_id", response.user.id);
    console.log("Token guardado:", response.token);
}
```

#### **3. Perfil del Usuario**
```http
GET {{base_url}}/auth/me
Authorization: Bearer {{token}}
```

#### **4. Crear Cliente**
```http
POST {{base_url}}/api/customers
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "userId": "{{user_id}}",
  "documentId": "1234567890",
  "name": "Test User",
  "email": "test@example.com",
  "phone": "+593987654321",
  "address": "Av. Principal 123, Quito, Ecuador"
}
```

#### **5. Obtener Productos**
```http
GET {{base_url}}/api/products
Authorization: Bearer {{token}}
```

#### **6. Crear Orden**
```http
POST {{base_url}}/api/orders
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "customerId": "1",
  "products": [
    {
      "productId": "1",
      "quantity": 2
    }
  ],
  "deliveryAddress": "Av. Principal 123, Quito, Ecuador",
  "estimatedDeliveryDate": "2025-08-17"
}
```

---

## 👥 Roles y Permisos

### **Jerarquía de Roles:**

```
ROOT (Superadministrador)
  ├── Acceso total al sistema
  ├── Gestión de administradores
  └── Configuraciones críticas
  
ADMIN (Administrador)
  ├── Gestión de usuarios
  ├── Gestión de productos
  ├── Visualización de órdenes
  └── Reportes del sistema
  
USER (Usuario Regular)
  ├── Registro y login
  ├── Gestión de su perfil
  ├── Creación de órdenes
  └── Seguimiento de sus pedidos
```

### **Matriz de Permisos:**

| Endpoint | USER | ADMIN | ROOT |
|----------|------|-------|------|
| `POST /auth/register` | ✅ | ✅ | ✅ |
| `POST /auth/token` | ✅ | ✅ | ✅ |
| `GET /auth/me` | ✅ | ✅ | ✅ |
| `GET /auth/users` | ❌ | ✅ | ✅ |
| `POST /auth/users` | ❌ | ✅ | ✅ |
| `PATCH /auth/users/{id}` | 👤 | ✅ | ✅ |
| `POST /api/customers` | ✅ | ✅ | ✅ |
| `POST /api/orders` | ✅ | ✅ | ✅ |
| `GET /api/products` | ✅ | ✅ | ✅ |

**Leyenda:**
- ✅ Permitido
- ❌ Denegado  
- 👤 Solo el propietario del recurso

---

## 💾 Bases de Datos y Modelos

### **Base de Datos de Autenticación (PostgreSQL):**

```sql
-- Tabla Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### **Modelo de Usuario (Java):**

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    @Enumerated(EnumType.STRING)
    private Role role;
    
    private Boolean enabled = true;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Constructors, getters, setters...
}
```

### **DTOs de Request/Response:**

```java
// Registro
public class RegisterRequest {
    @NotBlank
    @Size(min = 3, max = 50)
    private String username;
    
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    @Size(min = 8, max = 100)
    private String password;
    
    @NotNull
    private Role role;
}

// Login
public class LoginRequest {
    @NotBlank
    private String username;
    
    @NotBlank
    private String password;
}

// Respuesta de Token
public class TokenResponse {
    private String token;
    private String type = "Bearer";
    private UserResponse user;
}
```

---

## 🔄 Flujo de Autenticación

### **Diagrama de Flujo:**

```mermaid
sequenceDiagram
    participant C as Cliente
    participant G as API Gateway
    participant A as Auth Service
    participant DB as PostgreSQL
    participant MS as Otros Microservicios
    
    Note over C,MS: Registro de Usuario
    C->>G: POST /auth/register
    G->>A: Forward request
    A->>DB: Verificar username/email únicos
    A->>DB: Crear usuario (password hasheado)
    A->>G: UserResponse
    G->>C: 201 Created + UserResponse
    
    Note over C,MS: Autenticación (Login)
    C->>G: POST /auth/token
    G->>A: Forward request
    A->>DB: Buscar usuario por username
    A->>A: Verificar password (BCrypt)
    A->>A: Generar JWT token
    A->>G: TokenResponse
    G->>C: 200 OK + JWT Token
    
    Note over C,MS: Acceso a Recursos Protegidos
    C->>G: GET /api/customers (Authorization: Bearer JWT)
    G->>MS: Forward request + JWT
    MS->>MS: Validar JWT signature
    MS->>MS: Extraer user info del JWT
    MS->>MS: Verificar permisos
    MS->>G: Resource response
    G->>C: 200 OK + Data
```

### **Proceso Detallado:**

#### **1. Registro:**
1. Cliente envía credenciales
2. API Gateway enruta al Auth Service
3. Auth Service valida datos de entrada
4. Verifica que username/email sean únicos
5. Hashea la password con BCrypt
6. Guarda usuario en PostgreSQL
7. Retorna datos del usuario (sin password)

#### **2. Login:**
1. Cliente envía username/password
2. Auth Service busca usuario en DB
3. Verifica password usando BCrypt.checkpw()
4. Si es válido, genera JWT con:
   - User ID
   - Username
   - Role
   - Tiempo de expiración (24h)
5. Retorna JWT token y datos del usuario

#### **3. Validación de Token:**
1. Cliente incluye token en header: `Authorization: Bearer <token>`
2. Microservicio extrae y valida el token:
   - Verifica signature con secret key
   - Verifica que no haya expirado
   - Extrae información del usuario
3. Autoriza la operación basada en role/permisos

---

## 🛡️ Seguridad en Producción

### **Configuraciones de Seguridad:**

#### **1. JWT Secret Key:**
```properties
# NUNCA usar en producción - solo para desarrollo
jwt.secret=myVerySecureSecretKeyForJWT...

# En producción usar variable de entorno
jwt.secret=${JWT_SECRET}
```

**Generación de Secret Key segura:**
```bash
# Generar key de 256 bits (32 bytes)
openssl rand -base64 32
# o
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### **2. Configuración de Base de Datos:**
```properties
# Desarrollo
spring.datasource.url=jdbc:postgresql://localhost:5433/auth_db
spring.datasource.username=admin
spring.datasource.password=admin

# Producción - usar variables de entorno
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

#### **3. HTTPS en Producción:**
```yaml
server:
  port: 8443
  ssl:
    enabled: true
    key-store: classpath:keystore.p12
    key-store-password: ${KEYSTORE_PASSWORD}
    key-store-type: PKCS12
    key-alias: lucho-express
```

#### **4. Rate Limiting:**
```yaml
# Configuración futura en API Gateway
spring:
  cloud:
    gateway:
      filter:
        request-rate-limiter:
          redis-rate-limiter:
            replenish-rate: 10  # tokens per second
            burst-capacity: 20  # maximum burst
```

### **Mejores Prácticas Implementadas:**

- ✅ **Passwords Hasheadas**: BCrypt con salt automático
- ✅ **JWT Firmados**: HMAC-SHA256 con secret key
- ✅ **Tokens con Expiración**: 24 horas por defecto
- ✅ **CORS Configurado**: Solo dominios permitidos
- ✅ **Validation**: Validación de entrada en DTOs
- ✅ **Roles y Permisos**: Autorización granular
- ✅ **Separación de Concerns**: Cada servicio su responsabilidad

### **Mejoras Futuras:**

- 🔄 **Refresh Tokens**: Para renovación automática
- 🔄 **Rate Limiting**: Prevención de ataques de fuerza bruta
- 🔄 **Audit Logging**: Registro de accesos y cambios
- 🔄 **2FA**: Autenticación de dos factores
- 🔄 **Session Management**: Invalidación de tokens
- 🔄 **HTTPS**: Cifrado en tránsito

---

## 🐛 Troubleshooting

### **Problemas Comunes y Soluciones:**

#### **1. Error 403 Forbidden en Login**

**Problema**: `POST /auth/login` devuelve 403

**Causa**: El endpoint correcto es `/auth/token`, no `/auth/login`

**Solución**:
```http
# ❌ Incorrecto
POST http://localhost:8080/auth/login

# ✅ Correcto  
POST http://localhost:8080/auth/token
```

#### **2. Error 401 Unauthorized**

**Problemas posibles**:
- Token expirado (> 24 horas)
- Token malformado
- Header Authorization incorrecto
- Secret key diferente

**Solución**:
```http
# Verificar formato del header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Renovar token si expiró
POST /auth/credentials
```

#### **3. Error de CORS**

**Problema**: Navegador bloquea petición cross-origin

**Verificar**:
1. API Gateway está ejecutándose
2. Frontend está en puerto permitido (4200)
3. Headers son los correctos

**Logs útiles**:
```bash
# Ver logs del API Gateway
docker logs api-gateway-lucho-express

# Ver logs del Auth Service
docker logs ms-auth-lucho-express
```

#### **4. Error de Base de Datos**

**Síntomas**:
- Cannot connect to database
- Connection refused

**Solución**:
```bash
# Verificar contenedores de BD
docker ps | grep postgres

# Reiniciar base de datos
docker restart postgres-auth

# Ver logs
docker logs postgres-auth
```

#### **5. JWT Token Inválido**

**Verificar token en [jwt.io](https://jwt.io)**:
- Header correcto
- Payload con datos esperados  
- Signature válida con el secret

#### **6. Permisos Insuficientes**

**Error**: Access Denied para operación

**Verificar**:
1. Rol del usuario: `GET /auth/me`
2. Permisos requeridos para el endpoint
3. JWT contiene el rol correcto

### **Comandos Útiles para Debug:**

```bash
# Estado de contenedores
docker ps --filter "name=lucho-express"

# Logs en tiempo real
docker logs -f ms-auth-lucho-express

# Reiniciar servicio específico
docker restart ms-auth-lucho-express

# Probar endpoint directamente
curl -X POST http://localhost:8080/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}' -v

# Verificar conectividad de red
docker exec -it api-gateway-lucho-express ping ms-auth-lucho-express
```

---

## 📚 Referencias y Documentación

### **Estándares y Especificaciones:**
- [RFC 7519 - JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)
- [RFC 6749 - OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

### **Tecnologías Utilizadas:**
- **Spring Security 6**: Framework de seguridad para Java
- **Spring Cloud Gateway**: API Gateway reactivo
- **BCrypt**: Algoritmo de hash para passwords
- **PostgreSQL**: Base de datos relacional para usuarios
- **JWT**: Tokens de autenticación stateless
- **Docker**: Containerización de servicios

### **Herramientas de Testing:**
- **Postman**: Cliente HTTP para testing de APIs
- **curl**: Cliente de línea de comandos
- **jwt.io**: Decodificador y validador de JWT tokens

---

## 🏆 Conclusión

El sistema de autenticación y seguridad de LuchoExpress implementa las mejores prácticas de la industria:

- **Seguridad Multicapa**: Desde el API Gateway hasta cada microservicio
- **Escalabilidad**: Arquitectura stateless con JWT
- **Mantenibilidad**: Separación clara de responsabilidades  
- **Flexibilidad**: Sistema de roles y permisos granular
- **Estándares**: Uso de tecnologías y protocolos estándar

Este sistema proporciona una base sólida para el crecimiento futuro del proyecto, manteniendo la seguridad como prioridad principal.

---

**Última actualización**: Agosto 2025  
**Versión del sistema**: v2.0  
**Autor**: Equipo LuchoExpress
