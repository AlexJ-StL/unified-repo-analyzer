# Enhanced Error Handling and Logging System

This document describes the comprehensive error handling and logging system implemented for the Unified Repository Analyzer project.

## Overview

The enhanced error handling system provides:

- **Clear error messages** with actionable suggestions
- **Dependency issue detection** and resolution guidance
- **Enhanced TypeScript error reporting** with specific file and line information
- **Build script failure logging** with command context
- **Automated recovery suggestions** for common issues
- **Comprehensive diagnostics** and health checks

## Components

### 1. Error Handling Utilities (`packages/shared/src/utils/error-handling.ts`)

#### Core Classes

- **`EnhancedErrorClass`**: Extended error class with comprehensive metadata
- **`ErrorHandler`**: Singleton service for handling different error types
- **`ErrorAnalyzer`**: Utility for parsing and analyzing error outputs
- **`EnhancedLogger`**: Console logger with color-coded output

#### Error Categories

```typescript
enum ErrorCategory {
  BUILD = 'BUILD',
  DEPENDENCY = 'DEPENDENCY',
  TYPESCRIPT = 'TYPESCRIPT',
  RUNTIME = 'RUNTIME',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  FILE_SYSTEM = 'FILE_SYSTEM',
}
```

#### Error Severity Levels

```typescript
enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}
```

### 2. Build Utilities (`packages/shared/src/utils/build-utils.ts`)

#### Core Classes

- **`BuildExecutor`**: Enhanced build command executor with error handling
- **`BuildResult`**: Comprehensive build result information
- **`PackageBuildInfo`**: Package metadata and build configuration

#### Key Features

- **Retry Logic**: Automatic retry with exponential backoff
- **Timeout Handling**: Configurable command timeouts
- **Dependency Validation**: Check package dependencies before building
- **Comprehensive Logging**: Detailed build logs with context

### 3. Build Doctor (`scripts/build-doctor.ts`)

A comprehensive diagnostic tool that:

- **Analyzes project structure** and configuration
- **Checks dependencies** for common issues
- **Validates TypeScript configuration**
- **Tests build environment** requirements
- **Provides automated recovery actions**

#### Usage

```bash
# Run diagnostics
bun run build:doctor

# Run diagnostics and execute safe automated fixes
bun run build:doctor:fix

# Run with specific project path
bun run scripts/build-doctor.ts /path/to/project
```

### 4. Enhanced Build Script (`scripts/enhanced-build.ts`)

An improved build script that:

- **Uses comprehensive error handling**
- **Provides detailed progress feedback**
- **Generates build reports**
- **Offers recovery suggestions**

#### Usage

```bash
# Run enhanced build
bun run build

# Run with verbose logging
bun run build --verbose

# Run legacy build (fallback)
bun run build:legacy
```

## Error Types and Handling

### 1. Build Errors

**Detection**: Command exit codes, stderr output patterns
**Context**: Package name, command, working directory, environment
**Suggestions**: 
- Install missing dependencies
- Fix TypeScript configuration
- Clear build caches
- Increase memory limits

**Example**:
```typescript
const buildError = errorHandler.handleBuildError(
  new Error('Build failed'),
  {
    package: 'frontend',
    command: 'bun run build',
    exitCode: 2,
    stderr: 'TypeScript compilation failed'
  }
);
```

### 2. TypeScript Errors

**Detection**: TS error codes, file patterns
**Context**: File path, line number, column, error code
**Suggestions**:
- Fix type mismatches
- Add missing imports
- Update type definitions
- Check property names

**Example**:
```typescript
const tsError = errorHandler.handleTypeScriptError(
  new Error('Type error'),
  {
    file: 'src/components/App.tsx',
    line: 42,
    column: 15,
    code: 'TS2322',
    category: 'ERROR'
  }
);
```

### 3. Dependency Errors

**Detection**: npm/bun error patterns, ERESOLVE messages
**Context**: Package name, version conflicts, missing peers
**Suggestions**:
- Install missing peer dependencies
- Resolve version conflicts
- Clear package manager cache
- Force dependency resolution

**Example**:
```typescript
const depError = errorHandler.handleDependencyError(
  new Error('Dependency resolution failed'),
  {
    package: 'react',
    missingPeers: ['react-dom'],
    conflictsWith: ['@types/react@17.0.0']
  }
);
```

### 4. Validation Errors

**Detection**: Zod validation failures
**Context**: Field paths, validation rules
**Suggestions**:
- Fix data types
- Adjust value ranges
- Add required fields

## Diagnostic Checks

The Build Doctor performs comprehensive checks:

### Project Structure
- ✅ Root package.json exists and is valid
- ✅ Workspace configuration is present
- ✅ Packages directory structure
- ✅ Individual package configurations

