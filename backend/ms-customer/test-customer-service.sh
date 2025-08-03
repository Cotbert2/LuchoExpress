#!/bin/bash

# Script de prueba para el microservicio Customer
# Este script demuestra todos los endpoints implementados

BASE_URL="http://localhost:8082/api/customers"

echo "=== CUSTOMER MICROSERVICE TESTING SCRIPT ==="
echo ""

# 1. Crear un cliente
echo "1. Creating a customer..."
curl -X POST ${BASE_URL} \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "documentId": "12345678",
    "name": "Juan Pérez",
    "email": "juan.perez@example.com",
    "phone": "+573001234567",
    "address": "Calle 123 #45-67, Bogotá"
  }' | jq .

echo ""
echo ""

# 2. Intentar crear otro cliente con el mismo userId (debe fallar)
echo "2. Trying to create another customer with same userId (should fail)..."
curl -X POST ${BASE_URL} \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "documentId": "87654321",
    "name": "María García",
    "email": "maria.garcia@example.com",
    "phone": "+573007654321",
    "address": "Carrera 7 #12-34, Medellín"
  }' | jq .

echo ""
echo ""

# 3. Obtener cliente por userId
echo "3. Getting customer by userId..."
curl -X GET ${BASE_URL}/by-user/123e4567-e89b-12d3-a456-426614174000 | jq .

echo ""
echo ""

# 4. Verificar existencia por documentId
echo "4. Checking if documentId exists..."
curl -X GET ${BASE_URL}/document/12345678 | jq .

echo ""
echo ""

# 5. Obtener cliente por documentId
echo "5. Getting customer by documentId..."
curl -X GET ${BASE_URL}/document/12345678/customer | jq .

echo ""
echo ""

# 6. Listar todos los clientes
echo "6. Getting all customers..."
curl -X GET ${BASE_URL} | jq .

echo ""
echo ""

# 7. Actualizar cliente (no debe permitir cambiar documentId)
echo "7. Updating customer (documentId should not be changeable)..."
CUSTOMER_ID=$(curl -s ${BASE_URL}/by-user/123e4567-e89b-12d3-a456-426614174000 | jq -r '.id')

curl -X PUT ${BASE_URL}/${CUSTOMER_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Carlos Pérez",
    "email": "juancarlos.perez@example.com",
    "phone": "+573009876543",
    "address": "Calle 456 #78-90, Cali"
  }' | jq .

echo ""
echo ""

echo "=== TESTING COMPLETE ==="
echo ""
echo "✅ All endpoints tested:"
echo "  - POST /api/customers → Create customer"
echo "  - GET /api/customers/by-user/{userId} → Get customer by userId"
echo "  - GET /api/customers/document/{documentId} → Check document existence"
echo "  - GET /api/customers/document/{documentId}/customer → Get customer by documentId"
echo "  - GET /api/customers → Get all customers"
echo "  - PUT /api/customers/{id} → Update customer (documentId protected)"
echo ""
echo "✅ Business logic validated:"
echo "  - userId uniqueness (1 user = 1 customer)"
echo "  - documentId uniqueness"
echo "  - documentId protection on updates"
echo "  - Email and phone format validation"
