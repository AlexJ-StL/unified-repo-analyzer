# Windows Path Handling and Logging Setup Guide

## Overview

This guide provides comprehensive setup instructions for the enhanced Windows path handling and logging features in the unified-repo-analyzer application. These features address common Windows-specific issues and provide detailed diagnostic capabilities.

## Quick Start

### 1. Update Environment Configuration

Create or update your `.env` file with the new configuration options:

```bash
# Path Handling Configuration
WINDOWS_LONG_PATH_SUPPORT=true
WINDOWS_UNC_PATH_SUPPORT=true
WINDOWS_CASE_SENSITIVE=false
PATH_VALIDATION_TIMEOUT=5000
ENABLE_PATH_CACHE=true
PATH_CACHE_TTL=300000

# Logging Configuration
LOG_LEVEL=info
LOG_DIR=./logs
LOG_FORMAT=JSON
LOG_INCLUDE_STACK_TRACE=true
LOG_REDACT_SENSITIVE_DATA=true

# HTTP Logging
LOG_HTTP_REQUESTS=true
LOG_HTTP_RESPONSES=true
LOG_HTTP_HEADERS=false
LOG_HTTP_BODIES=false

# Path Logging
LOG_PATH_OPERATIONS=true
LOG_PERMISSION_CHECKS=false
LOG_PATH_NORMALIZATION=false

# Performance Logging
LOG_PERFORMANCE_METRICS=false
LOG_SLOW_OPERATIONS=true
SLOW_OPERATION_THRESHOLD=1000
```

### 2. Enable Windows Long Path Support (Optional)

For paths longer than 260 characters, enable Windows long path support:

```powershell
# Run as Administrator
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# Restart required
Restart-Computer
```

### 3. Create Log Directory

Ensure the log directory exists and has proper permissions:

```powershell
# Create log directory
New-Item -ItemType Directory -Path ".\logs" -Force

# Grant permissions
icacls ".\logs" /grant "$env:USERNAME:(OI)(CI)F" /T
```

### 4. Start the Application

```bash
npm start
```

## Detailed Configuration

### Path Handling Configuration

#### Basic Path Settings

```bash
# Enable Windows-specific path handling
WINDOWS_LONG_PATH_SUPPORT=true
WINDOWS_UNC_PATH_SUPPORT=true
WINDOWS_CASE_SENSITIVE=false

# Path validation settings
PATH_VALIDATION_TIMEOUT=5000  # 5 seconds
MAX_PATH_LENGTH=32767         # Maximum path length
ENABLE_PATH_CACHE=true        # Cache validated paths
PATH_CACHE_TTL=300000         # Cache for 5 minutes
```

#### Advanced Path Settings

```bash
# Network path settings
NETWORK_TIMEOUT=10000         # 10 seconds for network paths
UNC_PATH_RETRY_COUNT=3        # Retry failed UNC paths
UNC_PATH_RETRY_DELAY=1000     # 1 second between retries

# Permission checking
CHECK_PERMISSIONS_BY_DEFAULT=true
SKIP_PERMISSION_CHECK_FOR_READONLY=false
PERMISSION_CHECK_TIMEOUT=2000  # 2 seconds

# Path normalization
NORMALIZE_PATHS_AUTOMATICALLY=true
PRESERVE_ORIGINAL_CASE=true
CONVERT_BACKSLASHES_TO_FORWARD=true
```

### Logging Configuration

#### Core Logging Settings

```bash
# Log level (DEBUG, INFO, WARN, ERROR)
LOG_LEVEL=info

# Log format (JSON, TEXT)
LOG_FORMAT=JSON

# Log directory
LOG_DIR=./logs

# Include stack traces in error logs
LOG_INCLUDE_STACK_TRACE=true

# Redact sensitive information
LOG_REDACT_SENSITIVE_DATA=true
```

#### Log Rotation Settings

