# Logging Configuration Guide

## Overview

The unified-repo-analyzer application includes a comprehensive logging system designed to provide detailed diagnostic information for troubleshooting and monitoring. This guide covers how to configure logging levels, outputs, and formats to meet your specific needs.

## Quick Start

### Basic Configuration

The logging system is configured through environment variables. Add these to your `.env` file:

```bash
# Basic logging configuration
LOG_LEVEL=info
LOG_DIR=./logs
ENABLE_METRICS=true

# Optional: Advanced logging settings
LOG_FORMAT=JSON
LOG_INCLUDE_STACK_TRACE=true
LOG_REDACT_SENSITIVE_DATA=true
```

### Log Levels

The application supports four log levels in order of verbosity:

- **ERROR**: Critical errors and failures only
- **WARN**: Warnings and non-critical issues
- **INFO**: General application information (default)
- **DEBUG**: Detailed diagnostic information

```bash
# Set log level
LOG_LEVEL=debug  # Most verbose
LOG_LEVEL=info   # Recommended for production
LOG_LEVEL=error  # Minimal logging
```

## Configuration Options

### Environment Variables

| Variable                    | Default  | Description                        |
| --------------------------- | -------- | ---------------------------------- |
| `LOG_LEVEL`                 | `info`   | Minimum log level to output        |
| `LOG_DIR`                   | `./logs` | Directory for log files            |
| `LOG_FORMAT`                | `JSON`   | Log format: `JSON` or `TEXT`       |
| `LOG_INCLUDE_STACK_TRACE`   | `true`   | Include stack traces in error logs |
| `LOG_REDACT_SENSITIVE_DATA` | `true`   | Redact sensitive information       |
| `LOG_MAX_FILE_SIZE`         | `10MB`   | Maximum size per log file          |
| `LOG_MAX_FILES`             | `5`      | Maximum number of rotated files    |
| `LOG_ROTATE_DAILY`          | `true`   | Enable daily log rotation          |

### Output Destinations

#### Console Output
Always enabled in development mode. Configure with:

```bash
LOG_CONSOLE_COLORIZE=true  # Enable colored output
```

#### File Output
Automatically enabled when `LOG_DIR` is specified:

```bash
LOG_DIR=./logs
LOG_MAX_FILE_SIZE=10MB
LOG_MAX_FILES=5
LOG_ROTATE_DAILY=true
```

#### External Logging Services
Configure external logging (e.g., Elasticsearch, Splunk):

```bash
LOG_EXTERNAL_ENABLED=true
LOG_EXTERNAL_URL=https://your-logging-service.com/api/logs
LOG_EXTERNAL_API_KEY=your-api-key
LOG_EXTERNAL_FORMAT=JSON
```

## Log Structure

### JSON Format (Recommended)

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "INFO",
  "component": "PathHandler",
  "requestId": "req-123e4567-e89b-12d3-a456-426614174000",
  "message": "Path validation completed",
  "metadata": {
    "path": "C:\\Users\\AlexJ\\Documents\\Repos\\myProject",
    "normalizedPath": "C:/Users/AlexJ/Documents/Repos/myProject",
    "validationTime": 45,
    "isValid": true
  }
}
```

### Text Format

```
2024-01-15T10:30:45.123Z [INFO] PathHandler (req-123e4567): Path validation completed
  path: C:\Users\AlexJ\Documents\Repos\myProject
  normalizedPath: C:/Users/AlexJ/Documents/Repos/myProject
  validationTime: 45ms
  isValid: true
```

## Component-Specific Logging

### Path Handler Logging

The PathHandler service logs:
- Path validation attempts and results
- Permission checking operations
- Path normalization processes
- Windows-specific path handling

Example configuration for detailed path logging:
```bash
LOG_LEVEL=debug
LOG_PATH_OPERATIONS=true
LOG_PERMISSION_CHECKS=true
```

### HTTP Request Logging

HTTP requests and responses are logged with:
- Request method, URL, headers, and body (sanitized)
- Response status, headers, and processing time
- Error details and stack traces

Configure HTTP logging:
```bash
LOG_HTTP_REQUESTS=true
LOG_HTTP_BODIES=true
LOG_HTTP_HEADERS=true
LOG_REDACT_SENSITIVE_DATA=true  # Recommended
```

### Repository Analysis Logging

Repository analysis operations log:
- Analysis start and completion
- File processing progress
- LLM provider interactions
- Performance metrics

Configure analysis logging:
```bash
LOG_ANALYSIS_PROGRESS=true
LOG_LLM_INTERACTIONS=true
LOG_PERFORMANCE_METRICS=true
```

## Log Management

### Automatic Rotation

Log files are automatically rotated based on:
- File size (default: 10MB)
- Daily rotation (enabled by default)
- Maximum number of files (default: 5)

### Manual Cleanup

Clean up old logs manually:
```bash
# Remove logs older than 30 days
find ./logs -name "*.log" -mtime +30 -delete

# Remove logs larger than 100MB
find ./logs -name "*.log" -size +100M -delete
```

### Monitoring Log Health

Monitor log file sizes and rotation:
```bash
# Check current log sizes
du -sh ./logs/*

# Monitor log growth in real-time
tail -f ./logs/combined.log
```

## Production Recommendations

### Security
- Always enable `LOG_REDACT_SENSITIVE_DATA=true`
- Restrict access to log files (chmod 600)
- Use external logging services for centralized management
- Regularly rotate and archive logs

### Performance
- Use `LOG_LEVEL=info` or `LOG_LEVEL=warn` in production
- Enable log rotation to prevent disk space issues
- Consider async logging for high-traffic applications
- Monitor log file I/O impact

### Monitoring
- Set up alerts for ERROR level logs
- Monitor log file sizes and rotation
- Track log ingestion rates for external services
- Implement log parsing for automated analysis

## Troubleshooting

### Common Issues

#### Logs Not Appearing
1. Check `LOG_LEVEL` setting
2. Verify `LOG_DIR` permissions
3. Ensure disk space is available
4. Check for file system errors

#### Large Log Files
1. Reduce `LOG_LEVEL` verbosity
2. Enable log rotation
3. Implement log cleanup policies
4. Consider external log aggregation

#### Missing Context
1. Increase `LOG_LEVEL` to `debug`
2. Enable component-specific logging
3. Check request ID correlation
4. Verify metadata inclusion

### Debug Mode

Enable comprehensive debugging:
```bash
LOG_LEVEL=debug
LOG_INCLUDE_STACK_TRACE=true
LOG_PATH_OPERATIONS=true
LOG_HTTP_REQUESTS=true
LOG_PERFORMANCE_METRICS=true
```

## Examples

### Development Configuration
```bash
# .env.development
LOG_LEVEL=debug
LOG_DIR=./logs
LOG_FORMAT=TEXT
LOG_CONSOLE_COLORIZE=true
LOG_INCLUDE_STACK_TRACE=true
```

### Production Configuration
```bash
# .env.production
LOG_LEVEL=info
LOG_DIR=/var/log/unified-repo-analyzer
LOG_FORMAT=JSON
LOG_REDACT_SENSITIVE_DATA=true
LOG_EXTERNAL_ENABLED=true
LOG_EXTERNAL_URL=https://logs.company.com/api/ingest
```

### Testing Configuration
```bash
# .env.test
LOG_LEVEL=error
LOG_DIR=./test-logs
LOG_FORMAT=JSON
LOG_INCLUDE_STACK_TRACE=false
```