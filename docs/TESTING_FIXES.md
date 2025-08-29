# Testing Issues and Fixes

## Current Status
- **Major Progress**: Fixed core Vitest configuration issues
- **vi.mock errors**: Resolved through proper TypeScript configuration
- **Resource management**: CPU/memory exhaustion issues resolved
- **Test performance**: Individual tests now run much faster (< 2s vs 5+ seconds)
- **Remaining work**: Systematic fixing of individual test files with complex mocking

## Root Cause Analysis

### 1. vi.mock Issues
The primary issue is that `vi.mock()` is being called at the module level (top-level) before Vitest has fully initialized. This happens because:

- Vitest needs to hoist mocks, but the hoisting isn't working properly
- Some test files are using `mock.module()` instead of `vi.mock()`
- Module-level mocking conflicts with ESM imports

### 2. Missing Dependencies
Some test files reference packages that aren't installed:
- `pretty-format` (used by @testing-library/dom)
- `jest-axe` (accessibility testing)

### 3. Performance Issues
- Test timeouts due to aggressive parallel execution settings
- Memory exhaustion from too many concurrent processes

## Systematic Fix Approach

### Phase 1: Configuration Fixes ✅
- [x] Reduced parallel execution limits (from 8 to 4 max concurrent)
- [x] Added reasonable timeouts (60s CI, 30s local)
- [x] Created cleanup script for hanging processes (`bun run cleanup:processes`)
- [x] Fixed TypeScript errors in Vitest config
- [x] Simplified complex runtime-specific logic
- [x] Added `hoistMocks: true` to Vitest config
- [x] Switched to `environmentMatchGlobs` instead of problematic `projects` config

### Phase 2: Mock System Fixes ✅
- [x] Fixed TypeScript configuration issues that were preventing vi.mock from working
- [x] Replaced `mock.module()` calls with `vi.mock()` in CLI tests
- [x] Created working test examples without complex mocking
- [x] Verified basic API tests work without vi.mock errors

### Phase 3: Dependency Fixes
- [ ] Install missing test dependencies
- [ ] Update import paths for moved modules
- [ ] Fix type definition issues

### Phase 4: Test Logic Fixes
- [ ] Fix path validation test expectations
- [ ] Update performance test thresholds
- [ ] Fix schema validation issues

## Quick Wins Identified

1. **Simple Tests Work**: Tests without complex mocking (like `fileImportance.test.ts`) pass fine
2. **Configuration Improved**: Resource usage should be much better now
3. **Pattern Identified**: The vi.mock issue is consistent and fixable

## Next Steps

1. Focus on fixing 5-10 critical test files first
2. Create a template for proper mocking patterns
3. Run tests in smaller batches to avoid resource exhaustion
4. Gradually expand to fix all failing tests

## Resource Management

To prevent CPU/memory exhaustion:
- Use `bun run cleanup:processes` if processes hang
- Run tests with `--reporter=basic` to reduce output
- Use `--run` flag to avoid watch mode
- Test individual files/packages instead of full suite