### Dependencies
- ✅ node_modules directory exists
- ✅ Lock file is present
- ✅ TypeScript is installed
- ✅ No dependency conflicts
- ✅ Peer dependencies are satisfied

### TypeScript Configuration
- ✅ tsconfig.json files exist
- ✅ TypeScript compilation succeeds
- ✅ Type definitions are accessible

### Build Scripts
- ✅ Essential build scripts are configured
- ✅ Script syntax is valid
- ✅ Commands are executable

### Environment
- ✅ Node.js version meets requirements
- ✅ Package managers are installed
- ✅ Sufficient memory is available
- ✅ File permissions are correct

### Common Issues
- ✅ node_modules integrity
- ✅ TypeScript cache status
- ✅ File permission issues
- ✅ Large dependency trees

## Recovery Actions

The system can automatically execute safe recovery actions:

### Low Risk (Automated)
- Install missing dependencies
- Clear and reinstall node_modules
- Install TypeScript compiler
- Clear package manager cache

### Medium Risk (Manual)
- Fix TypeScript compilation errors
- Resolve version conflicts
- Update configuration files

### High Risk (Manual)
- Upgrade Node.js version
- Modify system permissions
- Change project structure

## Usage Examples

### Basic Error Handling

```typescript
import { ErrorHandler, ErrorCategory, ErrorSeverity } from '@unified-repo-analyzer/shared';

const errorHandler = ErrorHandler.getInstance();

try {
  // Some operation that might fail
  await buildPackage();
} catch (error) {
  const enhancedError = errorHandler.handleBuildError(error, {
    package: 'frontend',
    command: 'bun run build',
    exitCode: 1
  });
  
  // Error is automatically logged with suggestions
  console.log(`Error ID: ${enhancedError.id}`);
  console.log(`Suggestions: ${enhancedError.suggestions.length}`);
}
```

### Build Process with Error Handling

```typescript
import { runBuildProcess } from '@unified-repo-analyzer/shared';

const success = await runBuildProcess('./my-project');

if (!success) {
  console.log('Build failed - check logs for details');
  console.log('Run: bun run build:doctor for diagnostics');
}
```

### Custom Error Logging

```typescript
import { EnhancedLogger } from '@unified-repo-analyzer/shared';

// Success message
EnhancedLogger.logSuccess('Build completed successfully!');

// Warning message
EnhancedLogger.logWarning('Some tests were skipped');

// Error with full context
EnhancedLogger.logError({
  id: 'CUSTOM_ERROR',
  category: ErrorCategory.BUILD,
  severity: ErrorSeverity.HIGH,
  title: 'Custom Build Error',
  message: 'Something went wrong',
  suggestions: [
    { action: 'Try again', description: 'Retry the operation', automated: false }
  ],
  timestamp: new Date()
});
```

## Configuration

### Environment Variables

- `DEBUG=1`: Enable verbose logging
- `NODE_OPTIONS="--max-old-space-size=4096"`: Increase memory limit

### Build Configuration

The system respects standard build configuration files:
- `package.json` scripts
- `tsconfig.json` TypeScript settings
- `.env` environment variables

## Integration

### With Existing Code

The error handling system is designed to integrate seamlessly:

```typescript
// Replace basic error handling
try {
  await someOperation();
} catch (error) {
  console.error('Operation failed:', error.message);
}

// With enhanced error handling
try {
  await someOperation();
} catch (error) {
  const enhancedError = errorHandler.handleRuntimeError(error, context);
  // Automatic logging with suggestions
}
```

### With CI/CD

The system provides structured output suitable for CI/CD:

```bash
# In CI pipeline
bun run build:doctor --fix
if [ $? -ne 0 ]; then
  echo "Build environment issues detected"
  exit 1
fi

bun run build
```

## Troubleshooting

### Common Issues

1. **"Module not found" errors**
   - Run `bun run build:doctor` to check dependencies
   - Try `bun install --force` to refresh dependencies

2. **TypeScript compilation errors**
   - Check specific file and line mentioned in error
   - Verify import statements and type definitions
   - Run `bun run build:shared` first to build shared types

3. **Build timeouts**
   - Increase memory limit with `NODE_OPTIONS`
   - Check for infinite loops in build scripts
   - Run packages individually to isolate issues

4. **Permission errors**
   - Check file permissions on project directory
   - Ensure node_modules is writable
   - Run with appropriate user permissions

### Getting Help

1. **Run diagnostics**: `bun run build:doctor`
2. **Check build report**: Look for `build-report.json`
3. **Enable verbose logging**: Add `--verbose` flag
4. **Review error suggestions**: Each error includes actionable suggestions

## Future Enhancements

- **Integration with IDE**: Real-time error reporting
- **Machine learning**: Pattern recognition for common issues
- **Remote diagnostics**: Send anonymized error reports
- **Performance monitoring**: Track build performance over time
- **Custom recovery actions**: User-defined automated fixes