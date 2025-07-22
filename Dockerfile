FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build optimized version
RUN npm run build

# Production stage
FROM nginx:alpine

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    curl \
    bash \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copy built application
COPY --from=builder --chown=appuser:appgroup /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/security-headers.conf /etc/nginx/conf.d/security-headers.conf

# Copy startup script
COPY docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Set security configurations
RUN chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    chown -R appuser:appgroup /etc/nginx/conf.d

# Create directories with proper permissions
RUN mkdir -p /tmp/nginx/client-temp && \
    mkdir -p /tmp/nginx/proxy-temp && \
    mkdir -p /tmp/nginx/fastcgi-temp && \
    mkdir -p /tmp/nginx/uwsgi-temp && \
    mkdir -p /tmp/nginx/scgi-temp && \
    chown -R appuser:appgroup /tmp/nginx

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV NGINX_PORT=8080
ENV SECURITY_HEADERS=true
ENV COMPRESSION=true

# Labels for better container management
LABEL maintainer="bharathk9339@gmail.com"
LABEL version="2.0.0"
LABEL description="Advanced Digital Footprint Eraser - Enterprise Security Application"
LABEL org.opencontainers.image.title="Advanced Digital Footprint Eraser"
LABEL org.opencontainers.image.description="Military-grade digital privacy and security solution"
LABEL org.opencontainers.image.version="2.0.0"
LABEL org.opencontainers.image.vendor="Digital Security Solutions"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/bharathk2498/digital-footprint-eraser"

# Start application
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]