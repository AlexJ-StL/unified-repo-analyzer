# Unified Repository Analyzer - Deployment Guide

This document provides comprehensive instructions for deploying the Unified Repository Analyzer in production environments.

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Bun 1.0+ (recommended) or Node.js 18+ (for local development)
- At least 2GB RAM and 10GB disk space

### 1. Clone and Configure
```bash
git clone <repository-url>
cd unified-repo-analyzer
cp packages/backend/.env.example packages/backend/.env
```

### 2. Configure Environment
Edit `packages/backend/.env` with your settings:
```env
NODE_ENV=production
JWT_SECRET=your-secure-32-character-secret
SESSION_SECRET=your-secure-32-character-secret
ENCRYPTION_KEY=your-32-character-encryption-key
CLAUDE_API_KEY=your_claude_api_key
```

### 3. Deploy with Docker
```bash
# Using Bun (recommended)
bun run deploy:prod

# Or using scripts
# Linux/macOS
./scripts/deploy.sh

# Windows
.\scripts\deploy.ps1
```

### 4. Verify Deployment
```bash
curl http://localhost:3000/health
curl http://localhost/
```

## Architecture Overview

The application consists of:

- **Backend API** (Bun/Express) - Port 3000
- **Frontend Web App** (React/Nginx) - Port 80
- **Persistent Storage** - Data, logs, backups
- **Health Monitoring** - Built-in health checks
- **Metrics Collection** - Performance monitoring
- **Backup System** - Automated data backup

### Development Toolchain

The project uses modern tooling for improved performance and developer experience:

- **Runtime**: Bun for native TypeScript execution and faster package management
- **Code Quality**: Biome for unified linting and formatting (replaces ESLint + Prettier)
- **Testing**: Bun's built-in test runner for faster test execution
- **Configuration**: All config files migrated to TypeScript for better type safety
- **Build System**: Bun's native bundler with TypeScript support

## Deployment Options

### 1. Docker Compose (Recommended)

**Pros:**
- Easy setup and management
- Isolated environment
- Built-in networking
- Persistent storage
- Health checks

**Use Case:** Single server deployments, development, testing

```bash
docker-compose up -d
```

### 2. Kubernetes

**Pros:**
- High availability
- Auto-scaling
- Rolling updates
- Service discovery
- Load balancing

**Use Case:** Production clusters, high-traffic deployments

```bash
kubectl apply -f k8s/
```

### 3. Manual Deployment

**Pros:**
- Full control
- Custom configuration
- Integration with existing infrastructure

**Use Case:** Custom environments, specific requirements

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## Configuration

### Environment Variables

| Variable             | Description         | Default       | Required   |
| -------------------- | ------------------- | ------------- | ---------- |
| `NODE_ENV`           | Environment mode    | `development` | No         |
| `PORT`               | Backend server port | `3000`        | No         |
| `JWT_SECRET`         | JWT signing secret  | -             | Yes (prod) |
| `SESSION_SECRET`     | Session secret      | -             | Yes (prod) |
| `ENCRYPTION_KEY`     | Data encryption key | -             | Yes (prod) |
| `CLAUDE_API_KEY`     | Claude API key      | -             | No         |
| `GEMINI_API_KEY`     | Gemini API key      | -             | No         |
| `OPENROUTER_API_KEY` | OpenRouter API key  | -             | No         |

### Storage Configuration

| Variable     | Description             | Default           |
| ------------ | ----------------------- | ----------------- |
| `DATA_DIR`   | Data storage directory  | `/app/data`       |
| `CACHE_DIR`  | Cache directory         | `/app/data/cache` |
| `INDEX_DIR`  | Index storage directory | `/app/data/index` |
| `LOG_DIR`    | Log directory           | `/app/logs`       |
| `BACKUP_DIR` | Backup directory        | `/app/backups`    |

### Performance Tuning

| Variable             | Description                  | Default    |
| -------------------- | ---------------------------- | ---------- |
| `CACHE_TTL`          | Cache time-to-live (seconds) | `3600`     |
| `CACHE_MAX_SIZE`     | Maximum cache entries        | `1000`     |
| `MAX_FILE_SIZE`      | Maximum file size (bytes)    | `10485760` |
| `MAX_FILES_PER_REPO` | Maximum files per repository | `10000`    |
| `MAX_ANALYSIS_TIME`  | Analysis timeout (ms)        | `300000`   |

## Security

### Production Security Checklist

