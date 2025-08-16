# Troubleshooting Guide

## Overview

This guide provides solutions for common issues encountered when using the unified-repo-analyzer application, with special focus on Windows path handling problems and logging-related issues. The guide is organized by problem category to help you quickly find relevant solutions.

## Path-Related Issues

### Windows Path Problems

#### Issue: "Folder cannot be found" Error

**Symptoms:**
- Application displays "folder cannot be found" for valid Windows paths
- Error occurs with both backslash and forward slash paths
- Repository analysis fails to start

**Diagnosis:**
```bash
# Check if path exists and is accessible
Test-Path "C:\Users\AlexJ\Documents\Repos\myProject"

# Verify path format
echo "C:\Users\AlexJ\Documents\Repos\myProject" | findstr /R "^[A-Za-z]:\\"

# Check permissions
Get-Acl "C:\Users\AlexJ\Documents\Repos\myProject" | Format-List
```

**Solutions:**
1. **Try different path formats:**
   ```bash
   # Original backslash format
   C:\Users\AlexJ\Documents\Repos\myProject
   
   # Forward slash format (often works better)
   C:/Users/AlexJ/Documents/Repos/myProject
   
   # Escaped backslash format
   C:\\Users\\AlexJ\\Documents\\Repos\\myProject
   ```

2. **Check path length limitations:**
   ```powershell
   # Enable long path support (Windows 10 1607+)
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
   ```

3. **Verify permissions:**
   ```powershell
   # Grant read permissions
   icacls "C:\path\to\repository" /grant "$env:USERNAME:(OI)(CI)R" /T
   
   # Test access
   Get-ChildItem "C:\path\to\repository" -ErrorAction SilentlyContinue
   ```

#### Issue: Application Becomes Unresponsive with Path Input

**Symptoms:**
- Application freezes when entering paths in settings or analyze tabs
- No error messages displayed
- Application requires force-close

**Diagnosis:**
```bash
# Check for antivirus interference
Get-MpPreference | Select-Object -ExpandProperty ExclusionPath

# Monitor file system access
# Use Process Monitor (ProcMon) to track file system operations
```

**Solutions:**
1. **Add antivirus exclusions:**
   ```powershell
   # Windows Defender exclusions
   Add-MpPreference -ExclusionPath "C:\path\to\unified-repo-analyzer"
   Add-MpPreference -ExclusionPath "C:\path\to\repository"
   Add-MpPreference -ExclusionProcess "node.exe"
   ```

2. **Test with shorter paths:**
   ```bash
   # Try with a simple path first
   C:\temp\test-repo
   
   # Gradually test longer paths
   C:\Users\username\simple-project
   ```

3. **Check network connectivity (for UNC paths):**
   ```powershell
   # Test network path access
   Test-NetConnection -ComputerName "server" -Port 445
   net use \\server\share
   ```

#### Issue: UNC Path Access Problems

**Symptoms:**
- Network paths (\\server\share) fail to validate
- "Access denied" errors for network repositories
- Timeout errors with network paths

**Solutions:**
1. **Store network credentials:**
   ```powershell
   # Store credentials for network access
   cmdkey /add:server /user:domain\username /pass:password
   
   # Map network drive temporarily
   New-PSDrive -Name "Z" -PSProvider FileSystem -Root "\\server\share"
   ```

2. **Test network connectivity:**
   ```powershell
   # Test SMB connectivity
   Test-NetConnection -ComputerName "server" -Port 445
   
   # Test path access
   Test-Path "\\server\share\repository"
   ```

3. **Configure UNC path support:**
   ```bash
   # In .env file
   WINDOWS_UNC_PATH_SUPPORT=true
   NETWORK_TIMEOUT=30000
   ```

### Cross-Platform Path Issues

#### Issue: Path Format Inconsistencies

**Symptoms:**
- Paths work on one platform but fail on another
- Mixed path separators in logs
- Case sensitivity issues

**Solutions:**
1. **Use consistent path normalization:**
   ```javascript
   // Application automatically normalizes paths
   // Use forward slashes internally, display native format to users
   ```

2. **Check platform-specific settings:**
   ```bash
   # Linux/macOS
   CASE_SENSITIVE_PATHS=true
   
   # Windows
   CASE_SENSITIVE_PATHS=false
   WINDOWS_LONG_PATH_SUPPORT=true
   ```