```bash
# File rotation
LOG_MAX_FILE_SIZE=10MB        # Rotate when file reaches 10MB
LOG_MAX_FILES=5               # Keep 5 rotated files
LOG_ROTATE_DAILY=true         # Rotate daily regardless of size

# Log retention
LOG_RETENTION_DAYS=30         # Delete logs older than 30 days
LOG_CLEANUP_INTERVAL=86400000 # Check for cleanup every 24 hours
```

#### Component-Specific Logging

```bash
# HTTP request/response logging
LOG_HTTP_REQUESTS=true
LOG_HTTP_RESPONSES=true
LOG_HTTP_HEADERS=false        # Set to true for debugging
LOG_HTTP_BODIES=false         # Set to true for debugging
LOG_HTTP_MAX_BODY_SIZE=1024   # Maximum body size to log

# Path operation logging
LOG_PATH_OPERATIONS=true
LOG_PERMISSION_CHECKS=false   # Enable for permission debugging
LOG_PATH_NORMALIZATION=false  # Enable for path format debugging
LOG_PATH_VALIDATION_DETAILS=false

# Repository analysis logging
LOG_ANALYSIS_PROGRESS=true
LOG_LLM_INTERACTIONS=false    # Enable for LLM debugging
LOG_FILE_PROCESSING=false     # Enable for detailed file processing logs

# Performance logging
LOG_PERFORMANCE_METRICS=false # Enable for performance monitoring
LOG_SLOW_OPERATIONS=true
SLOW_OPERATION_THRESHOLD=1000 # Log operations slower than 1 second
LOG_MEMORY_USAGE=false        # Enable for memory monitoring
```

#### External Logging Integration

```bash
# External logging service
LOG_EXTERNAL_ENABLED=false
LOG_EXTERNAL_URL=https://logs.company.com/api/ingest
LOG_EXTERNAL_API_KEY=your-api-key
LOG_EXTERNAL_TIMEOUT=10000
LOG_EXTERNAL_BATCH_SIZE=100
LOG_EXTERNAL_FLUSH_INTERVAL=5000

# Elasticsearch integration
ELASTICSEARCH_ENABLED=false
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_INDEX=unified-repo-analyzer
ELASTICSEARCH_TYPE=logs

# Splunk integration
SPLUNK_ENABLED=false
SPLUNK_URL=https://splunk.company.com:8088/services/collector
SPLUNK_TOKEN=your-splunk-token
SPLUNK_INDEX=app-logs
```

## Environment-Specific Configurations

### Development Environment

```bash
# .env.development
NODE_ENV=development

# Verbose logging for development
LOG_LEVEL=debug
LOG_FORMAT=TEXT
LOG_CONSOLE_COLORIZE=true
LOG_INCLUDE_STACK_TRACE=true

# Enable detailed logging
LOG_HTTP_REQUESTS=true
LOG_HTTP_HEADERS=true
LOG_HTTP_BODIES=true
LOG_PATH_OPERATIONS=true
LOG_PERMISSION_CHECKS=true
LOG_PATH_NORMALIZATION=true
LOG_PERFORMANCE_METRICS=true

# Path handling
WINDOWS_LONG_PATH_SUPPORT=true
WINDOWS_UNC_PATH_SUPPORT=true
PATH_VALIDATION_TIMEOUT=10000  # Longer timeout for debugging
```

### Production Environment

```bash
# .env.production
NODE_ENV=production

# Optimized logging for production
LOG_LEVEL=info
LOG_FORMAT=JSON
LOG_REDACT_SENSITIVE_DATA=true
LOG_INCLUDE_STACK_TRACE=false

# Minimal logging for performance
LOG_HTTP_REQUESTS=true
LOG_HTTP_HEADERS=false
LOG_HTTP_BODIES=false
LOG_PATH_OPERATIONS=false
LOG_PERFORMANCE_METRICS=true

# External logging
LOG_EXTERNAL_ENABLED=true
LOG_EXTERNAL_URL=https://logs.company.com/api/ingest
LOG_EXTERNAL_API_KEY=your-production-api-key

# Path handling
WINDOWS_LONG_PATH_SUPPORT=true
WINDOWS_UNC_PATH_SUPPORT=false  # Disable if not needed
PATH_VALIDATION_TIMEOUT=5000
ENABLE_PATH_CACHE=true
```

