# Vitest Mock System Fixes

## Problem Summary
The project had `vi.mock is not a function` errors because:
1. `bun test` was using Bun's built-in test runner instead of Vitest
2. Vitest version was outdated (1.6.0) and had configuration issues
3. Mock functions were not properly available in the test environment

## Solutions Implemented

### 1. Updated Vitest to Latest Version
- Upgraded from Vitest 1.6.0 to 3.2.4
- This provided access to all modern mock functions

### 2. Fixed Vitest Configuration
- Updated `vitest.config.ts` to use modern configuration patterns
- Replaced deprecated `environmentMatchGlobs` with `projects` configuration
- Updated `deps.inline/external` to use `deps.optimizer.ssr.include/exclude`
- Fixed module resolution issues

### 3. Updated Test Setup
- Enhanced `tests/setup.ts` with safer mock function exports
- Added fallback support for when `vi.mocked` is not available
- Improved mock utilities in `tests/mock-utils.ts` with runtime checks

### 4. Updated Package Scripts
- Modified `package.json` to prioritize Vitest for tests requiring mocking
- Added specific scripts for running tests with different runners:
  - `test:vitest` - Run tests with full Vitest mock support
  - `test:bun` - Run tests with Bun's test runner
  - `test:vitest:watch` - Watch mode with Vitest

## Key Differences Between Test Runners

### Bun Test Runner (`bun test`)
- Limited mock functions: `vi.fn`, `vi.spyOn`, `vi.clearAllMocks`, `vi.restoreAllMocks`, `vi.module`
- Missing: `vi.mock`, `vi.mocked`, `vi.isMockFunction`, timer mocking functions
- Faster startup, good for simple tests

### Vitest (`bunx vitest`)
- Full mock API including: `vi.mock`, `vi.mocked`, `vi.isMockFunction`
- Complete timer mocking: `vi.useFakeTimers`, `vi.advanceTimersByTime`, etc.
- Better for complex mocking scenarios

## Verification
All core mock functions are now working:
- ✅ `vi.mock` - Available and functional
- ✅ `vi.mocked` - Available (with proper usage patterns)
- ✅ `vi.isMockFunction` - Available and functional
- ✅ `vi.fn` - Working correctly
- ✅ `vi.spyOn` - Working correctly

## Usage Recommendations
1. Use `bunx vitest` for tests that need mocking functionality
2. Use `bun test` for simple tests without complex mocking
3. The updated mock utilities provide fallbacks for both environments
4. Tests requiring `vi.mock` should be run with Vitest, not Bun's test runner

## Files Modified
- `vitest.config.ts` - Updated configuration for Vitest 3.2.4
- `tests/setup.ts` - Enhanced mock function exports with fallbacks
- `tests/mock-utils.ts` - Added runtime checks for mock functions
- `package.json` - Updated test scripts and Vitest version