## Logging Issues

### Missing or Incomplete Logs

#### Issue: Only Generic "HTTP Request" Entries

**Symptoms:**
- Logs show only "warn: HTTP Request" without details
- Missing error context and stack traces
- No request/response details

**Solutions:**
1. **Increase log level:**
   ```bash
   # In .env file
   LOG_LEVEL=debug
   LOG_HTTP_REQUESTS=true
   LOG_HTTP_BODIES=true
   LOG_INCLUDE_STACK_TRACE=true
   ```

2. **Enable detailed HTTP logging:**
   ```bash
   LOG_HTTP_HEADERS=true
   LOG_REQUEST_CORRELATION=true
   LOG_RESPONSE_TIMES=true
   ```

3. **Check log configuration:**
   ```bash
   # Verify logging is properly configured
   LOG_DIR=./logs
   LOG_FORMAT=JSON
   LOG_REDACT_SENSITIVE_DATA=true
   ```

#### Issue: Log Files Not Created

**Symptoms:**
- No log files in specified directory
- Console logging works but file logging doesn't
- Permission errors in console

**Solutions:**
1. **Check directory permissions:**
   ```powershell
   # Windows
   icacls ".\logs" /grant "$env:USERNAME:(OI)(CI)F" /T
   
   # Create directory if it doesn't exist
   New-Item -ItemType Directory -Path ".\logs" -Force
   ```

2. **Verify log directory configuration:**
   ```bash
   # Ensure LOG_DIR is set correctly
   LOG_DIR=./logs
   
   # Use absolute path if relative path fails
   LOG_DIR=C:/path/to/application/logs
   ```

3. **Check disk space:**
   ```powershell
   # Check available disk space
   Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, FreeSpace, Size
   ```

### Log Rotation and Management Issues

#### Issue: Large Log Files Consuming Disk Space

**Symptoms:**
- Log files growing to gigabytes
- Disk space warnings
- Application performance degradation

**Solutions:**
1. **Configure log rotation:**
   ```bash
   LOG_MAX_FILE_SIZE=10MB
   LOG_MAX_FILES=5
   LOG_ROTATE_DAILY=true
   ```

2. **Implement log cleanup:**
   ```powershell
   # Manual cleanup script
   Get-ChildItem ".\logs" -Name "*.log" | Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-30)} | Remove-Item
   ```

3. **Reduce log verbosity:**
   ```bash
   # Production settings
   LOG_LEVEL=info
   LOG_HTTP_BODIES=false
   LOG_DEBUG_INFO=false
   ```

## Performance Issues

### Slow Path Validation

#### Issue: Path Validation Takes Too Long

**Symptoms:**
- Long delays when entering paths
- Timeout errors during validation
- UI becomes unresponsive

**Solutions:**
1. **Enable path caching:**
   ```bash
   ENABLE_PATH_CACHE=true
   PATH_CACHE_TTL=300000  # 5 minutes
   ```

2. **Optimize validation settings:**
   ```bash
   PATH_VALIDATION_TIMEOUT=5000  # 5 seconds
   SKIP_DEEP_VALIDATION=true
   ```

3. **Check system resources:**
   ```powershell
   # Monitor CPU and memory usage
   Get-Counter "\Process(node)\% Processor Time"
   Get-Counter "\Process(node)\Working Set"
   ```

### Memory Usage Issues

#### Issue: High Memory Consumption During Analysis

**Symptoms:**
- Application uses excessive memory
- System becomes slow during analysis
- Out of memory errors

**Solutions:**
1. **Limit analysis scope:**
   ```bash
   MAX_FILES_PER_REPO=1000
   MAX_FILE_SIZE=1048576  # 1MB
   MAX_ANALYSIS_TIME=300000  # 5 minutes
   ```

2. **Enable streaming processing:**
   ```bash
   ENABLE_STREAMING=true
   CHUNK_SIZE=100
   ```

3. **Monitor memory usage:**
   ```bash
   ENABLE_METRICS=true
   LOG_PERFORMANCE_METRICS=true
   ```

## Configuration Issues

### Environment Variable Problems

#### Issue: Configuration Not Applied

**Symptoms:**
- Environment variables seem to be ignored
- Default values used instead of configured values
- Inconsistent behavior across environments

