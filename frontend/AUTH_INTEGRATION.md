# Sistema de Autenticación LuchoExpress

## Descripción

Este proyecto integra el microservicio de autenticación `ms-auth` con el frontend de Angular, implementando un sistema completo de login/registro con JWT y formularios reactivos.

## Características implementadas

### Backend (ms-auth)
- Autenticación JWT
- Registro de usuarios
- Login con username/password
- Roles de usuario
- Endpoints protegidos
- Validaciones de datos

### Frontend (Angular)
- Formularios reactivos con validaciones
- Servicio de autenticación integrado
- Interceptor HTTP para JWT automático
- Guard para rutas protegidas
- Gestión de estado de usuario
- Mensajes de error/éxito con PrimeNG Toast

## APIs del microservicio ms-auth

### Endpoints disponibles:

1. **POST /auth/register**
   - Registra un nuevo usuario
   - Body: `{ "username": "string", "email": "string", "password": "string" }`
   - Response: `UserResponse`

2. **POST /auth/token**
   - Inicia sesión y obtiene token JWT
   - Body: `{ "username": "string", "password": "string" }`
   - Response: `{ "accessToken": "string", "tokenType": "Bearer", "expiresIn": number }`

3. **GET /auth/me**
   - Obtiene información del usuario autenticado
   - Headers: `Authorization: Bearer <token>`
   - Response: `UserResponse`

4. **GET /auth/users** (Solo ADMIN/ROOT)
   - Lista todos los usuarios
   - Response: `UserResponse[]`

5. **GET /auth/users/{id}**
   - Obtiene usuario por ID
   - Response: `UserResponse`

## Estructura del Frontend

```
src/app/
├── components/
│   └── login/                    # Componente de login/registro
├── services/
│   └── auth.service.ts          # Servicio de autenticación
├── interfaces/
│   └── auth.interface.ts        # Interfaces TypeScript
├── interceptors/
│   └── auth.interceptor.ts      # Interceptor HTTP para JWT
├── guards/
│   └── auth.guard.ts           # Guard para rutas protegidas
└── environments/
    ├── environment.ts          # Configuración desarrollo
    └── environment.prod.ts     # Configuración producción
```

## Configuración

### 1. Variables de entorno

Edita `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  authUrl: 'http://localhost:8080/auth'
};
```

### 2. Iniciar el microservicio ms-auth

```bash
cd backend/ms-auth
./mvnw spring-boot:run
```

El servicio estará disponible en `http://localhost:8080`

### 3. Iniciar el frontend Angular

```bash
cd frontend
npm install
ng serve
```

El frontend estará disponible en `http://localhost:4200`

## Uso del componente Login

### Características:

1. **Formularios reactivos** con validaciones en tiempo real
2. **Cambio dinámico** entre login y registro
3. **Validaciones incluidas**:
   - Username: mínimo 3 caracteres, máximo 50
   - Email: formato válido, máximo 100 caracteres
   - Password: mínimo 6 caracteres, máximo 100
   - Confirmación de password (solo en registro)

### En el template:

```html
<app-login></app-login>
```

### Propiedades del componente:

- `isLogin`: boolean - Alterna entre login (true) y registro (false)

## Servicio de Autenticación (AuthService)

### Métodos principales:

```typescript
// Login
login(loginRequest: LoginRequest): Observable<TokenResponse>

// Registro
register(registerRequest: RegisterRequest): Observable<UserResponse>

// Obtener usuario actual
getCurrentUser(): Observable<UserResponse>

// Logout
logout(): void

// Verificar si está logueado
isLoggedIn(): boolean

// Obtener token
getToken(): string | null
```

### Uso en componentes:

```typescript
constructor(private authService: AuthService) {}

// Verificar estado de autenticación
ngOnInit() {
  this.authService.currentUser$.subscribe(user => {
    console.log('Usuario actual:', user);
  });
}

// Hacer login
this.authService.login({ username: 'test', password: 'password' })
  .subscribe({
    next: (response) => console.log('Login exitoso', response),
    error: (error) => console.error('Error en login', error)
  });
```

## Guard de Autenticación

Para proteger rutas, usa el `AuthGuard`:

```typescript
// En app.routes.ts
{
  path: 'dashboard',
  loadComponent: () => import('./dashboard/dashboard.component'),
  canActivate: [AuthGuard]
}
```

## Interceptor HTTP

El `AuthInterceptor` se encarga automáticamente de:
- Agregar el header `Authorization: Bearer <token>` a las requests
- Manejar errores 401 (token expirado)
- Redireccionar al login cuando sea necesario

## Funcionalidades adicionales

### Persistencia de sesión
- El token y datos del usuario se guardan en `localStorage`
- La sesión se mantiene al recargar la página
- Auto-logout cuando el token expira

### Manejo de errores
- Mensajes de error específicos para cada validación
- Toast notifications con PrimeNG
- Manejo de errores de red y servidor

### Validaciones de formulario
- Validaciones en tiempo real
- Mensajes de error contextuales
- Deshabilitado de botones mientras el formulario es inválido

## Próximos pasos

1. **Implementar recuperación de contraseña**
2. **Agregar refresh token**
3. **Crear dashboard para usuarios autenticados**
4. **Implementar gestión de perfiles de usuario**
5. **Agregar roles y permisos más granulares**

## Problemas conocidos

- Asegúrate de que el microservicio ms-auth esté ejecutándose en el puerto 8080
- Verifica que CORS esté configurado correctamente en el backend
- El token JWT tiene un tiempo de expiración configurado en el backend (24 horas por defecto)
