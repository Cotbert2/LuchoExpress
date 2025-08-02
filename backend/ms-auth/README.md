# Auth Service

This microservice handles authentication and user management for LuchoExpress following Clean Architecture principles.

## Features

- **Clean Architecture**: Clear separation between layers (Domain, Application, Infrastructure, Presentation)
- **Spring Boot 3.x**: Main framework
- **Spring Security**: Security with JWT
- **PostgreSQL**: Main database
- **Spring Data JPA**: Data access
- **BCrypt**: Password encryption
- **JWT**: Authentication tokens
- **Lombok**: Reduces boilerplate code

## Project Structure

```
src/main/java/com/bitcrack/luchoexpress/luchoexpress_auth_service/
├── domain/                          # Domain layer
│   ├── User.java                   # Main entity
│   └── RoleEnum.java               # Roles enum
├── application/                     # Application layer
│   ├── dto/                        # DTOs
│   │   ├── RegisterRequest.java
│   │   ├── LoginRequest.java
│   │   ├── CreateUserRequest.java
│   │   ├── UpdateUserRequest.java
│   │   ├── UserResponse.java
│   │   └── TokenResponse.java
│   ├── mapper/                     # Mappers
│   │   └── UserMapper.java
│   └── service/                    # Application services
│       ├── UserService.java
│       └── JwtService.java
├── infrastructure/                  # Infrastructure layer
│   ├── config/                     # Configurations
│   │   ├── SecurityConfig.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── DataInitializer.java
│   └── exceptions/                 # Exception handling
│       ├── UserNotFoundException.java
│       ├── UserAlreadyExistsException.java
│       ├── UnauthorizedOperationException.java
│       ├── InvalidCredentialsException.java
│       └── GlobalExceptionHandler.java
├── persistance/                    # Persistence layer
│   └── repositories/
│       └── UserRepository.java
└── presentation/                   # Presentation layer
    └── AuthController.java         # REST controller
```

## Role Hierarchy

### ROOT
- Can create and manage any user type (ROOT, ADMIN, USER)
- Can disable any user except themselves
- Full access to all endpoints

### ADMIN
- Can create and manage USER and ADMIN users
- Can disable USER and ADMIN users (not ROOT)
- Can list all users

### USER
- Can only view and modify their own profile
- Can disable their own account
- Cannot create other users

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user (USER role) |
| POST | `/auth/token` | Obtain JWT token |

### Protected Endpoints

| Method | Endpoint | Description | Authorization |
|--------|----------|-------------|--------------|
| GET | `/auth/me` | Get authenticated user's profile | Any authenticated user |
| GET | `/auth/users` | List all users | ADMIN, ROOT |
| GET | `/auth/users/{id}` | Get user by ID | According to hierarchy |
| POST | `/auth/users` | Create user with specified role | ADMIN, ROOT |
| PATCH | `/auth/users/{id}` | Update user (change password) | According to hierarchy |
| PATCH | `/auth/users/{id}/disable` | Disable user | According to hierarchy |

### Usage Examples

#### Register User (Public)
```bash
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123",
  "email": "john.doe@email.com"
}
```

#### Login
```bash
POST /auth/token
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000
}
```

#### Get Current Profile
```bash
GET /auth/me
Authorization: Bearer {jwt-token}
```

#### Create User with Role (ADMIN/ROOT)
```bash
POST /auth/users
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "username": "adminuser",
  "password": "adminpass123",
  "email": "admin@email.com",
  "role": "ADMIN"
}
```

#### Update Password
```bash
PATCH /auth/users/{id}
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "password": "newpassword123"
}
```

#### Disable User
```bash
PATCH /auth/users/{id}/disable
Authorization: Bearer {jwt-token}
```

## Data Model

### User Entity

```java
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "role": "ROOT|ADMIN|USER",
  "enabled": "boolean",
  "createdAt": "datetime"
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

## Configuration

### Environment Variables

```properties
# Database
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=auth_db
DB_USER=admin
DB_PASSWORD=admin