**Solutions:**
1. **Verify environment file loading:**
   ```bash
   # Check if .env file exists and is readable
   ls -la .env*
   
   # Verify NODE_ENV setting
   echo $NODE_ENV
   ```

2. **Check variable precedence:**
   ```bash
   # Environment variables override .env file
   # System environment > .env.local > .env.production > .env
   ```

3. **Validate configuration format:**
   ```bash
   # Ensure no spaces around equals sign
   LOG_LEVEL=debug  # Correct
   LOG_LEVEL = debug  # Incorrect
   ```

## Network and Connectivity Issues

### External Logging Service Problems

#### Issue: External Logging Service Connection Fails

**Symptoms:**
- Logs not appearing in external service
- Connection timeout errors
- Authentication failures

**Solutions:**
1. **Test connectivity:**
   ```powershell
   # Test HTTPS connectivity
   Test-NetConnection -ComputerName "logs.company.com" -Port 443
   
   # Test API endpoint
   Invoke-RestMethod -Uri "https://logs.company.com/api/health" -Method GET
   ```

2. **Verify credentials:**
   ```bash
   LOG_EXTERNAL_ENABLED=true
   LOG_EXTERNAL_URL=https://logs.company.com/api/ingest
   LOG_EXTERNAL_API_KEY=your-valid-api-key
   LOG_EXTERNAL_TIMEOUT=10000
   ```

3. **Check firewall settings:**
   ```powershell
   # Check Windows Firewall rules
   Get-NetFirewallRule -DisplayName "*unified-repo-analyzer*"
   ```

## Error Message Reference

### Common Error Codes

| Error Code               | Description                     | Solution                                     |
| ------------------------ | ------------------------------- | -------------------------------------------- |
| `PATH_NOT_FOUND`         | Specified path does not exist   | Verify path exists and is accessible         |
| `PATH_INVALID_FORMAT`    | Path format is invalid          | Use correct platform path format             |
| `PATH_TOO_LONG`          | Path exceeds platform limits    | Enable long path support or use shorter path |
| `PATH_PERMISSION_DENIED` | Insufficient permissions        | Grant read permissions to path               |
| `PATH_RESERVED_NAME`     | Path contains reserved names    | Avoid reserved names (CON, PRN, etc.)        |
| `TIMEOUT_ERROR`          | Operation exceeded time limit   | Increase timeout or check system performance |
| `NETWORK_ERROR`          | Network connectivity issues     | Check network connection and credentials     |
| `LOG_WRITE_ERROR`        | Cannot write to log file        | Check log directory permissions              |
| `CONFIG_INVALID`         | Configuration validation failed | Verify configuration format and values       |

### Windows-Specific Error Messages

| Error Message                                                       | Cause                    | Solution                                  |
| ------------------------------------------------------------------- | ------------------------ | ----------------------------------------- |
| "The filename, directory name, or volume label syntax is incorrect" | Invalid path format      | Use correct Windows path format           |
| "Access is denied"                                                  | Insufficient permissions | Run as administrator or grant permissions |
| "The system cannot find the path specified"                         | Path does not exist      | Verify path exists                        |
| "The specified network resource or device is no longer available"   | Network path issue       | Check network connectivity                |

## Diagnostic Tools

### Built-in Diagnostics

1. **Health Check Endpoint:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Log Level Testing:**
   ```bash
   # Test different log levels
   LOG_LEVEL=debug npm start
   ```

3. **Path Validation Testing:**
   ```javascript
   // Use built-in path validation endpoint
   POST /api/validate-path
   {
     "path": "C:/Users/AlexJ/Documents/Repos/myProject"
   }
   ```

### External Tools

1. **Process Monitor (Windows):**
   - Monitor file system access
   - Track registry access
   - Identify permission issues

2. **PowerShell Diagnostics:**
   ```powershell
   # Test path access
   Test-Path "C:\path\to\repository"
   
   # Check permissions
   Get-Acl "C:\path\to\repository"
   
   # Monitor performance
   Get-Counter "\Process(node)\% Processor Time"
   ```

3. **Network Diagnostics:**
   ```powershell
   # Test network connectivity
   Test-NetConnection -ComputerName "server" -Port 445
   
   # Trace network route
   tracert server
   ```

