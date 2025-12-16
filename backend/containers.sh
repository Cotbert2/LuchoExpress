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
  -d cotbert2/ms-products-lucho-express:ps


#Container for auth microservice

docker run --name ms-auth-lucho-express \
  -p 8081:8081 \
  --network lucho-express-network \
  -e DB_HOST=postgres-auth \
  -e DB_PORT=5432 \
  -d cotbert2/ms-auth-lucho-express:ps


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
  -d cotbert2/ms-customer-lucho-express:ps

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
  -d cotbert2/ms-order-lucho-express:ps

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
  -d cotbert2/ms-tracking-lucho-express:ps

docker run --name redis-tracking-service \
  --network lucho-express-network \
  -p 6379:6379 \
  -d redis:7-alpine


#Container for Chat
docker run -d \
  --name ms-chat \
  --network lucho-express-network \
  -e DB_HOST=postgres-chat \
  -e DB_PORT=5432 \
  -e DB_USER=admin \
  -e DB_PASSWORD=admin \
  -e DB_DATABASE=chat_db \
  -e RABBITMQ_URL=amqp://rabbitmq2:5672 \
  -e RABBITMQ_QUEUE=chat_queue \
  -e NODE_ENV=development \
  -p 3000:3000 \
  cotbert2/ms-chat-lucho-express:ps



#Container for API Gateway
docker run --name api-gateway-lucho-express \
  -p 8080:8080 \
  --network lucho-express-network \
  -d cotbert2/api-gateway:ps


#network for all containers
docker network create lucho-express-network

#container for frontend
docker run --name frontend-lucho-express \
  -p 4200:80 \
  -d  cotbert2/lucho-express-frontend:ps

