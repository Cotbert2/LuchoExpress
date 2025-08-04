#!/bin/bash

# This script is used to manage Docker containers for the application.

docker run --name customer-postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=customers_db \
  -p 5432:5432 \
  -d postgres:latest



docker run --name auth-postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=auth_db \
  -p 5433:5432 \
  -d postgres:latest


# Container for products microservice

docker run --name lucho-express-mysql \
  -e MYSQL_DATABASE=product_db \
  -e MYSQL_USER=admin \
  -e MYSQL_PASSWORD=admin \
  -e MYSQL_ROOT_PASSWORD=admin \
  -p 3306:3306 \
  -d mysql:8

# Container for tracking microservice
docker run --name redis-tracking \
  -p 6379:6379 \
  -d redis:7-alpine


docker start customer-postgres auth-postgres lucho-express-mysql redis-tracking dd24c59ed658