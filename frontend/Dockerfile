# Multi-stage build for frontend
FROM node:18-alpine AS builder

# Set locale environment variables
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM nginx:alpine

# Set locale environment variables for runtime
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Copy built files from builder stage
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (nginx default)
EXPOSE 80

# Nginx runs in the foreground by default in the official image