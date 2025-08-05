# Optimized Dockerfile - assumes the project is already built
FROM nginx:alpine

# Copy built files from host (dist must exist before building the image)
COPY dist/frontend/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 4200
EXPOSE 4200

# Nginx runs in the foreground by default in the official image