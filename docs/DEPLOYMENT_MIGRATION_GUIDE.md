# Deployment and Migration Guide

## Overview

This guide provides step-by-step instructions for deploying the enhanced unified-repo-analyzer with new Windows path handling and logging features. It covers configuration migration, feature rollout, and deployment verification.

## Pre-Deployment Checklist

### 1. System Requirements

- **Node.js**: Version 18.0 or higher
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Memory**: Minimum 4GB RAM, recommended 8GB+
- **Disk Space**: Minimum 2GB free space for application and logs
- **Network**: Internet access for external logging services (optional)

### 2. Backup Current Installation

```bash
# Create backup directory
mkdir -p backups/pre-migration-$(date +%Y%m%d-%H%M%S)

# Backup configuration files
cp .env* backups/pre-migration-*/
cp -r packages/*/env* backups/pre-migration-*/ 2>/dev/null || true

# Backup existing logs
cp -r logs backups/pre-migration-*/ 2>/dev/null || true

# Backup database (if applicable)
# Add your database backup commands here
```

### 3. Review Current Configuration

```bash
# Check current environment variables
cat .env

# Verify application is working
curl http://localhost:3000/api/health
```

## Migration Process

### Step 1: Configuration Migration

Run the automated configuration migration script:

```bash
# Run configuration migration
npm run migrate:config

# Review migrated configuration
cat .env

# Test configuration loading
npm run validate:compatibility
```

The migration script will:
- Add new Windows path handling configuration
- Add comprehensive logging configuration  
- Add performance monitoring settings
- Preserve existing configuration values
- Create backups of original files

### Step 2: Validate Backward Compatibility

```bash
# Run compatibility validation
npm run validate:compatibility

# Check for any breaking changes
echo "Review the output above for any compatibility issues"
```

### Step 3: Gradual Feature Rollout

Use the feature rollout manager to enable features incrementally:

```bash
# Start interactive feature rollout
npm run feature:rollout

# Or enable specific rollout stages
npm run feature:rollout stage stage-1-basic
npm run feature:rollout stage stage-2-enhanced
npm run feature:rollout stage stage-3-advanced
npm run feature:rollout stage stage-4-enterprise
```

#### Rollout Stages

**Stage 1 - Basic (Low Risk)**
- Windows path normalization
- Structured logging (JSON format)
- Sensitive data redaction

**Stage 2 - Enhanced (Low-Medium Risk)**
- HTTP request/response logging
- Path operation logging
- Log rotation
- Path validation caching
- Performance metrics

**Stage 3 - Advanced (Medium Risk)**
- Windows long path support
- Advanced permission checking
- Slow operation detection
- Memory usage monitoring

**Stage 4 - Enterprise (High Risk)**
- UNC network path support
- External logging services

### Step 4: Build and Deploy

```bash
# Build the application
npm run build:prod

# Deploy using Docker (recommended)
npm run deploy:prod

# Or deploy using platform-specific scripts
# Windows:
.\scripts\deploy.ps1

# Linux/macOS:
./scripts/deploy.sh
```

### Step 5: Deployment Verification

```bash
# Run comprehensive deployment verification
npm run verify:deployment

# Check specific components
curl http://localhost:3000/api/health
curl http://localhost:3000/api/validate-path -X POST -H "Content-Type: application/json" -d '{"path":"C:/Windows"}'
curl http://localhost:3000/api/logs/config
```

## Platform-Specific Deployment

### Windows Deployment

#### Prerequisites

```powershell
# Enable long path support (Windows 10 1607+)
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# Add Windows Defender exclusions
Add-MpPreference -ExclusionPath "C:\path\to\unified-repo-analyzer"
Add-MpPreference -ExclusionProcess "node.exe"

# Create log directory with proper permissions
New-Item -ItemType Directory -Path ".\logs" -Force
icacls ".\logs" /grant "$env:USERNAME:(OI)(CI)F" /T
```

#### Windows-Specific Configuration

```bash
# .env.windows
WINDOWS_LONG_PATH_SUPPORT=true
WINDOWS_UNC_PATH_SUPPORT=true
WINDOWS_CASE_SENSITIVE=false
PATH_VALIDATION_TIMEOUT=5000
ENABLE_PATH_CACHE=true

# Logging optimized for Windows
LOG_LEVEL=info
LOG_DIR=./logs
LOG_FORMAT=JSON
LOG_WINDOWS_EVENTS=true
```

#### Deploy on Windows

```powershell
# Run Windows deployment script
.\scripts\deploy.ps1 deploy

# Verify deployment
.\scripts\deploy.ps1 health
.\scripts\deploy.ps1 status
```

### Linux/macOS Deployment

#### Prerequisites

```bash
# Install required packages (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y nodejs npm docker.io docker-compose

# Or on macOS with Homebrew
brew install node npm docker docker-compose

# Create log directory
mkdir -p logs
chmod 755 logs
```

#### Unix-Specific Configuration

```bash
# .env.unix
WINDOWS_LONG_PATH_SUPPORT=false
WINDOWS_UNC_PATH_SUPPORT=false
WINDOWS_CASE_SENSITIVE=true
PATH_VALIDATION_TIMEOUT=3000

# Logging optimized for Unix
LOG_LEVEL=info
LOG_DIR=./logs
LOG_FORMAT=JSON
LOG_SYSLOG_ENABLED=true
```

