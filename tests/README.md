# Test Suite Documentation

This document describes the comprehensive test suite for the Unified Repository Analyzer.

## Overview

The test suite is designed to ensure reliability, performance, and correctness across all components of the system. It includes multiple types of tests:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test interactions between components
- **End-to-End Tests**: Test complete user workflows
- **Performance Tests**: Validate system performance under load
- **CLI Tests**: Test command-line interface functionality

## Test Structure

```
tests/
├── e2e/                    # End-to-end tests
│   ├── setup.ts           # Test utilities and fixtures
│   ├── analysis.test.ts   # Repository analysis workflows
│   ├── performance.test.ts # Performance testing
│   └── cli.test.ts        # CLI functionality tests
├── fixtures/              # Test data and mock repositories
├── utils/                 # Test utilities and helpers
├── setup.ts              # Global test configuration
└── README.md             # This file
```

## Running Tests

### All Tests

```bash
# Run complete test suite
bun run test

# Run with coverage
bun run test:coverage

# Run comprehensive test suite with reporting
bun run test:full
```

### Specific Test Types

```bash
# Unit tests only
bun run test:unit

# Integration tests
bun run test:integration

# End-to-end tests
bun run test:e2e

# Performance tests
bun run test:performance

# CLI tests
bun run test:cli
```

### Package-Specific Tests

```bash
# Backend tests
bun run test:backend

# Frontend tests
bun run test:frontend

# CLI package tests
bun run test:cli-package

# Shared utilities tests
bun run test:shared
```

## Test Configuration

### Environment Variables

```bash
# Test environment
NODE_ENV=test

# Test timeouts
TEST_TIMEOUT=30000

# Performance test settings
PERFORMANCE_TEST_ENABLED=true
LARGE_REPO_TEST_SIZE=1000
CONCURRENT_TEST_COUNT=10

# Mock settings
MOCK_LLM_PROVIDERS=true
MOCK_NETWORK_REQUESTS=true

# Coverage settings
COVERAGE_THRESHOLD=80
```

### Configuration Files

- `vitest.config.ts` - Main test configuration
- `.env.test` - Test environment variables
- `tests/setup.ts` - Global test setup

## Test Utilities

### Test Repository Creation

```typescript
import { createTestRepository, TEST_REPOSITORIES } from './e2e/setup';

// Create a test repository with predefined structure
const repo = await createTestRepository('test-name', TEST_REPOSITORIES.simpleJavaScript);

// Custom repository structure
const customRepo = await createTestRepository('custom', {
  'package.json': JSON.stringify({ name: 'test' }),
  'index.js': 'console.log("Hello");'
});

// Cleanup
await repo.cleanup();
```

### Test Server Management

```typescript
import { startTestServer } from './e2e/setup';

// Start backend server for testing
const server = await startTestServer(3001);

// Use server
const response = await axios.get(`${server.baseUrl}/api/health`);

// Cleanup
await server.stop();
```

### Performance Monitoring

```typescript
import { PerformanceMonitor } from './e2e/setup';

const perfMonitor = new PerformanceMonitor();

// Start timing
const endTimer = perfMonitor.startTimer('operation-name');

// ... perform operation ...

// End timing
const duration = endTimer();

// Get statistics
const stats = perfMonitor.getStats('operation-name');
console.log(`Average: ${stats.avg}ms, P95: ${stats.p95}ms`);
```

## Test Data

### Predefined Test Repositories

The test suite includes several predefined repository structures:

#### `TEST_REPOSITORIES.simpleJavaScript`
- Basic Node.js project with Express
- Package.json with dependencies
- Simple server implementation
- README file

#### `TEST_REPOSITORIES.reactTypeScript`
- React application with TypeScript
- TSConfig and package.json
- Component and index files
- Modern React patterns

#### `TEST_REPOSITORIES.pythonProject`
- Flask application
- Requirements.txt
- Python modules and classes
- API endpoints

### Custom Test Data

```typescript
// Create custom test repository
const customFiles = {
  'package.json': JSON.stringify({
    name: 'my-test-project',
    dependencies: { lodash: '^4.17.21' }
  }),
  'src/index.js': 'const _ = require("lodash"); console.log(_.version);',
  'README.md': '# My Test Project'
};

const repo = await createTestRepository('custom-test', customFiles);
```

## Writing Tests

### Unit Test Example

```typescript
// packages/backend/src/services/__tests__/AnalysisService.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { AnalysisService } from '../AnalysisService';

describe('AnalysisService', () => {
  let service: AnalysisService;

  beforeEach(() => {
    service = new AnalysisService();
  });

  test('should analyze repository structure', async () => {
    const result = await service.analyzeStructure('/path/to/repo');
    
    expect(result).toHaveProperty('fileCount');
    expect(result).toHaveProperty('languages');
    expect(result.fileCount).toBeGreaterThan(0);
  });
});
```

### Integration Test Example

```typescript
// packages/backend/src/__tests__/integration/api.test.ts
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';

describe('API Integration Tests', () => {
  test('POST /api/analyze should start analysis', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .send({
        path: '/test/repository',
        options: { mode: 'quick' }
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('analysisId');
  });
});
```

### E2E Test Example