### Testing Environment

```bash
# .env.test
NODE_ENV=test

# Minimal logging for tests
LOG_LEVEL=error
LOG_DIR=./test-logs
LOG_FORMAT=JSON
LOG_INCLUDE_STACK_TRACE=false

# Disable external logging
LOG_EXTERNAL_ENABLED=false

# Fast path validation for tests
PATH_VALIDATION_TIMEOUT=1000
ENABLE_PATH_CACHE=false
```

## Windows-Specific Setup

### 1. PowerShell Execution Policy

Ensure PowerShell can execute scripts:

```powershell
# Check current execution policy
Get-ExecutionPolicy

# Set execution policy (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Windows Defender Exclusions

Add exclusions to improve performance:

```powershell
# Add application directory
Add-MpPreference -ExclusionPath "C:\path\to\unified-repo-analyzer"

# Add log directory
Add-MpPreference -ExclusionPath "C:\path\to\unified-repo-analyzer\logs"

# Add Node.js process
Add-MpPreference -ExclusionProcess "node.exe"

# Add repository directories (optional)
Add-MpPreference -ExclusionPath "C:\Users\$env:USERNAME\Documents\Repos"
```

### 3. Network Path Configuration

For UNC path support, configure network credentials:

```powershell
# Store network credentials
cmdkey /add:server /user:domain\username /pass:password

# Test network connectivity
Test-NetConnection -ComputerName "server" -Port 445

# Map network drive (optional)
New-PSDrive -Name "R" -PSProvider FileSystem -Root "\\server\share" -Persist
```

### 4. Registry Configuration (Advanced)

For advanced Windows path handling:

```powershell
# Enable long path support (Windows 10 1607+)
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# Disable 8.3 filename generation (optional, for performance)
fsutil 8dot3name set C: 1

# Configure NTFS case sensitivity (optional)
fsutil file setCaseSensitiveInfo C:\path\to\repository enable
```

## Verification and Testing

### 1. Test Path Validation

```bash
# Test the path validation endpoint
curl -X POST http://localhost:3001/api/validate-path \
  -H "Content-Type: application/json" \
  -d '{"path": "C:/Users/AlexJ/Documents/Repos/myProject"}'
```

### 2. Test Logging Configuration

```bash
# Get current logging configuration
curl http://localhost:3001/api/logs/config

# Update logging configuration
curl -X PUT http://localhost:3001/api/logs/config \
  -H "Content-Type: application/json" \
  -d '{"level": "DEBUG", "pathLogging": {"enabled": true, "logValidation": true}}'
```

### 3. Test Log Retrieval

```bash
# Get recent logs
curl "http://localhost:3001/api/logs?limit=10"

# Get error logs
curl "http://localhost:3001/api/logs?level=ERROR&limit=50"

# Get path handler logs
curl "http://localhost:3001/api/logs?component=PathHandler&limit=25"
```

### 4. Test Repository Analysis

```bash
# Test repository analysis with Windows path
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"path": "C:/Users/AlexJ/Documents/Repos/myProject", "options": {"mode": "standard"}}'
```

## Troubleshooting Setup Issues

### Common Setup Problems

#### 1. Log Directory Permission Issues

**Error**: Cannot write to log directory

**Solution**:
```powershell
# Create directory with proper permissions
New-Item -ItemType Directory -Path ".\logs" -Force
icacls ".\logs" /grant "$env:USERNAME:(OI)(CI)F" /T

# Verify permissions
Get-Acl ".\logs" | Format-List
```

#### 2. Long Path Support Not Working

**Error**: Path too long errors despite configuration

**Solution**:
```powershell
# Verify long path support is enabled
Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled"

# Enable if not set
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# Restart required
Restart-Computer
```

#### 3. UNC Path Access Issues

**Error**: Cannot access network paths

**Solution**:
```powershell
# Test network connectivity
Test-NetConnection -ComputerName "server" -Port 445

