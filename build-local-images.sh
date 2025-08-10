#!/bin/bash

# Script para construir todas las imágenes Docker localmente
set -e

echo "🏗️ Construyendo todas las imágenes Docker localmente..."

# Crear network si no existe
echo "📡 Creando network Docker..."
docker network create lucho-express-network 2>/dev/null || echo "Network ya existe"

# Construir Frontend
echo "🎨 Construyendo imagen del Frontend..."
cd frontend
docker build -t frontend-lucho-express:local .
cd ..

# Construir API Gateway
echo "🚪 Construyendo imagen del API Gateway..."
cd backend/api-gateway
docker build -t api-gateway-lucho-express:local .
cd ../..

# Construir Microservicio de Auth
echo "🔐 Construyendo imagen del Microservicio de Auth..."
cd backend/ms-auth
docker build -t ms-auth-lucho-express:local .
cd ../..

# Construir Microservicio de Products
echo "📦 Construyendo imagen del Microservicio de Products..."
cd backend/ms-products
docker build -t ms-product-lucho-express:local .
cd ../..

# Construir Microservicio de Customer
echo "👤 Construyendo imagen del Microservicio de Customer..."
cd backend/ms-customer
docker build -t ms-customer-lucho-express:local .
cd ../..

# Construir Microservicio de Orders
echo "📋 Construyendo imagen del Microservicio de Orders..."
cd backend/ms-order
docker build -t ms-orders-lucho-express:local .
cd ../..

# Construir Microservicio de Tracking
echo "📍 Construyendo imagen del Microservicio de Tracking..."
cd backend/ms-tracking-orders
docker build -t ms-tracking-lucho-express:local .
cd ../..

echo "✅ Todas las imágenes construidas exitosamente!"
echo ""
echo "🎯 Imágenes creadas:"
echo "  - frontend-lucho-express:local"
echo "  - api-gateway-lucho-express:local" 
echo "  - ms-auth-lucho-express:local"
echo "  - ms-product-lucho-express:local"
echo "  - ms-customer-lucho-express:local"
echo "  - ms-orders-lucho-express:local"
echo "  - ms-tracking-lucho-express:local"
echo ""
echo "🚀 Para ejecutar los contenedores, usa: ./run-local-containers.sh"
