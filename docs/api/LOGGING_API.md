# Logging API Documentation

## Overview

The Logging API provides comprehensive access to application logs and logging configuration management. It supports real-time log retrieval, filtering, and dynamic configuration updates without requiring application restarts.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, no authentication is required for local usage.

## Endpoints

### GET /logs

Retrieves application logs with filtering and pagination support.

#### Query Parameters

| Parameter   | Type    | Required | Description                                                           |
| ----------- | ------- | -------- | --------------------------------------------------------------------- |
| `level`     | string  | No       | Filter by log level (DEBUG, INFO, WARN, ERROR)                        |
| `component` | string  | No       | Filter by component name (e.g., PathHandler, Logger, HttpInterceptor) |
| `startTime` | string  | No       | Start time for log entries (ISO 8601 format)                          |
| `endTime`   | string  | No       | End time for log entries (ISO 8601 format)                            |
| `search`    | string  | No       | Search term in log messages                                           |
| `limit`     | integer | No       | Maximum number of log entries to return (1-1000, default: 100)        |
| `offset`    | integer | No       | Number of log entries to skip (default: 0)                            |

#### Example Request

```
GET /api/logs?level=ERROR&component=PathHandler&limit=50&offset=0
```

#### Response

**Success Response (200 OK):**

```json
{
  "logs": [
    {
      "timestamp": "2024-01-15T10:30:45.123Z",
      "level": "ERROR",
      "component": "PathHandler",
      "requestId": "req-123e4567-e89b-12d3-a456-426614174000",
      "message": "Path validation failed",
      "metadata": {
        "path": "C:\\invalid\\path",
        "validationTime": 89,
        "errorCode": "PATH_NOT_FOUND"
      },
      "error": {
        "name": "PathValidationError",
        "message": "The specified path does not exist",
        "stack": "PathValidationError: The specified path does not exist\n    at PathHandler.validatePath..."
      },
      "duration": 89
    },
    {
      "timestamp": "2024-01-15T10:29:12.456Z",
      "level": "INFO",
      "component": "PathHandler",
      "requestId": "req-987f6543-e21c-34b5-a789-123456789abc",
      "message": "Path validation completed successfully",
      "metadata": {
        "path": "C:/Users/AlexJ/Documents/Repos/myProject",
        "normalizedPath": "C:/Users/AlexJ/Documents/Repos/myProject",
        "validationTime": 45,
        "isValid": true
      },
      "duration": 45
    }
  ],
  "total": 2,
  "limit": 50,
  "offset": 0,
  "hasMore": false
}
```

### GET /logs/config

Returns the current logging configuration settings.

#### Response

**Success Response (200 OK):**

```json
{
  "level": "INFO",
  "format": "JSON",
  "outputs": [
    {
      "type": "console",
      "enabled": true,
      "config": {
        "colorize": true
      }
    },
    {
      "type": "file",
      "enabled": true,
      "config": {
        "path": "./logs/combined.log",
        "maxSize": "10MB",
        "maxFiles": 5,
        "rotateDaily": true
      }
    },
    {
      "type": "external",
      "enabled": false,
      "config": {
        "url": "https://logs.company.com/api/ingest",
        "timeout": 10000,
        "batchSize": 100
      }
    }
  ],
  "includeStackTrace": true,
  "redactSensitiveData": true,
  "httpLogging": {
    "enabled": true,
    "logRequests": true,
    "logResponses": true,
    "logHeaders": false,
    "logBodies": false,
    "maxBodySize": 1024
  },
  "pathLogging": {
    "enabled": true,
    "logValidation": true,
    "logPermissionChecks": false,
    "logNormalization": false
  },
  "performanceLogging": {
    "enabled": false,
    "logSlowOperations": true,
    "slowOperationThreshold": 1000,
    "logMemoryUsage": false
  }
}
```

### PUT /logs/config

Updates the logging configuration at runtime. Changes take effect immediately without requiring a restart.

#### Request Body

```json
{
  "level": "DEBUG",
  "format": "JSON",
  "includeStackTrace": true,
  "redactSensitiveData": true,
  "httpLogging": {
    "enabled": true,
    "logRequests": true,
    "logResponses": true,
    "logHeaders": true,
    "logBodies": true,
    "maxBodySize": 2048
  },
  "pathLogging": {
    "enabled": true,
    "logValidation": true,
    "logPermissionChecks": true,
    "logNormalization": true
  },
  "performanceLogging": {
    "enabled": true,
    "logSlowOperations": true,
    "slowOperationThreshold": 500,
    "logMemoryUsage": true
  }
}
```

#### Response

**Success Response (200 OK):**

```json
{
  "message": "Logging configuration updated successfully",
  "config": {
    "level": "DEBUG",
    "format": "JSON",
    "includeStackTrace": true,
    "redactSensitiveData": true,
    "httpLogging": {
      "enabled": true,
      "logRequests": true,
      "logResponses": true,
      "logHeaders": true,
      "logBodies": true,
      "maxBodySize": 2048
    },
    "pathLogging": {
      "enabled": true,
      "logValidation": true,
      "logPermissionChecks": true,
      "logNormalization": true
    },
    "performanceLogging": {
      "enabled": true,
      "logSlowOperations": true,
      "slowOperationThreshold": 500,
      "logMemoryUsage": true
    }
  }
}
```

