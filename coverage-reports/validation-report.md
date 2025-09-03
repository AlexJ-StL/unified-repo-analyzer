# Coverage Validation Report

Generated: 9/3/2025, 3:49:02 AM

## Summary

- Total Tests: 5
- Passed: 3 ✅
- Failed: 2 ❌

## Test Results

### ✅ Vitest Configuration

Coverage configuration is properly set up

### ✅ Coverage Directories

All required directories exist

### ❌ Basic Coverage Collection

Test execution failed: Error: Command failed: vitest run coverage-validation.test.ts --coverage --reporter=basic
'vitest' is not recognized as an internal or external command,
operable program or batch file.


### ❌ Coverage Output Formats

Missing formats: coverage\index.html, coverage\coverage-final.json

### ✅ Coverage Thresholds

All coverage thresholds are configured

## Recommendations

- ⚠️ Some coverage validation tests failed
- 🧪 Check that Vitest can run tests with coverage
- 📄 Verify coverage reporters are generating output files
- 🔄 Run `npm run test:coverage:fix` to attempt automatic fixes