## Code Quality and Linting Issues

### Biome Configuration Problems

#### Issue: "The configuration file has errors" in VSCode

**Symptoms:**
- VSCode shows "The configuration file has errors. Biome will report only parsing errors until the configuration is fixed"
- Biome extension not working properly
- No linting or formatting happening

**Diagnosis:**
```bash
# Check if Biome is installed globally
biome --version

# Test configuration file validity
biome check biome.json

# Check for version mismatches
bunx biome --version  # Project version
biome --version       # Global version
```

**Solutions:**
1. **Install Biome globally:**
   ```bash
   npm install -g @biomejs/biome
   # or
   bun install -g @biomejs/biome
   ```

2. **Fix version mismatches:**
   ```bash
   # Update project to match global version
   bun add -D @biomejs/biome@latest
   
   # Or update global to match project
   npm install -g @biomejs/biome@2.1.2
   ```

3. **Remove conflicting VSCode settings:**
   ```json
   // Remove this from global VSCode settings if present
   // "biome.configurationPath": "${workspaceFolder}/biome.json"
   ```

4. **Run Biome migration if needed:**
   ```bash
   biome migrate --write
   ```

#### Issue: Biome Freezes on Large Codebases

**Symptoms:**
- `bun biome check --write` freezes and never completes
- High CPU usage with no progress
- Application becomes unresponsive during linting

**Solutions:**
1. **Use the chunked processing script:**
   ```bash
   # Check only (safe)
   powershell -ExecutionPolicy Bypass -File scripts/biome-backend-chunks.ps1
   
   # Auto-fix safe issues
   powershell -ExecutionPolicy Bypass -File scripts/biome-backend-chunks.ps1 -Write
   
   # Include unsafe fixes (review carefully)
   powershell -ExecutionPolicy Bypass -File scripts/biome-backend-chunks.ps1 -Write -Unsafe
   ```

2. **Process packages individually:**
   ```bash
   # Process each package separately
   bun biome check packages/shared --write --max-diagnostics=50
   bun biome check packages/frontend --write --max-diagnostics=50
   bun biome check packages/cli --write --max-diagnostics=50
   
   # Use the chunked script for backend
   powershell -ExecutionPolicy Bypass -File scripts/biome-backend-chunks.ps1 -Write
   ```

3. **Limit diagnostic output:**
   ```bash
   # Reduce diagnostic count to prevent overwhelming output
   bun biome check . --max-diagnostics=20
   ```

4. **Use targeted file patterns:**
   ```bash
   # Process specific file types only
   bun biome check "packages/**/*.ts" --write
   bun biome check "packages/**/*.tsx" --write
   ```

#### Issue: Biome Binary Not Found

**Symptoms:**
- "Unable to find the Biome binary" in VSCode output
- Extension fails to start
- No linting or formatting available

**Solutions:**
1. **Install Biome globally:**
   ```bash
   npm install -g @biomejs/biome
   ```

2. **Configure VSCode to use project binary:**
   ```json
   // In .vscode/settings.json
   {
     "biome.lspBin": "./node_modules/@biomejs/biome/bin/biome"
   }
   ```

3. **Add to PATH (Windows):**
   ```powershell
   # Add npm global bin to PATH
   $npmPath = npm config get prefix
   $env:PATH += ";$npmPath"
   ```

4. **Restart VSCode after installation:**
   - Close VSCode completely
   - Reopen the workspace
   - Check Biome extension status

### Performance Optimization for Large Projects

#### Issue: Slow Linting Performance

**Symptoms:**
- Biome takes a very long time to complete
- High memory usage during linting
- System becomes unresponsive

**Solutions:**
1. **Optimize Biome configuration:**
   ```json
   // In biome.json
   {
     "files": {
       "maxSize": 1048576,  // 1MB limit
       "ignoreUnknown": true,
       "experimentalScannerIgnores": [
         "**/node_modules/**",
         "**/dist/**",
         "**/build/**",
         "**/.cache/**"
       ]
     }
   }
   ```

2. **Use the chunked processing approach:**
   ```bash
   # Add to package.json scripts
   {
     "scripts": {
       "lint:chunks": "powershell -ExecutionPolicy Bypass -File scripts/biome-backend-chunks.ps1",
       "lint:chunks:fix": "powershell -ExecutionPolicy Bypass -File scripts/biome-backend-chunks.ps1 -Write",
       "lint:safe": "bun biome check packages/shared packages/frontend packages/cli --write"
     }
   }
   ```

