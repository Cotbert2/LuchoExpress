#!/bin/bash

# Container for products
docker run --name mysql-products\
  --network lucho-express-network \
  -e MYSQL_DATABASE=product_db \
  -e MYSQL_USER=admin \
  -e MYSQL_PASSWORD=admin \
  -e MYSQL_ROOT_PASSWORD=admin \
  -p 3306:3306 \
  -d mysql


docker run --name ms-product-lucho-express \
  -p 8085:8085 \
  --network lucho-express-network \
  -e DB_HOST=mysql-products:3306 \
  -d ms-product-lucho-express


#Container for auth microservice

docker run --name ms-auth-lucho-express \
  -p 8081:8081 \
  --network lucho-express-network \
  -e DB_HOST=postgres-auth \
  -e DB_PORT=5432 \
  -d ms-auth-lucho-express


docker run --name postgres-auth \
  --network lucho-express-network \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=auth_db \
  -p 5433:5432 \
  -d postgres:latest


#Container for customer microservice

docker run --name ms-customer-lucho-express \
  -p 8082:8082 \
  --network lucho-express-network \
  -e DB_HOST=postgres-customers \
  -e DB_PORT=5432 \
  -d ms-customer-lucho-express

docker run --name postgres-customers \
  --network lucho-express-network \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=customers_db \
  -p 5432:5432 \
  -d postgres:latest

# Container for orders microservice
docker run --name ms-orders-lucho-express \
  -p 8084:8084 \
  --network lucho-express-network \
  -e DB_HOST=order-mysql \
  -e DB_PORT=3306 \
  -e PRODUCT_SERVICE_URL=http://ms-product-lucho-express:8085 \
  -e CUSTOMER_SERVICE_URL=http://ms-customer-lucho-express:8082 \
  -e Tracking_URL=http://ms-tracking-lucho-express:8086 \
  -d ms-orders-lucho-express

docker run --name order-mysql \
  --network lucho-express-network \
  -e MYSQL_DATABASE=orders_db \
  -e MYSQL_USER=admin \
  -e MYSQL_PASSWORD=admin \
  -e MYSQL_ROOT_PASSWORD=admin \
  -p 3307:3306 \
  -d mysql

# Container for tracking microservice
docker run --name ms-tracking-lucho-express \
  -p 8086:8086 \
  --network lucho-express-network \
  -e REDIS_HOST=redis-tracking-service \
  -e REDIS_PORT=6379 \
  -e ORDER_SERVICE_URL=http://ms-orders-lucho-express:8084 \
  -e CUSTOMER_SERVICE_URL=http://ms-customer-lucho-express:8082 \
  -d ms-tracking-lucho-express

docker run --name redis-tracking-service \
  --network lucho-express-network \
  -p 6379:6379 \
  -d redis:7-alpine

#Container for API Gateway
docker run --name api-gateway-lucho-express \
  -p 8080:8080 \
  --network lucho-express-network \
  -d api-gateway-lucho-express


#network for all containers
docker network create lucho-express-network

#container for frontend
docker run --name frontend-lucho-express \
  -p 4200:80 \
  -d frontend-lucho-express

docker tag ms-auth-lucho-express cotbert2/ms-auth-lucho-express:v1
docker tag ms-product-lucho-express cotbert2/ms-product-lucho-express:v1
docker tag ms-customer-lucho-express cotbert2/ms-customer-lucho-express:v1
docker tag ms-orders-lucho-express cotbert2/ms-orders-lucho-express:v1
docker tag ms-tracking-lucho-express cotbert2/ms-tracking-lucho-express:v1
docker tag api-gateway-lucho-express cotbert2/api-gateway-lucho-express:v2
docker tag frontend-lucho-express cotbert2/frontend-lucho-express:v1

docker push cotbert2/ms-auth-lucho-express:v1
docker push cotbert2/ms-product-lucho-express:v1
docker push cotbert2/ms-customer-lucho-express:v1
docker push cotbert2/ms-orders-lucho-express:v1
docker push cotbert2/ms-tracking-lucho-express:v1
docker push cotbert2/api-gateway-lucho-express:v1
docker push cotbert2/frontend-lucho-express:v1