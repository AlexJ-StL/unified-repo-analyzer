# Deployment Guide

This guide covers deploying the Unified Repository Analyzer in various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Manual Deployment](#manual-deployment)
- [Production Considerations](#production-considerations)
- [Monitoring and Logging](#monitoring-and-logging)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: 2 cores
- **Memory**: 4GB RAM
- **Storage**: 10GB available space
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher

#### Recommended Requirements
- **CPU**: 4+ cores
- **Memory**: 8GB+ RAM
- **Storage**: 50GB+ available space (for repository cache)
- **Network**: Stable internet connection for LLM API calls

#### Supported Operating Systems
- Linux (Ubuntu 20.04+, CentOS 8+, RHEL 8+)
- macOS (10.15+)
- Windows (10/11, Windows Server 2019+)

### External Dependencies
- **LLM Provider API Keys**: At least one of:
  - Anthropic Claude API key
  - Google Gemini API key
  - OpenRouter API key
- **Database** (Optional): PostgreSQL or MongoDB for persistent storage
- **Redis** (Optional): For caching and session management

## Environment Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Application Configuration
NODE_ENV=production
PORT=3000
API_PORT=3001

# LLM Provider Configuration
CLAUDE_API_KEY=your_claude_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Database Configuration (Optional)
DATABASE_URL=postgresql://user:password@localhost:5432/repo_analyzer
MONGODB_URL=mongodb://localhost:27017/repo_analyzer

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Security Configuration
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=https://your-domain.com

# File System Configuration
MAX_REPOSITORY_SIZE=10737418240  # 10GB in bytes
CACHE_DIRECTORY=/var/cache/repo-analyzer
TEMP_DIRECTORY=/tmp/repo-analyzer

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=/var/log/repo-analyzer/app.log

# Performance Configuration
MAX_CONCURRENT_ANALYSES=5
REQUEST_TIMEOUT=300000  # 5 minutes
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=900000  # 15 minutes
```

### Configuration Files

#### Backend Configuration (`packages/backend/.env.production`)
```bash
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend-domain.com

# LLM Configuration
DEFAULT_LLM_PROVIDER=claude
LLM_TIMEOUT=60000
MAX_TOKENS_PER_REQUEST=4000

# Analysis Configuration
DEFAULT_ANALYSIS_MODE=standard
MAX_FILES_PER_ANALYSIS=1000
MAX_LINES_PER_FILE=2000

# Security
HELMET_ENABLED=true
RATE_LIMITING_ENABLED=true
```

#### Frontend Configuration (`packages/frontend/.env.production`)
```bash
VITE_API_BASE_URL=https://your-api-domain.com
VITE_WS_URL=wss://your-api-domain.com
VITE_APP_NAME=Unified Repository Analyzer
VITE_APP_VERSION=1.0.0
```

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Clone and prepare the repository:**
```bash
git clone https://github.com/your-org/unified-repo-analyzer.git
cd unified-repo-analyzer
cp .env.example .env
# Edit .env with your configuration
```

2. **Build and start services:**
```bash
npm run docker:build
npm run docker:up
```

3. **Verify deployment:**
```bash
# Check service status
docker-compose ps

# View logs
npm run docker:logs

# Access the application
curl http://localhost:3000/health
```

### Custom Docker Configuration

#### Production Docker Compose
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: packages/frontend/Dockerfile
      target: production
    ports:
      - "80:80"
      - "443:443"
    environment:
      - VITE_API_BASE_URL=https://api.your-domain.com
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs:ro
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: packages/backend/Dockerfile
      target: production
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
      - ./cache:/app/cache
    depends_on:
      - database
      - redis
    restart: unless-stopped

  database:
    image: postgres:15
    environment:
      - POSTGRES_DB=repo_analyzer
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (1.20+)
- kubectl configured
- Helm 3.0+ (optional but recommended)

### Using Helm Chart

1. **Add the Helm repository:**
```bash
helm repo add unified-repo-analyzer https://charts.unified-repo-analyzer.com
helm repo update
```

2. **Create values file (`values.yaml`):**
```yaml
global:
  domain: your-domain.com
  
frontend:
  replicaCount: 2
  image:
    repository: unified-repo-analyzer/frontend
    tag: "1.0.0"
  service:
    type: ClusterIP
    port: 80
  ingress:
    enabled: true
    className: nginx
    annotations:
      cert-manager.io/cluster-issuer: letsencrypt-prod
    hosts:
      - host: your-domain.com
        paths:
          - path: /
            pathType: Prefix
    tls:
      - secretName: frontend-tls
        hosts:
          - your-domain.com

backend:
  replicaCount: 3
  image:
    repository: unified-repo-analyzer/backend
    tag: "1.0.0"
  service:
    type: ClusterIP
    port: 3001
  env:
    NODE_ENV: production
    CLAUDE_API_KEY: your_claude_api_key
  resources:
    requests:
      memory: "1Gi"
      cpu: "500m"
    limits:
      memory: "2Gi"
      cpu: "1000m"

postgresql:
  enabled: true
  auth:
    database: repo_analyzer
    username: analyzer
    password: secure_password
  primary:
    persistence:
      size: 20Gi

redis:
  enabled: true
  auth:
    enabled: false
  master:
    persistence:
      size: 8Gi
```

3. **Deploy with Helm:**
```bash
helm install unified-repo-analyzer unified-repo-analyzer/unified-repo-analyzer \
  -f values.yaml \
  --namespace repo-analyzer \
  --create-namespace
```

### Manual Kubernetes Deployment

#### Namespace and ConfigMap
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: repo-analyzer
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: repo-analyzer
data:
  NODE_ENV: "production"
  API_BASE_URL: "https://api.your-domain.com"
  LOG_LEVEL: "info"
```

#### Backend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: repo-analyzer
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: unified-repo-analyzer/backend:1.0.0
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: NODE_ENV
        - name: CLAUDE_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: claude-api-key
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: repo-analyzer
spec:
  selector:
    app: backend
  ports:
  - port: 3001
    targetPort: 3001
  type: ClusterIP
```

## Manual Deployment

### System Preparation

1. **Install Node.js and npm:**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# macOS
brew install node@18
```

2. **Create application user:**
```bash
sudo useradd -r -s /bin/false -d /opt/repo-analyzer repo-analyzer
sudo mkdir -p /opt/repo-analyzer
sudo chown repo-analyzer:repo-analyzer /opt/repo-analyzer
```

3. **Create directories:**
```bash
sudo mkdir -p /var/log/repo-analyzer
sudo mkdir -p /var/cache/repo-analyzer
sudo mkdir -p /etc/repo-analyzer
sudo chown repo-analyzer:repo-analyzer /var/log/repo-analyzer
sudo chown repo-analyzer:repo-analyzer /var/cache/repo-analyzer
```

### Application Installation

1. **Clone and build:**
```bash
cd /opt/repo-analyzer
sudo -u repo-analyzer git clone https://github.com/your-org/unified-repo-analyzer.git .
sudo -u repo-analyzer npm install
sudo -u repo-analyzer npm run build:prod
```

2. **Configure environment:**
```bash
sudo -u repo-analyzer cp .env.example .env
sudo nano .env  # Edit configuration
```

3. **Create systemd service files:**

**Backend Service (`/etc/systemd/system/repo-analyzer-backend.service`):**
```ini
[Unit]
Description=Repository Analyzer Backend
After=network.target

[Service]
Type=simple
User=repo-analyzer
Group=repo-analyzer
WorkingDirectory=/opt/repo-analyzer
ExecStart=/usr/bin/node packages/backend/dist/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/opt/repo-analyzer/.env

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/log/repo-analyzer /var/cache/repo-analyzer

[Install]
WantedBy=multi-user.target
```

**Frontend Service (`/etc/systemd/system/repo-analyzer-frontend.service`):**
```ini
[Unit]
Description=Repository Analyzer Frontend
After=network.target repo-analyzer-backend.service

[Service]
Type=simple
User=repo-analyzer
Group=repo-analyzer
WorkingDirectory=/opt/repo-analyzer
ExecStart=/usr/bin/npx serve -s packages/frontend/dist -l 3000
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

4. **Start services:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable repo-analyzer-backend
sudo systemctl enable repo-analyzer-frontend
sudo systemctl start repo-analyzer-backend
sudo systemctl start repo-analyzer-frontend
```

### Nginx Configuration

**`/etc/nginx/sites-available/repo-analyzer`:**
```nginx
upstream backend {
    server 127.0.0.1:3001;
    keepalive 32;
}

upstream frontend {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/your-domain.com.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # API routes
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # WebSocket routes
    location /ws/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend routes
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Handle client-side routing
        try_files $uri $uri/ @fallback;
    }

    location @fallback {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
    }

    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://frontend;
    }
}
```

## Production Considerations

### Security

1. **API Key Management:**
   - Use environment variables or secret management systems
   - Rotate API keys regularly
   - Monitor API usage and costs

2. **Network Security:**
   - Use HTTPS/TLS for all communications
   - Implement proper CORS policies
   - Use Web Application Firewall (WAF)

3. **Access Control:**
   - Implement authentication and authorization
   - Use role-based access control (RBAC)
   - Regular security audits

### Performance Optimization

1. **Caching Strategy:**
   - Implement Redis for session and analysis caching
   - Use CDN for static assets
   - Enable HTTP/2 and compression

2. **Database Optimization:**
   - Use connection pooling
   - Implement proper indexing
   - Regular database maintenance

3. **Resource Management:**
   - Set appropriate memory limits
   - Monitor CPU usage
   - Implement auto-scaling

### Backup and Recovery

1. **Database Backups:**
```bash
# PostgreSQL backup
pg_dump -h localhost -U analyzer repo_analyzer > backup_$(date +%Y%m%d_%H%M%S).sql

# MongoDB backup
mongodump --host localhost --db repo_analyzer --out backup_$(date +%Y%m%d_%H%M%S)
```

2. **Application Data:**
```bash
# Backup cache and logs
tar -czf app_data_$(date +%Y%m%d_%H%M%S).tar.gz /var/cache/repo-analyzer /var/log/repo-analyzer
```

3. **Automated Backup Script:**
```bash
#!/bin/bash
# /opt/repo-analyzer/scripts/backup.sh

BACKUP_DIR="/opt/backups/repo-analyzer"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U analyzer repo_analyzer > $BACKUP_DIR/db_$DATE.sql

# Application data backup
tar -czf $BACKUP_DIR/app_data_$DATE.tar.gz /var/cache/repo-analyzer /var/log/repo-analyzer

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

## Monitoring and Logging

### Application Monitoring

1. **Health Checks:**
```bash
# Backend health check
curl -f http://localhost:3001/health || exit 1

# Frontend health check
curl -f http://localhost:3000/ || exit 1
```

2. **Prometheus Metrics:**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'repo-analyzer-backend'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
```

### Log Management

1. **Log Rotation:**
```bash
# /etc/logrotate.d/repo-analyzer
/var/log/repo-analyzer/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 repo-analyzer repo-analyzer
    postrotate
        systemctl reload repo-analyzer-backend
    endscript
}
```

2. **Centralized Logging:**
```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200

volumes:
  elasticsearch_data:
```

## Troubleshooting

### Common Issues

1. **High Memory Usage:**
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Adjust Node.js memory limits
export NODE_OPTIONS="--max-old-space-size=4096"
```

2. **API Rate Limiting:**
```bash
# Check rate limit status
curl -I http://localhost:3001/api/health

# Adjust rate limits in configuration
RATE_LIMIT_REQUESTS=200
RATE_LIMIT_WINDOW=900000
```

3. **Database Connection Issues:**
```bash
# Test database connection
psql -h localhost -U analyzer -d repo_analyzer -c "SELECT 1;"

# Check connection pool
SELECT * FROM pg_stat_activity WHERE datname = 'repo_analyzer';
```

### Performance Issues

1. **Slow Analysis:**
   - Check LLM provider response times
   - Verify network connectivity
   - Monitor system resources

2. **High CPU Usage:**
   - Review concurrent analysis limits
   - Check for memory leaks
   - Optimize file processing

3. **Database Performance:**
   - Analyze slow queries
   - Update statistics
   - Consider indexing

### Log Analysis

```bash
# Check application logs
tail -f /var/log/repo-analyzer/app.log

# Search for errors
grep -i error /var/log/repo-analyzer/app.log

# Monitor system logs
journalctl -u repo-analyzer-backend -f
```

For additional support, please refer to our [troubleshooting documentation](TROUBLESHOOTING.md) or contact support.