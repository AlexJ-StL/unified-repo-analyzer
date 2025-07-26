# Deployment Guide

This guide covers the deployment and production setup of the Unified Repository Analyzer.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [Production Considerations](#production-considerations)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Operating System**: Linux, macOS, or Windows
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **Docker**: Version 20.0.0 or higher (for containerized deployment)
- **Docker Compose**: Version 2.0.0 or higher
- **Memory**: Minimum 2GB RAM, recommended 4GB+
- **Storage**: Minimum 10GB free space for application and data

### Network Requirements

- **Port 3000**: Backend API server
- **Port 80**: Frontend web application (or custom port)
- **Port 9090**: Metrics endpoint (optional)
- **Outbound HTTPS**: Access to LLM provider APIs (Claude, Gemini, OpenRouter)

## Environment Configuration

### 1. Create Environment File

Copy the example environment file and configure it for your deployment:

```bash
cp packages/backend/.env.example packages/backend/.env
```

### 2. Required Configuration

Edit `packages/backend/.env` with your specific configuration:

```env
# Server configuration
NODE_ENV=production
PORT=3000
CORS_ORIGIN=http://your-domain.com

# Security (REQUIRED for production)
JWT_SECRET=your-secure-jwt-secret-key-32-chars-min
SESSION_SECRET=your-secure-session-secret-32-chars-min
ENCRYPTION_KEY=your-32-character-encryption-key-here

# LLM Provider API Keys (at least one required)
CLAUDE_API_KEY=your_claude_api_key
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# Storage paths (adjust for your system)
DATA_DIR=/app/data
CACHE_DIR=/app/data/cache
INDEX_DIR=/app/data/index
LOG_DIR=/app/logs
BACKUP_DIR=/app/backups

# Performance tuning
CACHE_TTL=7200
CACHE_MAX_SIZE=5000
MAX_FILE_SIZE=10485760
MAX_FILES_PER_REPO=10000

# Monitoring
LOG_LEVEL=warn
ENABLE_METRICS=true

# Backup configuration
BACKUP_ENABLED=true
BACKUP_INTERVAL=86400000
BACKUP_RETENTION_DAYS=30
```

### 3. Security Considerations

**Critical**: Never use default or example values in production!

- Generate secure random values for `JWT_SECRET`, `SESSION_SECRET`, and `ENCRYPTION_KEY`
- Use environment variables or secrets management for sensitive values
- Restrict `CORS_ORIGIN` to your actual domain
- Enable HTTPS in production

## Docker Deployment

### Quick Start

1. **Clone and configure**:
   ```bash
   git clone <repository-url>
   cd unified-repo-analyzer
   cp packages/backend/.env.example packages/backend/.env
   # Edit .env with your configuration
   ```

2. **Deploy using script**:
   ```bash
   # Linux/macOS
   ./scripts/deploy.sh

   # Windows
   .\scripts\deploy.ps1
   ```

3. **Verify deployment**:
   ```bash
   curl http://localhost:3000/health
   curl http://localhost/
   ```

### Manual Docker Deployment

1. **Build and start services**:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

2. **Check service status**:
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

3. **Stop services**:
   ```bash
   docker-compose down
   ```

### Docker Compose Configuration

The `docker-compose.yml` file includes:

- **Backend service**: Node.js API server with health checks
- **Frontend service**: Nginx-served React application
- **Persistent volumes**: Data, logs, and backup storage
- **Network isolation**: Internal communication between services
- **Health checks**: Automatic service monitoring

## Manual Deployment

### 1. Build Application

```bash
# Install dependencies
npm ci

# Run tests
npm run test

# Build for production
npm run build:prod
```

### 2. Deploy Backend

```bash
cd packages/backend

# Install production dependencies only
npm ci --only=production

# Start the server
NODE_ENV=production npm start
```

### 3. Deploy Frontend

```bash
cd packages/frontend

# Build for production
npm run build:prod

# Serve with your web server (nginx, apache, etc.)
# Point document root to: packages/frontend/dist
```

### 4. Configure Web Server

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/unified-repo-analyzer/packages/frontend/dist;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Production Considerations

### Performance Optimization

1. **Resource Limits**:
   - Set appropriate memory limits for Node.js processes
   - Configure file size limits based on your repositories
   - Tune cache settings for your usage patterns

2. **Scaling**:
   - Use a reverse proxy (nginx, HAProxy) for load balancing
   - Consider horizontal scaling for high-traffic deployments
   - Implement Redis for shared caching in multi-instance setups

3. **Database Optimization**:
   - Regular index maintenance and cleanup
   - Monitor disk usage and implement rotation
   - Consider external storage for large repositories

### Security Hardening

1. **Network Security**:
   - Use HTTPS/TLS for all communications
   - Implement proper firewall rules
   - Restrict access to internal endpoints

2. **Application Security**:
   - Regular security updates for dependencies
   - Input validation and sanitization
   - Rate limiting and DDoS protection

3. **Data Protection**:
   - Encrypt sensitive data at rest
   - Secure backup storage
   - Implement access controls and audit logging

## Monitoring and Logging

### Health Checks

The application provides several health check endpoints:

- `GET /health` - Overall application health
- `GET /health/ready` - Readiness check (Kubernetes)
- `GET /health/live` - Liveness check (Kubernetes)

### Metrics

Access metrics at:

- `GET /metrics` - JSON format metrics
- `GET /metrics/prometheus` - Prometheus format

Key metrics include:
- Request count and response times
- Analysis success/failure rates
- Memory and CPU usage
- Active connections

### Log Management

Logs are written to:
- `logs/combined.log` - All application logs
- `logs/error.log` - Error logs only
- `logs/exceptions.log` - Uncaught exceptions
- `logs/rejections.log` - Unhandled promise rejections

Configure log rotation and centralized logging for production.

## Backup and Recovery

### Automated Backups

The application includes automated backup functionality:

- **Schedule**: Configurable interval (default: daily)
- **Retention**: Configurable retention period (default: 30 days)
- **Content**: Repository index, cache, and configuration data
- **Format**: Compressed tar archives with metadata

### Backup Management

Use the backup API endpoints:

```bash
# Get backup status
curl http://localhost:3000/api/backup/status

# List all backups
curl http://localhost:3000/api/backup/list

# Create manual backup
curl -X POST http://localhost:3000/api/backup/create \
  -H "Content-Type: application/json" \
  -d '{"description": "Manual backup before update"}'

# Restore from backup
curl -X POST http://localhost:3000/api/backup/restore/backup-2024-01-15T10-30-00-000Z.tar.gz

# Delete old backup
curl -X DELETE http://localhost:3000/api/backup/backup-2024-01-01T00-00-00-000Z.tar.gz
```

### Manual Backup

For manual backups, copy these directories:

```bash
# Create backup directory
mkdir -p backups/manual-$(date +%Y%m%d)

# Copy data directories
cp -r data/ backups/manual-$(date +%Y%m%d)/
cp -r logs/ backups/manual-$(date +%Y%m%d)/
cp packages/backend/.env backups/manual-$(date +%Y%m%d)/
```

### Recovery Procedures

1. **Stop the application**:
   ```bash
   docker-compose down
   # or kill the Node.js process
   ```

2. **Restore data**:
   ```bash
   # Using backup service
   curl -X POST http://localhost:3000/api/backup/restore/backup-filename.tar.gz

   # Or manually
   rm -rf data/
   tar -xzf backup-filename.tar.gz
   ```

3. **Restart the application**:
   ```bash
   docker-compose up -d
   # or restart the Node.js process
   ```

## Troubleshooting

### Common Issues

1. **Application won't start**:
   - Check environment configuration
   - Verify all required secrets are set
   - Check file permissions on data directories
   - Review logs for specific error messages

2. **High memory usage**:
   - Reduce `CACHE_MAX_SIZE` setting
   - Lower `MAX_FILES_PER_REPO` limit
   - Implement more aggressive cache cleanup

3. **Analysis failures**:
   - Verify LLM provider API keys
   - Check network connectivity to provider APIs
   - Review rate limiting settings
   - Monitor API quota usage

4. **Performance issues**:
   - Check system resources (CPU, memory, disk)
   - Review cache hit rates
   - Optimize file processing limits
   - Consider scaling horizontally

### Debug Mode

Enable debug logging:

```env
LOG_LEVEL=debug
NODE_ENV=development
```

### Support

For additional support:

1. Check the application logs
2. Review health check endpoints
3. Monitor system metrics
4. Consult the API documentation
5. Create an issue in the project repository

## Kubernetes Deployment

For Kubernetes deployment, see the example manifests in the `k8s/` directory:

- `deployment.yaml` - Application deployment
- `service.yaml` - Service configuration
- `ingress.yaml` - Ingress configuration
- `configmap.yaml` - Configuration management
- `secret.yaml` - Secrets management

Deploy with:

```bash
kubectl apply -f k8s/
```