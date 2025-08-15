# PathHandler Integration Tests

This directory contains comprehensive integration tests for the PathHandler service, covering platform-specific functionality, cross-platform compatibility, performance characteristics, and end-to-end user workflows.

## Test Structure

### Platform-Specific Tests (`path-handler-platform.test.ts`)
- **Windows Path Format Handling**: Tests Windows-specific path formats including backslashes, forward slashes, UNC paths, drive letters, and reserved names
- **Cross-Platform Compatibility**: Validates consistent behavior across Windows, macOS, and Linux
- **Real File System Integration**: Tests actual file system operations, permission checking, and metadata retrieval
- **Error Handling**: Comprehensive testing of error scenarios and user-friendly error messages

### End-to-End Workflow Tests (`path-handler-e2e.test.ts`)
- **Repository Analysis Integration**: Tests complete workflows from path input to repository analysis
- **User Workflow Scenarios**: Simulates real user interactions with different path formats
- **API Integration**: Tests integration with backend API endpoints
- **Batch Processing**: Tests handling of multiple repositories with different path formats

### Performance Tests (`path-handler-performance.test.ts`)
- **Performance Benchmarks**: Measures path validation and permission checking performance
- **Timeout Handling**: Tests timeout mechanisms and operation cancellation
- **Resource Usage**: Monitors memory usage and resource cleanup
- **Concurrent Operations**: Tests performance under concurrent load

## Requirements Coverage

These tests address the following requirements from the specification:

- **1.1**: Windows path format handling (backslash, forward slash, UNC)
- **1.2**: Cross-platform path normalization and validation
- **7.1**: Platform-specific validation rules and error handling
- **7.2**: Cross-platform compatibility and consistent behavior
- **8.1**: Timeout handling for path operations (5-second limit)
- **8.5**: Performance monitoring and optimization

## Running the Tests

### Prerequisites
- Node.js 18+ or Bun runtime
- Backend server dependencies installed
- Sufficient disk space for temporary test files

### Run All Integration Tests
```bash
# From project root
npm run test:integration

# Or with Bun
bun test tests/integration/
```

### Run Specific Test Suites
```bash
# Platform-specific tests only
npm run test tests/integration/path-handler-platform.test.ts

# End-to-end workflow tests
npm run test tests/integration/path-handler-e2e.test.ts

# Performance tests only
npm run test tests/integration/path-handler-performance.test.ts
```

### Run with Coverage
```bash
npm run test:integration -- --coverage
```

### Run in CI Environment
```bash
CI=true npm run test:integration
```

## Test Configuration

### Timeouts
- **Test Timeout**: 60 seconds (configurable via `TEST_TIMEOUT` env var)
- **Hook Timeout**: 30 seconds for setup/teardown
- **CI Timeout**: 120 seconds in CI environments

### Environment Variables
- `NODE_ENV=test`: Ensures test environment configuration
- `LOG_LEVEL=ERROR`: Reduces log noise during tests
- `SILENT_TESTS=true`: Suppresses console output
- `TEST_TMP_DIR`: Temporary directory for test files
- `CI=true`: Enables CI-specific configurations

### Resource Management
- Tests create temporary files in system temp directory
- Automatic cleanup after each test and test suite
- Memory usage monitoring in performance tests
- Concurrent operation limits to prevent resource exhaustion

## Test Data and Scenarios

### Path Format Test Cases
- **Windows**: `C:\Users\Test\Documents`, `D:/Projects/App`, `\\server\share\folder`
- **Unix-like**: `/home/user/documents`, `/var/log/app.log`, `./relative/path`
- **Mixed**: `C:/Users\Test/Documents\file.txt`
- **Invalid**: Reserved names, invalid characters, paths too long

### Performance Benchmarks
- **Single Path**: < 1 second validation time
- **Batch Processing**: < 100ms per path in batches
- **Memory Usage**: < 100MB growth for 200 path operations
- **Concurrent Operations**: Efficient parallel processing

### Error Scenarios
- Non-existent paths
- Permission denied scenarios
- Invalid path formats
- Network path accessibility issues
- Timeout conditions

## Troubleshooting

### Common Issues

1. **Test Timeouts**
   - Increase timeout values for slower systems
   - Check for hanging file system operations
   - Verify cleanup of test resources

2. **Permission Errors**
   - Ensure test runner has appropriate file system permissions
   - Some system paths may require elevated privileges
   - Skip permission tests on restricted systems

3. **Platform-Specific Failures**
   - Windows: Check for long path support
   - Unix: Verify case sensitivity handling
   - macOS: Check for special file system behaviors

4. **Resource Cleanup**
   - Temporary files should be automatically cleaned up
   - Check system temp directory if tests fail
   - Force cleanup with `npm run test:cleanup`

### Debug Mode
```bash
# Enable verbose logging
LOG_LEVEL=DEBUG npm run test:integration

# Run single test with debugging
npm run test tests/integration/path-handler-platform.test.ts -- --reporter=verbose
```

## Performance Metrics

The tests automatically collect and report performance metrics:

- **Operation Duration**: Time taken for each operation type
- **Success Rate**: Percentage of successful operations
- **Memory Usage**: Heap memory growth during operations
- **Throughput**: Operations per second for batch processing

Metrics are logged at the end of test runs and can be used for performance regression detection.

## Contributing

When adding new integration tests:

1. Follow the existing test structure and naming conventions
2. Include appropriate cleanup in `afterEach`/`afterAll` hooks
3. Add performance metrics collection for new operations
4. Update this README with new test scenarios
5. Ensure tests work across all supported platforms

## Related Documentation

- [PathHandler Service Documentation](../../packages/backend/src/services/path-handler.service.ts)
- [Logger Service Documentation](../../packages/backend/src/services/logger.service.ts)
- [Requirements Document](../../.kiro/specs/windows-path-handling-and-logging/requirements.md)
- [Design Document](../../.kiro/specs/windows-path-handling-and-logging/design.md)