## Log Entry Structure

### Standard Log Entry

Every log entry contains the following standard fields:

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "INFO",
  "component": "ComponentName",
  "requestId": "req-unique-identifier",
  "message": "Human-readable message",
  "metadata": {},
  "duration": 123
}
```

### Error Log Entry

Error log entries include additional error information:

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "ERROR",
  "component": "ComponentName",
  "requestId": "req-unique-identifier",
  "message": "Error occurred during operation",
  "metadata": {
    "operation": "pathValidation",
    "input": "C:\\invalid\\path"
  },
  "error": {
    "name": "PathValidationError",
    "message": "The specified path does not exist",
    "stack": "PathValidationError: The specified path does not exist\n    at PathHandler.validatePath..."
  },
  "duration": 89
}
```

## Component-Specific Logging

### PathHandler Logs

Path validation and handling operations:

```json
{
  "component": "PathHandler",
  "message": "Path validation completed",
  "metadata": {
    "path": "C:/Users/AlexJ/Documents/Repos/myProject",
    "normalizedPath": "C:/Users/AlexJ/Documents/Repos/myProject",
    "validationTime": 45,
    "isValid": true,
    "permissions": {
      "canRead": true,
      "canWrite": true,
      "canExecute": true
    }
  }
}
```

### HttpInterceptor Logs

HTTP request and response logging:

```json
{
  "component": "HttpInterceptor",
  "message": "HTTP request completed",
  "metadata": {
    "method": "POST",
    "url": "/api/analyze",
    "statusCode": 200,
    "requestSize": 256,
    "responseSize": 1024,
    "duration": 1234,
    "userAgent": "Mozilla/5.0...",
    "correlationId": "req-123e4567"
  }
}
```

### RepositoryAnalyzer Logs

Repository analysis operations:

```json
{
  "component": "RepositoryAnalyzer",
  "message": "Repository analysis completed",
  "metadata": {
    "repositoryPath": "C:/Users/AlexJ/Documents/Repos/myProject",
    "analysisMode": "standard",
    "fileCount": 156,
    "totalSize": 2048576,
    "processingTime": 5432,
    "llmProvider": "claude",
    "tokenUsage": {
      "inputTokens": 1500,
      "outputTokens": 800,
      "totalTokens": 2300
    }
  }
}
```

## Filtering and Search

### Log Level Filtering

Filter logs by minimum level:

```
GET /api/logs?level=WARN
```

This returns all WARN and ERROR level logs.

### Component Filtering

Filter logs by specific component:

```
GET /api/logs?component=PathHandler
```

### Time Range Filtering

Filter logs within a specific time range:

```
GET /api/logs?startTime=2024-01-15T00:00:00Z&endTime=2024-01-15T23:59:59Z
```

### Text Search

Search for specific terms in log messages:

```
GET /api/logs?search=validation%20failed
```

### Combined Filtering

Combine multiple filters:

```
GET /api/logs?level=ERROR&component=PathHandler&search=timeout&limit=25
```

## Configuration Management

### Log Levels

Available log levels in order of verbosity:

- **DEBUG**: Detailed diagnostic information
- **INFO**: General application information
- **WARN**: Warning messages for non-critical issues
- **ERROR**: Error messages for failures and exceptions

### Output Destinations

#### Console Output

```json
{
  "type": "console",
  "enabled": true,
  "config": {
    "colorize": true
  }
}
```

#### File Output

```json
{
  "type": "file",
  "enabled": true,
  "config": {
    "path": "./logs/combined.log",
    "maxSize": "10MB",
    "maxFiles": 5,
    "rotateDaily": true
  }
}
```

#### External Logging Service

```json
{
  "type": "external",
  "enabled": true,
  "config": {
    "url": "https://logs.company.com/api/ingest",
    "apiKey": "your-api-key",
    "timeout": 10000,
    "batchSize": 100
  }
}
```

### Specialized Logging Configuration

#### HTTP Logging

Control HTTP request/response logging:

```json
{
  "httpLogging": {
    "enabled": true,
    "logRequests": true,
    "logResponses": true,
    "logHeaders": false,
    "logBodies": false,
    "maxBodySize": 1024
  }
}
```

#### Path Logging

Control path validation logging:

```json
{
  "pathLogging": {
    "enabled": true,
    "logValidation": true,
    "logPermissionChecks": false,
    "logNormalization": false
  }
}
```

#### Performance Logging

Control performance-related logging:

```json
{
  "performanceLogging": {
    "enabled": false,
    "logSlowOperations": true,
    "slowOperationThreshold": 1000,
    "logMemoryUsage": false
  }
}
```

## Usage Examples

### Retrieving Recent Errors