3. **Exclude problematic directories:**
   ```json
   // In biome.json
   {
     "files": {
       "experimentalScannerIgnores": [
         "**/node_modules/**",
         "**/dist/**",
         "**/build/**",
         "**/coverage/**",
         "**/.next/**",
         "**/out/**",
         "**/.cache/**",
         "**/logs/**",
         "**/temp/**"
       ]
     }
   }
   ```

### Integration Issues

#### Issue: Biome Conflicts with Other Tools

**Symptoms:**
- Formatting conflicts between Biome and Prettier
- Linting rule conflicts with ESLint
- Build process failures

**Solutions:**
1. **Disable conflicting tools:**
   ```json
   // In .vscode/settings.json
   {
     "editor.defaultFormatter": "biomejs.biome",
     "prettier.enable": false,
     "eslint.enable": false
   }
   ```

2. **Configure file-specific formatters:**
   ```json
   {
     "[typescript]": {
       "editor.defaultFormatter": "biomejs.biome"
     },
     "[json]": {
       "editor.defaultFormatter": "biomejs.biome"
     },
     "[jsonc]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     }
   }
   ```

3. **Update build scripts:**
   ```json
   // In package.json
   {
     "scripts": {
       "lint": "bun biome check .",
       "lint:fix": "bun biome check . --write",
       "format": "bun biome format . --write",
       "check": "bun biome check . && bun run type-check"
     }
   }
   ```

### Common Biome Error Patterns

| Error Pattern             | Cause                                 | Solution                                     |
| ------------------------- | ------------------------------------- | -------------------------------------------- |
| `noExplicitAny`           | Using `any` type                      | Replace with specific types or use `unknown` |
| `noUnusedVariables`       | Unused variables                      | Remove or prefix with underscore             |
| `noConsole`               | Console statements in production code | Use proper logging or remove                 |
| `useNodejsImportProtocol` | Missing `node:` prefix                | Add `node:` prefix to Node.js imports        |
| `noNonNullAssertion`      | Using `!` operator                    | Use optional chaining `?.` instead           |

### Biome Configuration Best Practices

1. **Gradual adoption:**
   ```bash
   # Start with formatting only
   bun biome format . --write
   
   # Then add safe linting
   bun biome check . --write
   
   # Finally add unsafe fixes (review carefully)
   bun biome check . --write --unsafe
   ```

2. **Use appropriate diagnostic limits:**
   ```bash
   # For development
   bun biome check . --max-diagnostics=50
   
   # For CI/CD
   bun biome check . --max-diagnostics=0  # Show all
   ```

3. **Configure ignore patterns properly:**
   ```json
   {
     "files": {
       "experimentalScannerIgnores": [
         "**/.bun/**",
         "**/node_modules/**",
         "**/dist/**",
         "**/build/**"
       ]
     },
     "overrides": [
       {
         "includes": ["**/__tests__/**", "**/*.test.ts"],
         "linter": {
           "rules": {
             "suspicious": { "noExplicitAny": "warn" }
           }
         }
       }
     ]
   }
   ```

## Getting Help

### Log Analysis

When reporting issues, include:
1. **Application logs** (with DEBUG level enabled)
2. **System information** (OS version, Node.js version)
3. **Configuration files** (with sensitive data redacted)
4. **Steps to reproduce** the issue
5. **Expected vs actual behavior**

### Support Channels

1. **GitHub Issues:** For bug reports and feature requests
2. **Documentation:** Check latest documentation for updates
3. **Community Forums:** For general questions and discussions

### Emergency Procedures

If the application becomes completely unresponsive:

1. **Force stop the application:**
   ```powershell
   # Windows
   taskkill /f /im node.exe
   
   # Or find specific process
   Get-Process node | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
   ```

2. **Clear cache and temporary files:**
   ```bash
   rm -rf ./data/cache
   rm -rf ./logs/*.log
   ```

3. **Reset configuration:**
   ```bash
   cp .env.example .env
   ```

4. **Restart with minimal configuration:**
   ```bash
   LOG_LEVEL=error npm start
   ```