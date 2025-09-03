# Test Execution Optimization Report

Generated: 9/3/2025, 2:23:49 PM

## Execution Plan

- **Strategy**: parallel
- **Total Batches**: 16
- **Total Tests**: 117
- **Estimated Duration**: 301.2s
- **Max Concurrency**: 4

## Change Detection

- **Strategy**: all
- **Changed Files**: 10
- **Affected Tests**: 0

## Batch Details

| Batch | Tests | Duration | Priority | Packages |
|-------|-------|----------|----------|----------|
| batch-1 | 10 | 7.3s | 88 | root |
| batch-2 | 10 | 8.3s | 80 | root |
| batch-3 | 10 | 13.0s | 80 | root |
| batch-4 | 10 | 13.9s | 74 | root |
| batch-5 | 10 | 10.7s | 70 | root |
| batch-6 | 10 | 13.3s | 70 | root |
| batch-7 | 10 | 17.6s | 70 | root |
| batch-8 | 5 | 23.2s | 70 | root |
| batch-9 | 10 | 23.8s | 61 | root |
| batch-10 | 10 | 17.2s | 60 | root |
| batch-11 | 7 | 23.8s | 60 | root |
| batch-12 | 3 | 22.7s | 60 | root |
| batch-13 | 4 | 27.7s | 55 | root |
| batch-14 | 3 | 21.5s | 50 | root |
| batch-15 | 4 | 25.8s | 43 | root |
| batch-16 | 1 | 31.6s | 40 | root |

## Optimizations Applied

- **intelligentBatching**: Tests grouped by duration and priority
- **changeDetection**: Only affected tests run when possible
- **fastFeedback**: High-priority tests run first
- **selectiveExecution**: Minimal test sets for small changes

## Usage

```bash
# Run optimized test execution
bun scripts/fast-feedback.ts

# Run selective tests based on changes
bun scripts/selective-tests.ts

# Run full optimization
bun scripts/test-execution-optimizer.ts
```

## Recommendations

- Consider splitting large test suites into smaller, focused test files
- Large number of batches detected - consider consolidating similar tests
- Use `bun scripts/fast-feedback.ts` for quick development feedback
- Use `bun scripts/selective-tests.ts` when working on specific features
