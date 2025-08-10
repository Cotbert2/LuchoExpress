#!/bin/bash

# Script para etiquetar y subir las imágenes exactas que tienes
set -e

DOCKER_USERNAME="luissagx"
VERSION="v2"

echo "🏷️ Etiquetando y subiendo imágenes a Docker Hub..."
echo "👤 Usuario: $DOCKER_USERNAME"
echo "🏷️ Versión: $VERSION"
echo ""

echo "🚀 Etiquetando y subiendo imágenes..."

# Auth Service
echo "🔐 Auth Service..."
docker tag ms-auth-lucho-express:latest $DOCKER_USERNAME/ms-auth-lucho-express:$VERSION
docker push $DOCKER_USERNAME/ms-auth-lucho-express:$VERSION

# Product Service
echo "📦 Product Service..."
docker tag ms-product-lucho-express:latest $DOCKER_USERNAME/ms-product-lucho-express:$VERSION
docker push $DOCKER_USERNAME/ms-product-lucho-express:$VERSION

# Customer Service
echo "👤 Customer Service..."
docker tag ms-customer-lucho-express:latest $DOCKER_USERNAME/ms-customer-lucho-express:$VERSION
docker push $DOCKER_USERNAME/ms-customer-lucho-express:$VERSION

# Orders Service
echo "📋 Orders Service..."
docker tag ms-orders-lucho-express:latest $DOCKER_USERNAME/ms-orders-lucho-express:$VERSION
docker push $DOCKER_USERNAME/ms-orders-lucho-express:$VERSION

# Tracking Service
echo "📍 Tracking Service..."
docker tag ms-tracking-lucho-express:latest $DOCKER_USERNAME/ms-tracking-lucho-express:$VERSION
docker push $DOCKER_USERNAME/ms-tracking-lucho-express:$VERSION

# API Gateway
echo "🚪 API Gateway..."
docker tag api-gateway-lucho-express:latest $DOCKER_USERNAME/api-gateway-lucho-express:$VERSION
docker push $DOCKER_USERNAME/api-gateway-lucho-express:$VERSION

# Frontend
echo "🎨 Frontend..."
docker tag frontend-lucho-express:latest $DOCKER_USERNAME/frontend-lucho-express:$VERSION
docker push $DOCKER_USERNAME/frontend-lucho-express:$VERSION

echo ""
echo "✅ ¡Todas las imágenes han sido etiquetadas y subidas exitosamente!"
echo ""
echo "🐳 Imágenes en Docker Hub:"
echo "  - $DOCKER_USERNAME/ms-auth-lucho-express:$VERSION"
echo "  - $DOCKER_USERNAME/ms-product-lucho-express:$VERSION"
echo "  - $DOCKER_USERNAME/ms-customer-lucho-express:$VERSION"
echo "  - $DOCKER_USERNAME/ms-orders-lucho-express:$VERSION"
echo "  - $DOCKER_USERNAME/ms-tracking-lucho-express:$VERSION"
echo "  - $DOCKER_USERNAME/api-gateway-lucho-express:$VERSION"
echo "  - $DOCKER_USERNAME/frontend-lucho-express:$VERSION"
echo ""
echo "🎯 Ahora cualquier persona puede ejecutar:"
echo "   docker-compose up -d"