# JWT
JWT_SECRET=myVerySecureSecretKeyForJWT1234567890123456789012345678901234567890123456789012345678901234567890
JWT_EXPIRATION=86400000

# Server
PORT=8080
```

### Database

1. Create the PostgreSQL database:
```sql
CREATE DATABASE auth_db;
```

2. Tables, indexes, and constraints are created automatically using JPA/Hibernate
3. A ROOT user will be created automatically with:
   - Username: `root`
   - Password: `rootpassword123`
   - Email: `root@luchoexpress.com`

## Validations

### RegisterRequest / CreateUserRequest
- `username`: Required, 3-50 characters, unique
- `password`: Required, 6-100 characters
- `email`: Required, valid format, unique
- `role`: Required (only in CreateUserRequest)

### UpdateUserRequest
- `password`: Optional, 6-100 characters

## Security

### Encryption
- Passwords are encrypted using BCrypt
- JWT tokens are signed with HMAC SHA-512

### Authorization
- Role hierarchy validation for each operation
- Permission verification based on JWT token
- Custom JWT filter for authentication

## Error Handling

### Validation Errors (400)
```json
{
  "status": 400,
  "error": "Validation failed",
  "fieldErrors": {
    "username": "Username is required",
    "email": "Email must be valid"
  },
  "timestamp": "2025-08-02T10:30:00"
}
```

### Invalid Credentials (401)
```json
{
  "status": 401,
  "error": "Invalid credentials",
  "message": "Invalid credentials",
  "timestamp": "2025-08-02T10:30:00"
}
```

### Unauthorized Operation (403)
```json
{
  "status": 403,
  "error": "Operation not authorized",
  "message": "You don't have permission to create users with role: ROOT",
  "timestamp": "2025-08-02T10:30:00"
}
```

### User Not Found (404)
```json
{
  "status": 404,
  "error": "User not found",
  "message": "User not found with ID: {id}",
  "timestamp": "2025-08-02T10:30:00"
}
```

### User Already Exists (409)
```json
{
  "status": 409,
  "error": "User already exists",
  "message": "Username already exists: johndoe",
  "timestamp": "2025-08-02T10:30:00"
}
```

## Running

### Local Development

1. Make sure PostgreSQL is running
2. Set up the environment variables
3. Run the application:

```bash
mvn spring-boot:run
```

4. The ROOT user will be created automatically on first startup

### First Use

1. Use the ROOT user credentials to create administrators
2. Users can register publicly with USER role
3. Change the ROOT user password in production

## Example cURL Commands

### Register User
```bash
curl -X POST http://localhost:8080/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username":"johndoe","password":"password123","email":"john.doe@email.com"}'
```

### Obtain JWT Token
```bash
curl -X POST http://localhost:8080/auth/token \
    -H "Content-Type: application/json" \
    -d '{"username":"johndoe","password":"password123"}'
```

### Get Authenticated User Profile
```bash
curl -X GET http://localhost:8080/auth/me \
    -H "Authorization: Bearer {jwt-token}"
```

### List All Users (ADMIN/ROOT)
```bash
curl -X GET http://localhost:8080/auth/users \
    -H "Authorization: Bearer {jwt-token}"
```

### Create User with Role (ADMIN/ROOT)
```bash
curl -X POST http://localhost:8080/auth/users \
    -H "Authorization: Bearer {jwt-token}" \
    -H "Content-Type: application/json" \
    -d '{"username":"adminuser","password":"adminpass123","email":"admin@email.com","role":"ADMIN"}'
```

### Update User Password
```bash
curl -X PATCH http://localhost:8080/auth/users/{id} \
    -H "Authorization: Bearer {jwt-token}" \
    -H "Content-Type: application/json" \
    -d '{"password":"newpassword123"}'
```

### Disable User
```bash
curl -X PATCH http://localhost:8080/auth/users/{id}/disable \
    -H "Authorization: Bearer {jwt-token}"
```
