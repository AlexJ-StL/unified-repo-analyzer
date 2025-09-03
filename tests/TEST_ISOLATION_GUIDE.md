# Test Isolation System Guide

## Overview

The Test Isolation System provides comprehensive isolation between tests to ensure clean state, prevent test interference, and enable reliable test execution. This system addresses the requirements for proper test isolation with module cache clearing, global variable reset, and environment management.

## Core Components

### 1. IsolationManager

The main orchestrator that manages all isolation concerns:

```typescript
import { IsolationManager } from './test-isolation';

const manager = IsolationManager.getInstance();

// Initialize isolation for a test
await manager.initializeIsolation('test-id');

// Check if isolation is active
const isActive = manager.isActive();

// Get isolation statistics
const stats = manager.getStats();

// Emergency cleanup
await manager.emergencyCleanup();
```

### 2. EnvironmentIsolation

Manages environment variable isolation:

```typescript
import { EnvironmentIsolation } from './test-isolation';

// Set environment variables with automatic cleanup
EnvironmentIsolation.setEnv('TEST_VAR', 'value');

// Set multiple variables
EnvironmentIsolation.setEnvVars({
  VAR1: 'value1',
  VAR2: 'value2'
});

// Temporarily override variables
await EnvironmentIsolation.withEnv(
  { TEMP_VAR: 'temp-value' },
  async () => {
    // Code that uses TEMP_VAR
  }
);

// Create snapshot and restore
EnvironmentIsolation.createSnapshot();
// ... modify environment ...
EnvironmentIsolation.restoreFromSnapshot();

// Clear test-related variables
EnvironmentIsolation.clearTestEnv();

// Restore all modified variables
EnvironmentIsolation.restoreEnv();
```

### 3. ModuleIsolation

Handles module cache management:

```typescript
import { ModuleIsolation } from './test-isolation';

// Create cache snapshot
ModuleIsolation.createCacheSnapshot();

// Clear cache selectively
ModuleIsolation.clearCache(['test', 'spec']);

// Mock a module (tracking for cleanup)
ModuleIsolation.mockModule('module-path');

// Restore specific module
ModuleIsolation.restoreModule('module-path');

// Restore all modules
ModuleIsolation.restoreModules();

// Force clear everything
ModuleIsolation.forceClearAll();

// Get statistics
const stats = ModuleIsolation.getCacheStats();
```

### 4. DOMIsolation

Manages DOM state for frontend tests:

```typescript
import { DOMIsolation } from './test-isolation';

// Setup clean DOM
DOMIsolation.setupCleanDOM();

// Track elements for cleanup
const element = document.createElement('div');
DOMIsolation.trackElement(element);

// Track attribute changes
DOMIsolation.trackAttribute(element, 'class', 'original-class');

// Create snapshot
DOMIsolation.createSnapshot();

// Cleanup DOM modifications
DOMIsolation.cleanupDOM();

// Restore from snapshot
DOMIsolation.restoreFromSnapshot();

// Force cleanup everything
DOMIsolation.forceCleanup();
```

### 5. TimerIsolation

Manages timer and async operation isolation:

```typescript
import { TimerIsolation } from './test-isolation';

// Initialize timer tracking
TimerIsolation.initialize();

// Enable timer mocking
TimerIsolation.enableMocking();

// Create tracked timers
const timer = TimerIsolation.setTimeout(() => {}, 1000);
const interval = TimerIsolation.setInterval(() => {}, 1000);
const immediate = TimerIsolation.setImmediate(() => {});

// Clear all timers
TimerIsolation.clearAll();

// Wait for pending timers
await TimerIsolation.waitForPendingTimers(5000);

// Get statistics
const stats = TimerIsolation.getStats();

// Disable mocking
TimerIsolation.disableMocking();
```

## High-Level Functions

### Setup and Cleanup

```typescript
import { setupTestIsolation, cleanupTestIsolation } from './test-isolation';

// Setup isolation for a test
await setupTestIsolation('test-id');

// Cleanup after test
await cleanupTestIsolation('test-id');
```

### Utility Functions

```typescript
import { 
  withIsolation, 
  createIsolatedContext, 
  getIsolationStats,
  emergencyIsolationReset 
} from './test-isolation';

// Run function with automatic isolation
const result = await withIsolation('test-id', async () => {
  // Test code here
  return 'success';
});

// Create reusable isolated context
const context = createIsolatedContext('test-id');
await context.setup();
const result = await context.run(async () => {
  // Test code here
});
await context.cleanup();

// Get comprehensive statistics
const stats = getIsolationStats();

// Emergency reset when tests are in bad state
await emergencyIsolationReset();
```

