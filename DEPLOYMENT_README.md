# LuchoExpress - Deployment Instructions

## 🚀 Despliegue con Docker

Este proyecto está completamente dockerizado y puede ejecutarse de varias formas.

### 📋 Prerrequisitos

- Docker instalado
- Docker Compose instalado
- Al menos 4GB de RAM libre
- Puertos 3306, 3307, 4200, 5432, 5433, 6379, 8080-8086 disponibles

## 🎯 Opción 1: Usando Docker Compose (Recomendado)

La forma más sencilla de ejecutar todo el proyecto:

```bash
# Clonar el repositorio
git clone <repository-url>
cd LuchoExpress

# Ejecutar toda la aplicación
docker-compose up -d

# Ver los logs (opcional)
docker-compose logs -f

# Parar la aplicación
docker-compose down
```

**URLs disponibles:**
- Frontend: http://localhost:4200
- API Gateway: http://localhost:8080

## 🛠️ Opción 2: Usando Scripts Individuales

Si prefieres más control sobre el proceso:

```bash
# Para ejecutar contenedores locales (usando imágenes de Docker Hub)
./run-local-containers.sh

# Para parar todos los contenedores
./stop-local-containers.sh
```

## 🏗️ Para Desarrolladores - Construcción Local

Si quieres modificar el código y construir las imágenes localmente:

### Construir y usar localmente:

```bash
# 1. Construir todas las imágenes localmente
./build-local-images.sh

# 2. Ejecutar con imágenes locales
./run-local-containers.sh

# 3. Para parar
./stop-local-containers.sh
```

### Subir cambios a Docker Hub:

```bash
# Opción A: Si ya tienes las imágenes construidas localmente
./tag-and-push-existing-images.sh

# Opción B: Construir, etiquetar y subir todo de una vez
./build-and-push-to-dockerhub.sh
```

**Nota:** Necesitas estar logueado en Docker Hub (`docker login`) para subir imágenes.

## 📊 Monitoreo

```bash
# Ver estado de contenedores
docker ps

# Ver logs de un contenedor específico
docker logs <container-name>

# Ver logs de un servicio en docker-compose
docker-compose logs <service-name>

# Ver logs en tiempo real
docker-compose logs -f
```

## 🗃️ Servicios y Puertos

| Servicio | Puerto | Base de Datos | Puerto DB |
|----------|--------|---------------|-----------|
| Frontend | 4200 | - | - |
| API Gateway | 8080 | - | - |
| Auth Service | 8081 | PostgreSQL | 5433 |
| Customer Service | 8082 | PostgreSQL | 5432 |
| Order Service | 8084 | MySQL | 3307 |
| Product Service | 8085 | MySQL | 3306 |
| Tracking Service | 8086 | Redis | 6379 |

## 🐛 Solución de Problemas

### Problema: Puertos ocupados
```bash
# Ver qué proceso usa un puerto
sudo netstat -tulpn | grep :4200

# Cambiar puertos en docker-compose.yml si es necesario
```

### Problema: Contenedores no se inician
```bash
# Ver logs detallados
docker-compose logs <service-name>

# Reiniciar servicios específicos
docker-compose restart <service-name>
```

### Problema: Base de datos no se conecta
```bash
# Verificar que las bases de datos estén ejecutándose
docker ps | grep -E "(mysql|postgres|redis)"

# Reiniciar bases de datos
docker-compose restart mysql-products postgres-auth postgres-customers order-mysql redis-tracking-service
```

### Limpiar todo (reset completo)
```bash
# Parar y remover todo
docker-compose down

# Remover volúmenes (⚠️ esto borra los datos)
docker-compose down -v

# Remover imágenes locales
docker rmi $(docker images -q "luissagx/*")
```

## 🔧 Configuración Avanzada

### Variables de Entorno

Puedes modificar las variables de entorno en `docker-compose.yml` para personalizar:

- Credenciales de base de datos
- URLs de servicios internos
- Configuraciones específicas de cada microservicio

### Escalado de Servicios

```bash
# Escalar un servicio específico
docker-compose up -d --scale ms-product-lucho-express=2
```

## 📝 Notas Importantes

1. **Primera ejecución**: Las bases de datos pueden tardar unos minutos en inicializarse
2. **Orden de inicio**: Docker Compose respeta las dependencias automáticamente
3. **Persistencia**: Los datos se guardan en volúmenes Docker
4. **Red**: Todos los servicios se comunican a través de la red `lucho-express-network`

## 🎉 ¡Listo para usar!

Una vez que todos los contenedores estén ejecutándose, puedes acceder a la aplicación en http://localhost:4200 y comenzar a usar LuchoExpress.
