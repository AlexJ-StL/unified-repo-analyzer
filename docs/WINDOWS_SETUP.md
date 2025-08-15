# Windows Setup Guide

## Overview

This guide provides Windows-specific setup instructions and configuration requirements for the unified-repo-analyzer application. It addresses common Windows path handling issues and provides solutions for optimal performance.

## Prerequisites

### System Requirements
- Windows 10 or Windows Server 2016 (minimum)
- Node.js 18.0 or higher
- PowerShell 5.1 or PowerShell Core 7.0+
- Administrator privileges (for initial setup)

### Recommended Tools
- Windows Terminal (for better console experience)
- Git for Windows (with proper path configuration)
- Visual Studio Code (with Windows-specific extensions)

## Installation

### 1. Node.js Setup

Download and install Node.js from [nodejs.org](https://nodejs.org/):

```powershell
# Verify installation
node --version
npm --version
```

### 2. Application Installation

```powershell
# Clone the repository
git clone https://github.com/your-org/unified-repo-analyzer.git
cd unified-repo-analyzer

# Install dependencies
npm install

# Build the application
npm run build
```

### 3. Windows-Specific Configuration

Create a Windows-specific environment file:

```powershell
# Create .env.windows
Copy-Item .env.example .env.windows
```

Edit `.env.windows` with Windows-specific settings:

```bash
# Windows-specific paths (use forward slashes or escaped backslashes)
DATA_DIR=./data
CACHE_DIR=./data/cache
INDEX_DIR=./data/index
LOG_DIR=./logs
BACKUP_DIR=./backups

# Windows path handling
WINDOWS_LONG_PATH_SUPPORT=true
WINDOWS_UNC_PATH_SUPPORT=true
WINDOWS_CASE_SENSITIVE=false

# Performance settings for Windows
MAX_FILE_SIZE=10485760
MAX_FILES_PER_REPO=10000
MAX_ANALYSIS_TIME=300000

# Windows-specific logging
LOG_LEVEL=info
LOG_FORMAT=JSON
LOG_WINDOWS_EVENTS=true
```

## Path Configuration

### Supported Path Formats

The application supports multiple Windows path formats:

#### 1. Backslash Paths (Traditional Windows)
```
C:\Users\AlexJ\Documents\Repos\myProject
D:\Development\Projects\web-app
```

#### 2. Forward Slash Paths (Unix-style)
```
C:/Users/AlexJ/Documents/Repos/myProject
D:/Development/Projects/web-app
```

#### 3. UNC Paths (Network Shares)
```
\\server\share\folder
\\192.168.1.100\projects\repo
```

#### 4. Relative Paths
```
.\projects\myProject
..\shared\libraries
```

### Path Length Limitations

Windows has path length limitations that the application handles automatically:

- **Standard paths**: 260 characters maximum
- **Long path support**: Up to 32,767 characters (requires Windows 10 version 1607+)

Enable long path support:

```powershell
# Run as Administrator
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

### Reserved Names

The application automatically validates against Windows reserved names:
- Device names: `CON`, `PRN`, `AUX`, `NUL`
- Serial ports: `COM1` through `COM9`
- Parallel ports: `LPT1` through `LPT9`

## Permission Configuration

### File System Permissions

Ensure the application has appropriate permissions:

```powershell
# Grant read/write permissions to application directory
icacls "C:\path\to\unified-repo-analyzer" /grant "Users:(OI)(CI)F" /T

# Grant permissions to data directories
icacls "C:\path\to\data" /grant "Users:(OI)(CI)F" /T
icacls "C:\path\to\logs" /grant "Users:(OI)(CI)F" /T
```

### Repository Access Permissions

For analyzing repositories, ensure access to:
- Repository root directory
- All subdirectories and files
- Network shares (if using UNC paths)

```powershell
# Check repository permissions
Get-Acl "C:\path\to\repository" | Format-List

# Test repository access
Test-Path "C:\path\to\repository" -PathType Container
```

## Windows-Specific Features

### 1. Drive Letter Validation

The application validates Windows drive letters:
- Valid: `A:` through `Z:`
- Case insensitive: `c:\` equals `C:\`
- Network drives: Mapped network drives are supported

### 2. Case Sensitivity

Windows file systems are case-insensitive by default:
- `MyProject` equals `myproject`
- Path normalization preserves original casing
- Comparisons are case-insensitive

### 3. Special Characters

Supported special characters in paths:
- Spaces: `C:\Program Files\MyApp`
- Unicode: `C:\Users\José\Documents`
- Accented characters: `C:\Projets\Café`

Unsupported characters (automatically detected):
- `< > : " | ? * \0`

## Performance Optimization

### 1. Antivirus Exclusions

Add exclusions to improve performance:

```powershell
# Windows Defender exclusions (run as Administrator)
Add-MpPreference -ExclusionPath "C:\path\to\unified-repo-analyzer"
Add-MpPreference -ExclusionPath "C:\path\to\data"
Add-MpPreference -ExclusionPath "C:\path\to\logs"
Add-MpPreference -ExclusionProcess "node.exe"
```

### 2. Windows Search Indexing

Exclude application directories from Windows Search:

1. Open **Indexing Options** from Control Panel
2. Click **Modify**
3. Uncheck application and data directories
4. Click **OK**

### 3. File System Optimization

For better performance on Windows:

```powershell
# Disable 8.3 filename generation (if not needed)
fsutil 8dot3name set C: 1

# Enable NTFS compression for log files (optional)
compact /c /s:"C:\path\to\logs" /i
```

## Troubleshooting

### Common Windows Issues

#### 1. "Folder cannot be found" Error

**Symptoms**: Application shows "folder cannot be found" for valid paths

**Solutions**:
```powershell
# Check path format
Test-Path "C:\Users\AlexJ\Documents\Repos\myProject"

# Try forward slash format
Test-Path "C:/Users/AlexJ/Documents/Repos/myProject"

# Check permissions
Get-Acl "C:\Users\AlexJ\Documents\Repos\myProject"
```

#### 2. Application Becomes Unresponsive

**Symptoms**: Application freezes when entering paths

**Solutions**:
1. Check antivirus real-time scanning
2. Verify path length limitations
3. Test with shorter paths
4. Check network connectivity (for UNC paths)

#### 3. Permission Denied Errors

**Symptoms**: Access denied when analyzing repositories

**Solutions**:
```powershell
# Run application as Administrator (temporary)
Start-Process powershell -Verb runAs

# Grant permanent permissions
icacls "C:\path\to\repository" /grant "$env:USERNAME:(OI)(CI)F" /T

# Check effective permissions
icacls "C:\path\to\repository" /T | findstr $env:USERNAME
```

#### 4. Long Path Issues

**Symptoms**: Errors with paths longer than 260 characters

**Solutions**:
```powershell
# Enable long path support (Windows 10 1607+)
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# Restart required after enabling
Restart-Computer
```

### Network Path Issues

#### UNC Path Access

```powershell
# Test UNC path connectivity
Test-NetConnection -ComputerName "server" -Port 445

# Map network drive temporarily
New-PSDrive -Name "Z" -PSProvider FileSystem -Root "\\server\share"

# Access mapped drive
Test-Path "Z:\folder"
```

#### Network Credentials

```powershell
# Store network credentials
cmdkey /add:server /user:domain\username /pass:password

# Test stored credentials
net use \\server\share
```

## Environment-Specific Configuration

### Development Environment

```bash
# .env.development
NODE_ENV=development
LOG_LEVEL=debug
WINDOWS_LONG_PATH_SUPPORT=true
WINDOWS_UNC_PATH_SUPPORT=true
LOG_WINDOWS_EVENTS=true
```

### Production Environment

```bash
# .env.production
NODE_ENV=production
LOG_LEVEL=info
WINDOWS_LONG_PATH_SUPPORT=true
WINDOWS_UNC_PATH_SUPPORT=false
LOG_WINDOWS_EVENTS=false
ENABLE_METRICS=true
```

## Security Considerations

### 1. Path Traversal Prevention

The application automatically prevents:
- Directory traversal attacks (`../../../`)
- Absolute path injection
- Symbolic link exploitation

### 2. Permission Validation

Before accessing any path, the application:
- Validates user permissions
- Checks path accessibility
- Verifies path format

### 3. Sensitive Data Protection

- Paths containing sensitive information are redacted in logs
- User credentials are never logged
- Network paths are sanitized

## Monitoring and Logging

### Windows Event Log Integration

Enable Windows Event Log integration:

```bash
LOG_WINDOWS_EVENTS=true
WINDOWS_EVENT_SOURCE=UnifiedRepoAnalyzer
```

### Performance Counters

Monitor application performance:

```powershell
# Monitor file system operations
Get-Counter "\Process(node)\IO Read Operations/sec"
Get-Counter "\Process(node)\IO Write Operations/sec"

# Monitor memory usage
Get-Counter "\Process(node)\Working Set"
```

### Log File Locations

Default Windows log locations:
- Application logs: `%APPDATA%\unified-repo-analyzer\logs`
- System logs: `%PROGRAMDATA%\unified-repo-analyzer\logs`
- User logs: `%USERPROFILE%\unified-repo-analyzer\logs`

## Support and Resources

### Windows-Specific Documentation
- [Windows File System Limits](https://docs.microsoft.com/en-us/windows/win32/fileio/filesystem-functionality-comparison)
- [Long Path Support](https://docs.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation)
- [UNC Path Format](https://docs.microsoft.com/en-us/dotnet/standard/io/file-path-formats)

### PowerShell Resources
- [PowerShell Documentation](https://docs.microsoft.com/en-us/powershell/)
- [File System Cmdlets](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.management/)

### Troubleshooting Tools
- Windows Event Viewer
- Process Monitor (ProcMon)
- Resource Monitor
- PowerShell ISE/VS Code