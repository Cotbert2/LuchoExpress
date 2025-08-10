# LuchoExpress - Docker Hub Deployment Guide

LuchoExpress es una plataforma de e-commerce completa construida con microservicios Spring Boot y frontend Angular.

## 🏗️ Arquitectura

- **Frontend**: Angular 19 con PrimeNG
- **API Gateway**: Spring Cloud Gateway
- **Microservicios**:
  - MS Auth (Autenticación)
  - MS Customer (Clientes)
  - MS Products (Productos y Categorías)
  - MS Orders (Pedidos)
  - MS Tracking (Seguimiento)
- **Bases de Datos**: PostgreSQL, MySQL, Redis

## 🐳 Imágenes Docker disponibles

Todas las imágenes están disponibles en Docker Hub bajo el usuario `luissagx`:

- `luissagx/frontend-lucho-express:v1`
- `luissagx/api-gateway-lucho-express:v1`
- `luissagx/ms-auth-lucho-express:v1`
- `luissagx/ms-customer-lucho-express:v1`
- `luissagx/ms-product-lucho-express:v1`
- `luissagx/ms-orders-lucho-express:v1`
- `luissagx/ms-tracking-lucho-express:v1`

## 🚀 Despliegue Rápido

### Prerequisitos
- Docker y Docker Compose instalados
- Puertos disponibles: 3306, 3307, 5432, 5433, 6379, 8080-8086, 4200

### Opción 1: Script Automatizado

```bash
# Clonar el repositorio
git clone <repository-url>
cd LuchoExpress

# Hacer ejecutable y ejecutar el script de despliegue
chmod +x deploy.sh
./deploy.sh
```

### Opción 2: Manual con Docker Compose

```bash
# Clonar el repositorio
git clone <repository-url>
cd LuchoExpress

# Desplegar
docker-compose up -d

# Verificar estado
docker-compose ps
```

## 📋 Servicios y Puertos

| Servicio | Puerto | Descripción |
|----------|---------|-------------|
| Frontend | 4200 | Aplicación web Angular |
| API Gateway | 8080 | Punto de entrada para APIs |
| MS Auth | 8081 | Autenticación y autorización |
| MS Customer | 8082 | Gestión de clientes |
| MS Orders | 8084 | Gestión de pedidos |
| MS Products | 8085 | Productos y categorías |
| MS Tracking | 8086 | Seguimiento de pedidos |
| PostgreSQL (Auth) | 5433 | Base de datos autenticación |
| PostgreSQL (Customers) | 5432 | Base de datos clientes |
| MySQL (Products) | 3306 | Base de datos productos |
| MySQL (Orders) | 3307 | Base de datos pedidos |
| Redis | 6379 | Cache para tracking |

## 🔧 Variables de Entorno

### Bases de Datos
- `DB_HOST`: Host de la base de datos
- `DB_PORT`: Puerto de la base de datos
- `DB_NAME`: Nombre de la base de datos
- `DB_USER`: Usuario de la base de datos (default: admin)
- `DB_PASSWORD`: Contraseña de la base de datos (default: admin)

### Microservicios
- `PRODUCT_SERVICE_URL`: URL del servicio de productos
- `CUSTOMER_SERVICE_URL`: URL del servicio de clientes
- `ORDER_SERVICE_URL`: URL del servicio de pedidos
- `TRACKING_SERVICE_URL`: URL del servicio de tracking
- `REDIS_HOST`: Host de Redis
- `REDIS_PORT`: Puerto de Redis

## 🏥 Health Checks

Todos los servicios incluyen health checks:
- **Aplicaciones Spring Boot**: `/actuator/health`
- **Frontend**: `/health`
- **Bases de Datos**: Verificación de conexión específica

## 📊 Monitoreo

```bash
# Ver estado de todos los servicios
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs -f [service-name]

# Ver logs de todos los servicios
docker-compose logs -f
```

## 🧹 Limpieza

```bash
# Parar servicios
docker-compose down

# Parar servicios y remover volúmenes
docker-compose down -v

# Remover imágenes
docker rmi $(docker images "luissagx/*lucho-express*" -q)
```

## 🔒 Seguridad

- Todas las comunicaciones entre servicios se realizan a través de la red interna de Docker
- El frontend incluye headers de seguridad configurados
- Las bases de datos no están expuestas externamente (solo para desarrollo)
- Se recomienda usar secretos de Docker para credenciales en producción

## 🌐 URLs de Acceso

Una vez desplegado:
- **Frontend**: http://localhost:4200
- **API Gateway**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/webjars/swagger-ui/index.html

## 📝 Notas Importantes

1. **Primera ejecución**: Los servicios pueden tardar 2-3 minutos en estar completamente listos
2. **Dependencias**: Los microservicios esperan a que las bases de datos estén saludables antes de iniciar
3. **Datos**: Los volúmenes de datos persisten entre reinicios
4. **Desarrollo**: Para desarrollo, considera usar perfiles de Spring específicos

## 🤝 Soporte

Para reportar problemas o solicitar características:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

## 📄 Licencia

Este proyecto está licenciado bajo los términos especificados en el archivo LICENSE del repositorio.