# Store credentials
cmdkey /add:server /user:domain\username /pass:password

# Test access
Test-Path "\\server\share"
```

#### 4. Environment Variables Not Loading

**Error**: Configuration not applied

**Solution**:
```bash
# Verify .env file exists and is readable
ls -la .env*

# Check for syntax errors (no spaces around =)
# Correct: LOG_LEVEL=debug
# Incorrect: LOG_LEVEL = debug

# Restart application after changes
npm restart
```

### Diagnostic Commands

#### Check Application Status

```powershell
# Check if application is running
Get-Process node | Where-Object {$_.ProcessName -eq "node"}

# Check port usage
netstat -an | findstr :3001

# Check log files
Get-ChildItem ".\logs" | Sort-Object LastWriteTime -Descending
```

#### Monitor Performance

```powershell
# Monitor CPU usage
Get-Counter "\Process(node)\% Processor Time"

# Monitor memory usage
Get-Counter "\Process(node)\Working Set"

# Monitor disk I/O
Get-Counter "\Process(node)\IO Read Operations/sec"
Get-Counter "\Process(node)\IO Write Operations/sec"
```

#### Test Network Connectivity

```powershell
# Test HTTP endpoints
Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET

# Test with specific path
$body = @{
    path = "C:/Users/$env:USERNAME/Documents"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/validate-path" -Method POST -Body $body -ContentType "application/json"
```

## Maintenance and Monitoring

### Log Rotation and Cleanup

```powershell
# Manual log cleanup script
$logDir = ".\logs"
$retentionDays = 30

Get-ChildItem $logDir -Name "*.log" | 
    Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-$retentionDays)} | 
    Remove-Item -Force

# Check log file sizes
Get-ChildItem $logDir -Name "*.log" | 
    Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}} | 
    Sort-Object "Size(MB)" -Descending
```

### Performance Monitoring

```bash
# Enable performance logging
LOG_PERFORMANCE_METRICS=true
LOG_SLOW_OPERATIONS=true
SLOW_OPERATION_THRESHOLD=500

# Monitor via API
curl "http://localhost:3001/api/logs?search=duration&limit=100"
```

### Health Checks

```bash
# Application health check
curl http://localhost:3001/api/health

# Detailed system status
curl http://localhost:3001/api/system/status
```

## Security Considerations

### 1. Log File Security

```powershell
# Restrict log file access
icacls ".\logs" /inheritance:r
icacls ".\logs" /grant "$env:USERNAME:(OI)(CI)F"
icacls ".\logs" /grant "Administrators:(OI)(CI)F"
```

### 2. Sensitive Data Redaction

```bash
# Always enable in production
LOG_REDACT_SENSITIVE_DATA=true

# Configure redaction patterns
REDACT_PATTERNS=password,token,key,secret,credential
```

### 3. Network Security

```bash
# Use HTTPS for external logging
LOG_EXTERNAL_URL=https://logs.company.com/api/ingest

# Validate SSL certificates
LOG_EXTERNAL_VERIFY_SSL=true
```

## Support and Resources

### Documentation Links

- [Path Validation API Documentation](./api/PATH_VALIDATION_API.md)
- [Logging API Documentation](./api/LOGGING_API.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Windows Setup Guide](./WINDOWS_SETUP.md)

### Configuration Templates

- [Development Configuration](./.env.development.example)
- [Production Configuration](./.env.production.example)
- [Testing Configuration](./.env.test.example)

### Support Channels

- **GitHub Issues**: For bug reports and feature requests
- **Documentation**: Latest setup guides and API documentation
- **Community Forums**: General questions and discussions

### Emergency Procedures

If the application fails to start after configuration changes:

1. **Reset to default configuration**:
   ```bash
   cp .env.example .env
   ```

2. **Clear cache and logs**:
   ```bash
   rm -rf ./data/cache
   rm -rf ./logs/*.log
   ```

3. **Start with minimal configuration**:
   ```bash
   LOG_LEVEL=error npm start
   ```

4. **Check application logs**:
   ```bash
   tail -f ./logs/error.log
   ```