## Integration with Test Setup

The isolation system is automatically integrated into the test setup files:

### Automatic Integration

```typescript
// In beforeEach
beforeEach(async () => {
  const testId = `test-${Date.now()}-${Math.random()}`;
  await setupTestIsolation(testId);
  (globalThis as any).__currentTestId = testId;
});

// In afterEach
afterEach(async () => {
  const testId = (globalThis as any).__currentTestId;
  if (testId) {
    await cleanupTestIsolation(testId);
    delete (globalThis as any).__currentTestId;
  }
});

// In afterAll
afterAll(async () => {
  await emergencyIsolationReset();
});
```

### Manual Integration

For custom test setups:

```typescript
import { describe, it, beforeEach, afterEach } from 'vitest';
import { setupTestIsolation, cleanupTestIsolation } from './test-isolation';

describe('My Test Suite', () => {
  let testId: string;

  beforeEach(async () => {
    testId = `test-${Date.now()}-${Math.random()}`;
    await setupTestIsolation(testId);
  });

  afterEach(async () => {
    await cleanupTestIsolation(testId);
  });

  it('should run with isolation', async () => {
    // Test code here is automatically isolated
  });
});
```

## Best Practices

### 1. Use Unique Test IDs

Always generate unique test IDs to prevent conflicts:

```typescript
const testId = `test-${Date.now()}-${Math.random()}`;
// or
const testId = `${expect.getState().currentTestName}-${Date.now()}`;
```

### 2. Handle Cleanup Properly

Always ensure cleanup runs, even if tests fail:

```typescript
let testId: string;

beforeEach(async () => {
  testId = generateTestId();
  await setupTestIsolation(testId);
});

afterEach(async () => {
  if (testId) {
    await cleanupTestIsolation(testId);
  }
});
```

### 3. Use withIsolation for Simple Cases

For simple test isolation needs:

```typescript
it('should do something', async () => {
  await withIsolation('my-test', async () => {
    // Test code here
  });
});
```

### 4. Monitor Isolation Statistics

Check isolation statistics to debug issues:

```typescript
afterEach(() => {
  const stats = getIsolationStats();
  if (stats.manager.activeTests > 0) {
    console.warn('Tests not properly cleaned up:', stats);
  }
});
```

### 5. Use Emergency Reset for Recovery

When tests are in a bad state:

```typescript
afterAll(async () => {
  // Always run emergency reset to ensure clean state
  await emergencyIsolationReset();
});
```

## Environment Variables

Control isolation behavior with environment variables:

- `TRACK_TIMERS=true` - Enable timer tracking and mocking
- `NODE_ENV=test` - Automatically set by isolation system
- `TEST_*` - Automatically cleared by environment isolation
- `VITEST_*` - Automatically cleared by environment isolation

## Troubleshooting

### Common Issues

1. **Tests interfering with each other**
   - Ensure proper cleanup in afterEach
   - Check isolation statistics for leaked state

2. **Module cache not clearing**
   - Use `ModuleIsolation.forceClearAll()` for stubborn cases
   - Check that vi.resetModules() is available

3. **Environment variables persisting**
   - Use `EnvironmentIsolation.restoreFromSnapshot()` for full reset
   - Check for variables set outside isolation system

4. **DOM state persisting**
   - Use `DOMIsolation.forceCleanup()` for complete reset
   - Ensure elements are properly tracked

5. **Timers not clearing**
   - Check timer statistics with `TimerIsolation.getStats()`
   - Use `TimerIsolation.waitForPendingTimers()` before cleanup

### Debug Information

Get comprehensive debug information:

```typescript
const stats = getIsolationStats();
console.log('Isolation Stats:', {
  manager: stats.manager,
  modules: stats.modules,
  timers: stats.timers
});
```

### Emergency Recovery

When all else fails:

```typescript
// Nuclear option - reset everything
await emergencyIsolationReset();
ModuleIsolation.forceClearAll();
DOMIsolation.forceCleanup();
TimerIsolation.clearAll();
```

## Performance Considerations

- Isolation adds overhead to each test
- Use selective isolation for performance-critical tests
- Monitor isolation statistics to detect leaks
- Consider disabling timer tracking for simple tests
- Use snapshots sparingly for large DOM trees

## Requirements Satisfied

This isolation system satisfies the following requirements:

- **6.3**: Proper test isolation between tests
- **4.3**: Mock cleanup and reset mechanisms
- **Module Cache Clearing**: Comprehensive module cache management
- **Global Variable Reset**: Environment and global state management
- **Clean State**: Ensures clean state between tests

The system provides a robust foundation for reliable test execution with comprehensive isolation capabilities.