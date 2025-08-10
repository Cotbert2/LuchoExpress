#!/bin/bash

# Script para ejecutar todos los contenedores locales
set -e

echo "🐳 Iniciando contenedores de LuchoExpress localmente..."

# Crear network si no existe
echo "📡 Creando network Docker..."
docker network create lucho-express-network 2>/dev/null || echo "Network ya existe"

# Limpiar contenedores existentes
echo "🧹 Limpiando contenedores existentes..."
docker rm -f mysql-products postgres-auth postgres-customers order-mysql redis-tracking-service \
    ms-product-lucho-express ms-auth-lucho-express ms-customer-lucho-express \
    ms-orders-lucho-express ms-tracking-lucho-express api-gateway-lucho-express \
    frontend-lucho-express 2>/dev/null || echo "Algunos contenedores no existían"

# Esperar un momento para que se limpien completamente
sleep 2

echo "🗄️ Iniciando bases de datos..."

# Base de datos para productos
docker run --name mysql-products \
  --network lucho-express-network \
  -e MYSQL_DATABASE=product_db \
  -e MYSQL_USER=admin \
  -e MYSQL_PASSWORD=admin \
  -e MYSQL_ROOT_PASSWORD=admin \
  -p 3306:3306 \
  -d mysql:8.0

# Base de datos para auth
docker run --name postgres-auth \
  --network lucho-express-network \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=auth_db \
  -p 5433:5432 \
  -d postgres:latest

# Base de datos para clientes
docker run --name postgres-customers \
  --network lucho-express-network \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=customers_db \
  -p 5432:5432 \
  -d postgres:latest

# Base de datos para pedidos
docker run --name order-mysql \
  --network lucho-express-network \
  -e MYSQL_DATABASE=orders_db \
  -e MYSQL_USER=admin \
  -e MYSQL_PASSWORD=admin \
  -e MYSQL_ROOT_PASSWORD=admin \
  -p 3307:3306 \
  -d mysql:8.0

# Redis para tracking
docker run --name redis-tracking-service \
  --network lucho-express-network \
  -p 6379:6379 \
  -d redis:7-alpine

echo "⏳ Esperando que las bases de datos estén listas..."
sleep 15

echo "🚀 Iniciando microservicios..."

# Microservicio de productos
docker run --name ms-product-lucho-express \
  -p 8085:8085 \
  --network lucho-express-network \
  -e DB_HOST=mysql-products \
  -e DB_PORT=3306 \
  -d ms-product-lucho-express:local

# Microservicio de auth
docker run --name ms-auth-lucho-express \
  -p 8081:8081 \
  --network lucho-express-network \
  -e DB_HOST=postgres-auth \
  -e DB_PORT=5432 \
  -d ms-auth-lucho-express:local

# Microservicio de clientes
docker run --name ms-customer-lucho-express \
  -p 8082:8082 \
  --network lucho-express-network \
  -e DB_HOST=postgres-customers \
  -e DB_PORT=5432 \
  -d ms-customer-lucho-express:local

# Microservicio de pedidos
docker run --name ms-orders-lucho-express \
  -p 8084:8084 \
  --network lucho-express-network \
  -e DB_HOST=order-mysql \
  -e DB_PORT=3306 \
  -e PRODUCT_SERVICE_URL=http://ms-product-lucho-express:8085 \
  -e CUSTOMER_SERVICE_URL=http://ms-customer-lucho-express:8082 \
  -e Tracking_URL=http://ms-tracking-lucho-express:8086 \
  -d ms-orders-lucho-express:local

# Microservicio de tracking
docker run --name ms-tracking-lucho-express \
  -p 8086:8086 \
  --network lucho-express-network \
  -e REDIS_HOST=redis-tracking-service \
  -e REDIS_PORT=6379 \
  -e ORDER_SERVICE_URL=http://ms-orders-lucho-express:8084 \
  -e CUSTOMER_SERVICE_URL=http://ms-customer-lucho-express:8082 \
  -d ms-tracking-lucho-express:local

echo "⏳ Esperando que los microservicios estén listos..."
sleep 10

# API Gateway
docker run --name api-gateway-lucho-express \
  -p 8080:8080 \
  --network lucho-express-network \
  -e AUTH_SERVICE_URL=http://ms-auth-lucho-express:8081 \
  -e PRODUCT_SERVICE_URL=http://ms-product-lucho-express:8085 \
  -e CUSTOMER_SERVICE_URL=http://ms-customer-lucho-express:8082 \
  -e ORDER_SERVICE_URL=http://ms-orders-lucho-express:8084 \
  -e TRACKING_SERVICE_URL=http://ms-tracking-lucho-express:8086 \
  -d api-gateway-lucho-express:local

echo "⏳ Esperando que el API Gateway esté listo..."
sleep 5

# Frontend
docker run --name frontend-lucho-express \
  -p 4200:80 \
  --network lucho-express-network \
  -d frontend-lucho-express:local

echo ""
echo "🎉 ¡Todos los contenedores están ejecutándose!"
echo ""
echo "🌐 URLs disponibles:"
echo "  - Frontend: http://localhost:4200"
echo "  - API Gateway: http://localhost:8080"
echo "  - Auth Service: http://localhost:8081"
echo "  - Customer Service: http://localhost:8082"
echo "  - Order Service: http://localhost:8084"
echo "  - Product Service: http://localhost:8085"
echo "  - Tracking Service: http://localhost:8086"
echo ""
echo "📊 Para monitorear los contenedores:"
echo "  docker ps"
echo ""
echo "📋 Para ver logs de un contenedor:"
echo "  docker logs <container-name>"
echo ""
echo "🛑 Para detener todos los contenedores:"
echo "  ./stop-local-containers.sh"