```typescript
// tests/e2e/workflow.test.ts
import { describe, test, expect } from 'vitest';
import { startTestServer, createTestRepository } from './setup';

describe('Complete Analysis Workflow', () => {
  test('should complete full analysis workflow', async () => {
    const server = await startTestServer();
    const repo = await createTestRepository('workflow-test', TEST_REPOSITORIES.simpleJavaScript);

    // Start analysis
    const analyzeResponse = await axios.post(`${server.baseUrl}/api/analyze`, {
      path: repo.path,
      options: { mode: 'standard' }
    });

    // Wait for completion
    const analysis = await waitForAnalysis(server.baseUrl, analyzeResponse.data.analysisId);

    // Verify results
    expect(analysis.status).toBe('completed');
    expect(analysis.result).toHaveProperty('name');

    // Cleanup
    await repo.cleanup();
    await server.stop();
  });
});
```

## Custom Matchers

The test suite includes custom Vitest matchers:

```typescript
// Test repository analysis structure
expect(result).toBeValidRepositoryAnalysis();

// Test search results format
expect(searchResults).toBeValidSearchResult();

// Test export formats
expect(exportedData).toBeValidExportFormat('json');
expect(exportedMarkdown).toBeValidExportFormat('markdown');
expect(exportedHtml).toBeValidExportFormat('html');
```

## Performance Testing

### Performance Test Structure

```typescript
describe('Performance Tests', () => {
  test('should handle large repository efficiently', async () => {
    const perfMonitor = new PerformanceMonitor();
    const endTimer = perfMonitor.startTimer('large-repo-test');

    // Create large test repository
    const largeRepo = await createLargeTestRepository(1000); // 1000 files

    // Perform analysis
    const result = await analyzeRepository(largeRepo.path);

    const duration = endTimer();
    
    // Performance assertions
    expect(duration).toBeLessThan(60000); // Should complete within 60 seconds
    expect(result.fileCount).toBeGreaterThan(900);
  });
});
```

### Performance Benchmarks

The test suite includes benchmarks for:

- Single repository analysis (various sizes)
- Batch processing (multiple repositories)
- Concurrent analysis requests
- Memory usage during large file processing
- Export generation performance

## Coverage Requirements

### Coverage Thresholds

- **Lines**: 80% minimum
- **Functions**: 80% minimum
- **Branches**: 80% minimum
- **Statements**: 80% minimum

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html

# Coverage by package
npm run coverage:backend
npm run coverage:frontend
npm run coverage:cli
```

## Continuous Integration

### GitHub Actions Integration

The test suite is integrated with GitHub Actions:

```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: bun run test:ci

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Test Parallelization

Tests are parallelized in CI:

- Unit tests run in parallel by package
- Integration tests run sequentially
- E2E tests run with server orchestration
- Performance tests run conditionally

## Debugging Tests

### Debug Mode

```bash
# Run tests in debug mode
DEBUG=* bun run test

# Debug specific test file
bun run test -- --reporter=verbose tests/e2e/analysis.test.ts

# Run single test
bun run test -- --grep "should analyze JavaScript project"
```

### Test Isolation

```bash
# Run tests in isolation
bun run test -- --no-coverage --reporter=verbose

# Run with increased timeout
bun run test -- --timeout 60000
```

## Best Practices

### Test Organization

1. **Group related tests** using `describe` blocks
2. **Use descriptive test names** that explain the expected behavior
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Clean up resources** in `afterEach` or `afterAll` hooks

### Test Data Management

1. **Use test fixtures** for consistent test data
2. **Create isolated test environments** for each test
3. **Clean up test data** after each test
4. **Use factories** for creating test objects

### Performance Considerations

1. **Mock external dependencies** to improve test speed
2. **Use test databases** separate from development
3. **Parallelize independent tests**
4. **Set appropriate timeouts** for different test types

### Error Handling

1. **Test both success and failure cases**
2. **Verify error messages and codes**
3. **Test edge cases and boundary conditions**
4. **Use proper assertions** for async operations

## Troubleshooting

### Common Issues

#### Tests Timing Out

```bash
# Increase timeout
bun run test -- --timeout 60000

# Check for hanging promises
bun run test -- --detect-open-handles
```

#### Memory Issues

```bash
# Run with increased memory
node --max-old-space-size=4096 node_modules/.bin/vitest

# Monitor memory usage
bun run test:memory-profile
```

#### Port Conflicts

```bash
# Use different ports for testing
TEST_PORT=3002 bun run test:e2e

# Kill processes using test ports
lsof -ti:3001 | xargs kill -9
```

### Getting Help

1. Check test logs in `test-results/` directory
2. Run tests with verbose output: `bun run test -- --reporter=verbose`
3. Use debug mode: `DEBUG=* bun run test`
4. Check GitHub Actions logs for CI failures

## Contributing

### Adding New Tests

1. Follow existing test structure and naming conventions
2. Add appropriate test data and fixtures
3. Update this documentation if adding new test types
4. Ensure tests pass in CI environment

### Test Review Checklist

- [ ] Tests cover both success and failure cases
- [ ] Test names are descriptive and clear
- [ ] Tests are properly isolated and don't depend on each other
- [ ] Resources are properly cleaned up
- [ ] Performance implications are considered
- [ ] Tests work in CI environment

---

For more information about specific test implementations, see the individual test files and their inline documentation.