- [ ] Change all default secrets
- [ ] Use HTTPS/TLS encryption
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerting
- [ ] Regular security updates
- [ ] Backup encryption
- [ ] Access control implementation

### Secret Management

**Docker Compose:**
```yaml
services:
  backend:
    environment:
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
    secrets:
      - jwt_secret
secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

**Kubernetes:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: repo-analyzer-secrets
data:
  JWT_SECRET: <base64-encoded-secret>
```

## Monitoring

### Health Checks

| Endpoint        | Purpose         | Response |
| --------------- | --------------- | -------- |
| `/health`       | Overall health  | 200/503  |
| `/health/ready` | Readiness check | 200/503  |
| `/health/live`  | Liveness check  | 200/503  |

### Metrics

| Endpoint              | Format     | Purpose                |
| --------------------- | ---------- | ---------------------- |
| `/metrics`            | JSON       | Application metrics    |
| `/metrics/prometheus` | Prometheus | Monitoring integration |

### Key Metrics

- Request count and response times
- Analysis success/failure rates
- Memory and CPU usage
- Cache hit rates
- Active connections
- Repository processing metrics

## Backup and Recovery

### Automated Backups

The system includes automated backup functionality:

```bash
# Check backup status
curl http://localhost:3000/api/backup/status

# Create manual backup
curl -X POST http://localhost:3000/api/backup/create

# List backups
curl http://localhost:3000/api/backup/list

# Restore from backup
curl -X POST http://localhost:3000/api/backup/restore/backup-filename.tar.gz
```

### Backup Configuration

| Variable                | Description              | Default          |
| ----------------------- | ------------------------ | ---------------- |
| `BACKUP_ENABLED`        | Enable automated backups | `true`           |
| `BACKUP_INTERVAL`       | Backup interval (ms)     | `86400000` (24h) |
| `BACKUP_RETENTION_DAYS` | Backup retention period  | `30`             |

## Scaling

### Horizontal Scaling

For high-traffic deployments:

1. **Load Balancer:** Use nginx or HAProxy
2. **Multiple Instances:** Scale backend replicas
3. **Shared Storage:** Use network storage for data
4. **External Cache:** Consider Redis for caching
5. **Database:** External database for index storage

### Kubernetes Scaling

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: repo-analyzer-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: backend
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
```

### Auto-scaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: repo-analyzer-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: repo-analyzer-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Troubleshooting

### Common Issues

1. **Container won't start**
   - Check environment configuration
   - Verify secrets are properly set
   - Check file permissions
   - Review container logs

2. **High memory usage**
   - Reduce cache size settings
   - Lower file processing limits
   - Check for memory leaks
   - Monitor garbage collection

3. **Analysis failures**
   - Verify LLM API keys
   - Check network connectivity
   - Review rate limiting
   - Monitor API quotas

4. **Performance issues**
   - Check system resources
   - Review cache hit rates
   - Optimize processing limits
   - Consider horizontal scaling

### Debug Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check container status
docker-compose ps

# Execute commands in container
docker-compose exec backend sh

# Check resource usage
docker stats

# Kubernetes debugging
kubectl get pods -n repo-analyzer
kubectl logs -f deployment/repo-analyzer-backend -n repo-analyzer
kubectl describe pod <pod-name> -n repo-analyzer
```

### Performance Monitoring

```bash
# System metrics
curl http://localhost:3000/metrics

# Health status
curl http://localhost:3000/health

# Backup status
curl http://localhost:3000/api/backup/status

# Application status
docker-compose ps
```

## Maintenance

### Regular Tasks

1. **Monitor logs** for errors and warnings
2. **Check disk space** for data and backups
3. **Update dependencies** regularly
4. **Review security** configurations
5. **Test backup/restore** procedures
6. **Monitor performance** metrics
7. **Update SSL certificates** (if applicable)

### Update Procedure

1. **Backup current deployment**
2. **Test new version** in staging
3. **Update configuration** if needed
4. **Deploy new version**
5. **Verify functionality**
6. **Monitor for issues**

```bash
# Update with Docker Compose
docker-compose pull
docker-compose up -d

# Update with Kubernetes
kubectl set image deployment/repo-analyzer-backend backend=new-image:tag -n repo-analyzer
kubectl rollout status deployment/repo-analyzer-backend -n repo-analyzer
```

## Support

For additional support:

1. Check application logs
2. Review health endpoints
3. Monitor system metrics
4. Consult troubleshooting guide
5. Create issue in repository

## License

This project is licensed under the MIT License - see the LICENSE file for details.