#### Deploy on Linux/macOS

```bash
# Run Unix deployment script
./scripts/deploy.sh deploy

# Verify deployment
./scripts/deploy.sh health
./scripts/deploy.sh status
```

## Docker Deployment

### Docker Compose (Recommended)

```bash
# Build and start services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Deployment

```bash
# Build images
docker build -t unified-repo-analyzer:latest .

# Run container
docker run -d \
  --name unified-repo-analyzer \
  -p 3001:3001 \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/.env:/app/.env \
  unified-repo-analyzer:latest

# Check container status
docker ps
docker logs unified-repo-analyzer
```

## Production Configuration

### Environment Variables

```bash
# Production .env
NODE_ENV=production

# Security
LOG_REDACT_SENSITIVE_DATA=true
ENABLE_CORS=false
TRUST_PROXY=true

# Performance
ENABLE_PATH_CACHE=true
PATH_CACHE_TTL=300000
LOG_PERFORMANCE_METRICS=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=JSON
LOG_EXTERNAL_ENABLED=true
LOG_EXTERNAL_URL=https://logs.company.com/api/ingest
LOG_EXTERNAL_API_KEY=your-production-api-key

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
HEALTH_CHECK_INTERVAL=30000
```

### Security Hardening

```bash
# File permissions
chmod 600 .env
chmod 700 logs/
chmod 755 scripts/

# Network security
# Configure firewall rules
# Enable HTTPS/TLS
# Set up reverse proxy (nginx/Apache)
```

### Monitoring and Alerting

```bash
# Health check endpoint
curl http://localhost:3000/api/health

# Metrics endpoint (if enabled)
curl http://localhost:9090/metrics

# Log monitoring
tail -f logs/combined.log | grep ERROR

# Set up external monitoring
# - Application performance monitoring (APM)
# - Log aggregation (ELK stack, Splunk)
# - Alerting (PagerDuty, Slack)
```

## Rollback Procedures

### Quick Rollback

```bash
# Stop current deployment
docker-compose down
# or
pkill -f "node.*unified-repo-analyzer"

# Restore previous configuration
cp backups/pre-migration-*/env .env

# Restart with previous version
git checkout previous-stable-tag
npm run build:prod
npm run deploy:prod
```

### Configuration Rollback

```bash
# Reset feature flags to defaults
npm run feature:rollout reset

# Restore original configuration
cp backups/pre-migration-*/.env .env

# Restart application
npm restart
```

### Database Rollback (if applicable)

```bash
# Restore database from backup
# Add your database restoration commands here
```

## Troubleshooting

### Common Issues

#### 1. Configuration Migration Fails

```bash
# Check migration logs
cat logs/migration.log

# Manually create configuration
cp .env.example .env
npm run migrate:config

# Validate configuration
npm run validate:compatibility
```

#### 2. Path Validation Not Working

```bash
# Test path validation directly
curl -X POST http://localhost:3000/api/validate-path \
  -H "Content-Type: application/json" \
  -d '{"path":"C:/Windows"}'

# Check path handler logs
grep "PathHandler" logs/combined.log

# Verify Windows long path support
reg query "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled
```

#### 3. Logging Issues

```bash
# Check log directory permissions
ls -la logs/

# Test log endpoints
curl http://localhost:3000/api/logs/config
curl http://localhost:3000/api/logs?limit=10

# Check log file creation
ls -la logs/*.log
```

#### 4. Performance Issues

```bash
# Enable performance logging
echo "LOG_PERFORMANCE_METRICS=true" >> .env
echo "LOG_SLOW_OPERATIONS=true" >> .env

# Monitor resource usage
top -p $(pgrep -f "node.*unified-repo-analyzer")

# Check for memory leaks
curl http://localhost:3000/api/logs?search=memory
```

### Getting Help

1. **Check logs**: Always start by checking application logs
2. **Run diagnostics**: Use the built-in diagnostic tools
3. **Verify configuration**: Ensure all required settings are present
4. **Test components**: Test individual components in isolation
5. **Consult documentation**: Review API and configuration documentation

### Support Channels

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Comprehensive guides and API reference
- **Community Forums**: General questions and discussions

## Post-Deployment Tasks

### 1. Monitor Application Health

```bash
# Set up monitoring dashboard
# Configure health check alerts
# Monitor log file sizes and rotation
# Track performance metrics
```

### 2. Update Documentation

```bash
# Update deployment documentation
# Document any custom configurations
# Update runbooks and procedures
```

### 3. Train Team Members

```bash
# Share new logging capabilities
# Demonstrate path validation features
# Review troubleshooting procedures
```

### 4. Schedule Regular Maintenance

```bash
# Log cleanup and rotation
# Configuration reviews
# Security updates
# Performance optimization
```

## Conclusion

This deployment and migration guide provides a comprehensive approach to upgrading the unified-repo-analyzer with new Windows path handling and logging features. The gradual rollout approach minimizes risk while ensuring all features are properly tested and validated.

For additional support or questions, please refer to the documentation or contact the development team.