```javascript
// Get the last 50 error logs
const response = await fetch('/api/logs?level=ERROR&limit=50');
const data = await response.json();

data.logs.forEach(log => {
  console.error(`[${log.timestamp}] ${log.component}: ${log.message}`);
  if (log.error) {
    console.error(`Error: ${log.error.message}`);
  }
});
```

### Monitoring Path Validation Issues

```javascript
// Monitor path validation problems
const response = await fetch('/api/logs?component=PathHandler&level=WARN&limit=100');
const data = await response.json();

const pathIssues = data.logs.filter(log => 
  log.metadata && log.metadata.errorCode
);

console.log(`Found ${pathIssues.length} path validation issues`);
```

### Updating Log Configuration

```javascript
// Enable debug logging for troubleshooting
const newConfig = {
  level: 'DEBUG',
  pathLogging: {
    enabled: true,
    logValidation: true,
    logPermissionChecks: true,
    logNormalization: true
  },
  httpLogging: {
    enabled: true,
    logRequests: true,
    logResponses: true,
    logHeaders: true,
    logBodies: true
  }
};

const response = await fetch('/api/logs/config', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newConfig)
});

const result = await response.json();
console.log('Configuration updated:', result.message);
```

### Real-time Log Monitoring

```javascript
// Poll for new logs every 5 seconds
let lastTimestamp = new Date().toISOString();

setInterval(async () => {
  const response = await fetch(`/api/logs?startTime=${lastTimestamp}&limit=100`);
  const data = await response.json();
  
  if (data.logs.length > 0) {
    data.logs.forEach(log => {
      console.log(`[${log.level}] ${log.component}: ${log.message}`);
    });
    
    // Update timestamp for next poll
    lastTimestamp = data.logs[data.logs.length - 1].timestamp;
  }
}, 5000);
```

## Error Handling

### API Errors

The API returns standard HTTP error codes:

- **400 Bad Request**: Invalid query parameters
- **500 Internal Server Error**: Server-side error

Example error response:

```json
{
  "error": "Bad Request",
  "message": "Invalid log level specified",
  "code": "INVALID_LOG_LEVEL",
  "details": {
    "validLevels": ["DEBUG", "INFO", "WARN", "ERROR"]
  }
}
```

### Configuration Validation

When updating configuration, validation errors are returned:

```json
{
  "error": "Configuration Validation Failed",
  "message": "Invalid configuration provided",
  "code": "CONFIG_VALIDATION_ERROR",
  "details": {
    "errors": [
      {
        "field": "level",
        "message": "Must be one of: DEBUG, INFO, WARN, ERROR"
      },
      {
        "field": "outputs[0].config.maxSize",
        "message": "Must be a valid size string (e.g., '10MB')"
      }
    ]
  }
}
```

## Performance Considerations

- **Pagination**: Use `limit` and `offset` parameters for large log sets
- **Time Filtering**: Use time range filters to reduce data transfer
- **Caching**: Log data is cached for 30 seconds to improve performance
- **Indexing**: Logs are indexed by timestamp, level, and component for fast queries

## Security Considerations

- **Sensitive Data**: Sensitive information is automatically redacted from logs
- **Access Control**: Consider implementing authentication for production use
- **Log Retention**: Configure appropriate log retention policies
- **Network Security**: Use HTTPS in production environments

## Rate Limiting

- **Log Retrieval**: 120 requests per minute per IP
- **Configuration Updates**: 10 requests per minute per IP
- **Burst Limit**: Up to 20 concurrent requests

## Integration Examples

### Log Analysis Dashboard

```javascript
// Create a simple log analysis dashboard
class LogDashboard {
  async getErrorSummary() {
    const response = await fetch('/api/logs?level=ERROR&limit=1000');
    const data = await response.json();
    
    const errorsByComponent = {};
    data.logs.forEach(log => {
      errorsByComponent[log.component] = (errorsByComponent[log.component] || 0) + 1;
    });
    
    return errorsByComponent;
  }
  
  async getPerformanceMetrics() {
    const response = await fetch('/api/logs?search=duration&limit=1000');
    const data = await response.json();
    
    const durations = data.logs
      .filter(log => log.duration)
      .map(log => log.duration);
    
    return {
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
      max: Math.max(...durations),
      min: Math.min(...durations)
    };
  }
}
```

### Automated Alerting

```javascript
// Monitor for critical errors and send alerts
class LogMonitor {
  async checkForCriticalErrors() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const response = await fetch(`/api/logs?level=ERROR&startTime=${fiveMinutesAgo}`);
    const data = await response.json();
    
    const criticalErrors = data.logs.filter(log => 
      log.metadata && log.metadata.errorCode === 'CRITICAL_SYSTEM_ERROR'
    );
    
    if (criticalErrors.length > 0) {
      await this.sendAlert(`Found ${criticalErrors.length} critical errors in the last 5 minutes`);
    }
  }
  
  async sendAlert(message) {
    // Send alert via email, Slack, etc.
    console.error('ALERT:', message);
  }
}
```