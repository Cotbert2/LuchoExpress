#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando Test del Flujo de Órdenes - LuchoExpress${NC}"
echo "=================================================="

# URLs base
AUTH_URL="http://localhost:8080"
CUSTOMER_URL="http://localhost:8082"
PRODUCT_URL="http://localhost:8085"
ORDER_URL="http://localhost:8084"
TRACKING_URL="http://localhost:8085"

# Paso 1: Registrar usuario
echo -e "\n${YELLOW}1. Registrando usuario...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST $AUTH_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "cliente_test_'$(date +%s)'",
    "password": "password123",
    "email": "cliente'$(date +%s)'@test.com"
  }')

echo "Respuesta del registro: $REGISTER_RESPONSE"
USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "User ID: $USER_ID"

# Paso 2: Obtener token
echo -e "\n${YELLOW}2. Obteniendo token JWT...${NC}"
USERNAME=$(echo $REGISTER_RESPONSE | grep -o '"username":"[^"]*"' | cut -d'"' -f4)

TOKEN_RESPONSE=$(curl -s -X POST $AUTH_URL/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "'$USERNAME'",
    "password": "password123"
  }')

TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "Token obtenido: ${TOKEN:0:50}..."

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Error: No se pudo obtener el token${NC}"
  exit 1
fi

# Paso 3: Crear cliente
echo -e "\n${YELLOW}3. Creando cliente...${NC}"
CUSTOMER_RESPONSE=$(curl -s -X POST $CUSTOMER_URL/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": "'$USER_ID'",
    "documentId": "'$(date +%s)'",
    "name": "Juan",
    "lastName": "Pérez",
    "email": "cliente'$(date +%s)'@test.com",
    "phone": "+51999999999",
    "address": "Av. Test 123, Lima, Perú"
  }')

echo "Respuesta del cliente: $CUSTOMER_RESPONSE"
CUSTOMER_ID=$(echo $CUSTOMER_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Customer ID: $CUSTOMER_ID"

# Paso 4: Listar productos existentes
echo -e "\n${YELLOW}4. Listando productos existentes...${NC}"
PRODUCTS_RESPONSE=$(curl -s -X GET $PRODUCT_URL/api/products \
  -H "Authorization: Bearer $TOKEN")

echo "Productos disponibles: $PRODUCTS_RESPONSE"

# Extraer el primer producto ID
PRODUCT_ID=$(echo $PRODUCTS_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Usando Product ID: $PRODUCT_ID"

if [ -z "$PRODUCT_ID" ]; then
  echo -e "${RED}❌ Error: No hay productos disponibles. Crea productos primero como ADMIN.${NC}"
  exit 1
fi

# Paso 5: Crear orden
echo -e "\n${YELLOW}5. Creando orden...${NC}"
ORDER_RESPONSE=$(curl -s -X POST $ORDER_URL/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "customerId": "'$CUSTOMER_ID'",
    "products": [
      {
        "productId": "'$PRODUCT_ID'",
        "quantity": 2
      }
    ],
    "deliveryAddress": "Av. Test 123, Lima, Perú",
    "estimatedDeliveryDate": "2024-12-31"
  }')

echo "Respuesta de la orden: $ORDER_RESPONSE"
ORDER_ID=$(echo $ORDER_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Order ID: $ORDER_ID"

if [ -z "$ORDER_ID" ]; then
  echo -e "${RED}❌ Error: No se pudo crear la orden${NC}"
  echo "Respuesta completa: $ORDER_RESPONSE"
  exit 1
fi

# Paso 6: Verificar orden
echo -e "\n${YELLOW}6. Verificando orden creada...${NC}"
GET_ORDER_RESPONSE=$(curl -s -X GET $ORDER_URL/api/orders/$ORDER_ID \
  -H "Authorization: Bearer $TOKEN")

echo "Orden obtenida: $GET_ORDER_RESPONSE"

# Paso 7: Listar mis órdenes
echo -e "\n${YELLOW}7. Listando mis órdenes...${NC}"
MY_ORDERS_RESPONSE=$(curl -s -X GET $ORDER_URL/api/orders/me \
  -H "Authorization: Bearer $TOKEN")

echo "Mis órdenes: $MY_ORDERS_RESPONSE"

# Paso 8: Verificar tracking (opcional)
echo -e "\n${YELLOW}8. Verificando tracking...${NC}"
TRACKING_RESPONSE=$(curl -s -X GET $TRACKING_URL/api/tracking/$ORDER_ID \
  -H "Authorization: Bearer $TOKEN")

echo "Tracking: $TRACKING_RESPONSE"

echo -e "\n${GREEN}✅ Test completado exitosamente!${NC}"
echo "=================================================="
echo "Resumen:"
echo "- Usuario: $USERNAME"
echo "- Customer ID: $CUSTOMER_ID"
echo "- Product ID: $PRODUCT_ID"
echo "- Order ID: $ORDER_ID"
echo "- Token: ${TOKEN:0:50}..."


curl -v -X POST http://localhost:8084/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NEW_TOKEN" \
  -d '{
    "customerId": "b9bde1d2-c5d3-4eb5-a690-e3a415299e48",
    "products": [
      {
        "productId": "0fbe9789-eac3-42af-ad43-00fcb016a323",
        "quantity": 2
      }
    ],
    "deliveryAddress": "123 Main St, City, Country"
  }'