#!/bin/bash

# This script is used to manage Docker containers for the application.

# Container for auth microservice
docker run --name customer-postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=customers_db \
  -p 5432:5432 \
  -d postgres:latest



# Container for customer microservice
docker run --name customer-postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=admin_db \
  -p 5432:5432 \
  -d postgres:latest


# Container for 
