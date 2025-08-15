# Path Validation API Documentation

## Overview

The Path Validation API provides comprehensive path validation, normalization, and accessibility checking for repository paths across Windows, macOS, and Linux platforms. This API is essential for ensuring that repository paths are valid, accessible, and properly formatted before analysis operations.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, no authentication is required for local usage.

## Endpoints

### POST /validate-path

Validates a repository path for accessibility, format, and permissions.

#### Request

**Content-Type:** `application/json`

```json
{
  "path": "C:/Users/AlexJ/Documents/Repos/myProject",
  "options": {
    "checkPermissions": true,
    "resolveSymlinks": false,
    "networkTimeout": 10000,
    "validateContents": false
  }
}
```

#### Request Parameters

| Parameter                  | Type    | Required | Description                                                                |
| -------------------------- | ------- | -------- | -------------------------------------------------------------------------- |
| `path`                     | string  | Yes      | The file system path to validate                                           |
| `options`                  | object  | No       | Validation options                                                         |
| `options.checkPermissions` | boolean | No       | Whether to check file system permissions (default: true)                   |
| `options.resolveSymlinks`  | boolean | No       | Whether to resolve symbolic links (default: false)                         |
| `options.networkTimeout`   | integer | No       | Timeout for network path validation in milliseconds (default: 10000)       |
| `options.validateContents` | boolean | No       | Whether to validate that path contains a valid repository (default: false) |

#### Response

**Success Response (200 OK):**

```json
{
  "isValid": true,
  "normalizedPath": "C:/Users/AlexJ/Documents/Repos/myProject",
  "pathInfo": {
    "exists": true,
    "isDirectory": true,
    "isFile": false,
    "size": null,
    "permissions": {
      "canRead": true,
      "canWrite": true,
      "canExecute": true,
      "owner": "AlexJ",
      "group": "Users"
    },
    "platform": "windows"
  },
  "errors": [],
  "warnings": [
    {
      "code": "PATH_LONG",
      "message": "Path is longer than recommended",
      "details": "Path length is 45 characters, consider using shorter paths for better compatibility"
    }
  ],
  "suggestions": [],
  "validationTime": 156
}
```

**Error Response (400 Bad Request):**

```json
{
  "isValid": false,
  "normalizedPath": null,
  "pathInfo": {
    "exists": false,
    "isDirectory": false,
    "isFile": false,
    "size": null,
    "permissions": {
      "canRead": false,
      "canWrite": false,
      "canExecute": false,
      "owner": null,
      "group": null
    },
    "platform": "windows"
  },
  "errors": [
    {
      "code": "PATH_NOT_FOUND",
      "message": "The specified path does not exist",
      "details": "Path 'C:/Users/AlexJ/Documents/Repos/nonexistent' was not found on the file system",
      "suggestion": "Verify the path exists and is accessible"
    }
  ],
  "warnings": [],
  "suggestions": [
    "Check if the path exists: C:/Users/AlexJ/Documents/Repos",
    "Verify you have permission to access the parent directory",
    "Try using forward slashes instead of backslashes"
  ],
  "validationTime": 89
}
```

## Path Format Support

### Windows Paths

The API supports multiple Windows path formats:

#### 1. Backslash Paths (Traditional Windows)
```json
{
  "path": "C:\\Users\\AlexJ\\Documents\\Repos\\myProject"
}
```

#### 2. Forward Slash Paths (Unix-style)
```json
{
  "path": "C:/Users/AlexJ/Documents/Repos/myProject"
}
```

#### 3. UNC Paths (Network Shares)
```json
{
  "path": "\\\\server\\share\\repository",
  "options": {
    "networkTimeout": 15000
  }
}
```

#### 4. Relative Paths
```json
{
  "path": "./projects/myProject"
}
```

### macOS/Linux Paths

#### 1. Absolute Paths
```json
{
  "path": "/home/user/projects/myProject"
}
```

#### 2. Home Directory Paths
```json
{
  "path": "~/projects/myProject"
}
```

#### 3. Relative Paths
```json
{
  "path": "./projects/myProject"
}
```

## Error Codes

### Path Validation Errors

| Error Code               | Description                  | Common Causes                        | Solutions                                     |
| ------------------------ | ---------------------------- | ------------------------------------ | --------------------------------------------- |
| `PATH_NOT_FOUND`         | Path does not exist          | Typo in path, deleted directory      | Verify path exists                            |
| `PATH_INVALID_FORMAT`    | Invalid path format          | Wrong separators, invalid characters | Use correct platform format                   |
| `PATH_TOO_LONG`          | Path exceeds platform limits | Very long path names                 | Enable long path support or use shorter paths |
| `PATH_RESERVED_NAME`     | Contains reserved names      | Using CON, PRN, AUX, etc.            | Avoid reserved names                          |
| `PATH_PERMISSION_DENIED` | Insufficient permissions     | No read/write access                 | Grant appropriate permissions                 |
| `NETWORK_ERROR`          | Network path issues          | Server unavailable, credentials      | Check network connectivity                    |
| `TIMEOUT_ERROR`          | Validation timeout           | Slow network, large directory        | Increase timeout or check performance         |

