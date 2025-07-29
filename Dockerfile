# Digital Footprint Eraser - Enterprise Security Dockerfile
# Multi-stage build with military-grade security hardening

# Stage 1: Security scanning and validation
FROM aquasec/trivy:latest as security-scanner
WORKDIR /scanner
COPY package*.json ./
RUN trivy fs --security-checks vuln,secret,config .

# Stage 2: Build stage with security tools
FROM node:18-alpine as builder
LABEL maintainer="Bharath Kumar Byru <bharathk9339@gmail.com>"
LABEL version="1.0.0"
LABEL description="Digital Footprint Eraser - Enterprise Security Build"
LABEL security.level="military-grade"
LABEL compliance="FISMA,HIPAA,SOX,GDPR"

# Security: Create non-root user
RUN addgroup -g 10001 -S dfegroup && \
    adduser -u 10001 -S dfeuser -G dfegroup

# Security: Install security tools and dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates \
    openssl \
    && rm -rf /var/cache/apk/*

# Security: Set working directory with proper permissions
WORKDIR /app
RUN chown -R dfeuser:dfegroup /app

# Copy package files and install dependencies
COPY --chown=dfeuser:dfegroup package*.json ./
USER dfeuser
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Copy application files
COPY --chown=dfeuser:dfegroup . .

# Security: Remove sensitive files and set permissions
RUN rm -rf .git .env* *.log tests/ && \
    find . -type f -exec chmod 644 {} \; && \
    find . -type d -exec chmod 755 {} \;

# Stage 3: Security hardening
FROM alpine:3.18 as hardened-base
LABEL security.hardened="true"
LABEL security.quantum-ready="true"

# Install security packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    nginx \
    dumb-init \
    curl \
    ca-certificates \
    openssl \
    fail2ban \
    rkhunter \
    && rm -rf /var/cache/apk/*

# Security: Create non-root user
RUN addgroup -g 10001 -S dfegroup && \
    adduser -u 10001 -S dfeuser -G dfegroup

# Security: Configure nginx with quantum-safe settings
COPY --chown=root:root configs/nginx-quantum.conf /etc/nginx/nginx.conf
COPY --chown=root:root configs/security-headers.conf /etc/nginx/conf.d/security-headers.conf

# Security: Set up fail2ban
COPY --chown=root:root configs/fail2ban-jail.conf /etc/fail2ban/jail.conf

# Stage 4: Production runtime
FROM hardened-base as production

# Security: Set metadata
LABEL org.opencontainers.image.title="Digital Footprint Eraser Enterprise"
LABEL org.opencontainers.image.description="Military-grade digital privacy protection"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Digital Footprint Eraser"
LABEL org.opencontainers.image.licenses="Enterprise"
LABEL security.scan-required="true"

# Copy application from builder stage
COPY --from=builder --chown=dfeuser:dfegroup /app /app

# Security: Configure web root
RUN mkdir -p /var/www/html && \
    chown -R dfeuser:dfegroup /var/www/html

# Copy web files to nginx document root
COPY --from=builder --chown=nginx:nginx /app/index.html /var/www/html/
COPY --from=builder --chown=nginx:nginx /app/advanced-security-enhanced.html /var/www/html/
COPY --from=builder --chown=nginx:nginx /app/advanced-security-complete.js /var/www/html/
COPY --from=builder --chown=nginx:nginx /app/docs /var/www/html/docs/

# Security: Set proper file permissions
RUN find /var/www/html -type f -exec chmod 644 {} \; && \
    find /var/www/html -type d -exec chmod 755 {} \; && \
    chown -R nginx:nginx /var/www/html

# Security: Create necessary directories with proper permissions
RUN mkdir -p /var/log/nginx /var/log/dfe /tmp/nginx && \
    chown -R nginx:nginx /var/log/nginx /tmp/nginx && \
    chown -R dfeuser:dfegroup /var/log/dfe && \
    chmod 755 /var/log/nginx /var/log/dfe

# Security: Set up health check script
COPY --chown=dfeuser:dfegroup scripts/healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# Security: Expose only necessary port
EXPOSE 80 443

# Security: Use dumb-init as PID 1
ENTRYPOINT ["dumb-init", "--"]

# Security: Start with non-root user
USER dfeuser

# Security: Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# Security: Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

# Security: Add OCI annotations
LABEL org.opencontainers.image.created="2025-07-29T22:50:00Z"
LABEL org.opencontainers.image.revision="main"
LABEL org.opencontainers.image.source="https://github.com/bharathk2498/digital-footprint-eraser"
LABEL org.opencontainers.image.url="https://digital-footprint-eraser.com"
LABEL org.opencontainers.image.documentation="https://github.com/bharathk2498/digital-footprint-eraser/blob/main/docs/"