### Warning Codes

| Warning Code         | Description                     | Impact                                     | Recommendation                           |
| -------------------- | ------------------------------- | ------------------------------------------ | ---------------------------------------- |
| `PATH_LONG`          | Path is longer than recommended | May cause compatibility issues             | Consider shorter paths                   |
| `PATH_SPECIAL_CHARS` | Contains special characters     | May cause issues on some systems           | Use standard characters when possible    |
| `PATH_CASE_MISMATCH` | Case doesn't match file system  | May cause issues on case-sensitive systems | Use correct case                         |
| `NETWORK_SLOW`       | Network path is slow to access  | May cause timeouts during analysis         | Consider local copy or increase timeouts |

## Platform-Specific Considerations

### Windows

- **Path Length**: Standard limit is 260 characters, but long path support can extend this to 32,767 characters
- **Case Sensitivity**: Windows is case-insensitive by default
- **Reserved Names**: CON, PRN, AUX, NUL, COM1-9, LPT1-9 are reserved
- **Drive Letters**: Must be A-Z followed by colon
- **UNC Paths**: Network paths starting with `\\` are supported

### macOS/Linux

- **Case Sensitivity**: File systems are typically case-sensitive
- **Hidden Files**: Files starting with `.` are hidden
- **Permissions**: Unix-style permissions (read, write, execute)
- **Symbolic Links**: Can be resolved if `resolveSymlinks` option is enabled

## Usage Examples

### Basic Path Validation

```javascript
// Validate a simple Windows path
const response = await fetch('/api/validate-path', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    path: 'C:/Users/AlexJ/Documents/Repos/myProject'
  })
});

const result = await response.json();
console.log('Path is valid:', result.isValid);
```

### Advanced Validation with Options

```javascript
// Validate with permission checking and content validation
const response = await fetch('/api/validate-path', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    path: '\\\\server\\share\\repository',
    options: {
      checkPermissions: true,
      networkTimeout: 15000,
      validateContents: true
    }
  })
});

const result = await response.json();

if (!result.isValid) {
  console.error('Validation errors:', result.errors);
  console.log('Suggestions:', result.suggestions);
} else {
  console.log('Normalized path:', result.normalizedPath);
  console.log('Permissions:', result.pathInfo.permissions);
}
```

### Error Handling

```javascript
try {
  const response = await fetch('/api/validate-path', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      path: 'invalid-path'
    })
  });

  const result = await response.json();
  
  if (!result.isValid) {
    // Handle validation errors
    result.errors.forEach(error => {
      console.error(`${error.code}: ${error.message}`);
      if (error.suggestion) {
        console.log(`Suggestion: ${error.suggestion}`);
      }
    });
    
    // Show user-friendly suggestions
    if (result.suggestions.length > 0) {
      console.log('Try these alternatives:');
      result.suggestions.forEach(suggestion => {
        console.log(`- ${suggestion}`);
      });
    }
  }
} catch (error) {
  console.error('API request failed:', error);
}
```

## Integration with Repository Analysis

The Path Validation API is automatically used by the repository analysis endpoints to ensure paths are valid before starting analysis:

```javascript
// The analyze endpoint automatically validates paths
const analysisResponse = await fetch('/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    path: 'C:/Users/AlexJ/Documents/Repos/myProject',
    options: {
      mode: 'standard',
      includeLLMAnalysis: false
    }
  })
});

// If path validation fails, you'll get a 400 error with validation details
if (analysisResponse.status === 400) {
  const error = await analysisResponse.json();
  console.error('Path validation failed:', error.details);
}
```

## Performance Considerations

- **Caching**: Validated paths are cached for 5 minutes by default to improve performance
- **Timeouts**: Network path validation has configurable timeouts (default: 10 seconds)
- **Batch Validation**: For multiple paths, make concurrent requests rather than sequential ones
- **Permission Checking**: Can be disabled for faster validation if permissions are not critical

## Security Considerations

- **Path Traversal**: The API automatically prevents directory traversal attacks
- **Sensitive Paths**: System directories and sensitive locations are flagged
- **Network Credentials**: UNC path credentials are never logged or exposed
- **Sanitization**: All path inputs are sanitized before processing

## Rate Limiting

- **Validation Endpoint**: 60 requests per minute per IP
- **Burst Limit**: Up to 10 concurrent requests
- **Timeout**: Individual requests timeout after 30 seconds

## Monitoring and Logging

All path validation operations are logged with:
- Request details (path, options)
- Validation results (success/failure)
- Performance metrics (validation time)
- Error details (if validation fails)

Enable detailed logging:
```bash
LOG_LEVEL=debug
LOG_PATH_OPERATIONS=true
```