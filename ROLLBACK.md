# Migration Rollback Guide

This document provides instructions for rolling back the JavaScript to TypeScript migration and reverting from Bun/Biome to Node.js/ESLint+Prettier if critical issues arise.

## Overview

The migration included:
- Runtime: Node.js → Bun
- Tooling: ESLint + Prettier → Biome
- Configuration files: JavaScript → TypeScript
- Test runner: Jest → Bun test
- Package manager: npm → Bun

## Rollback Steps

### 1. Restore Package Manager and Runtime

```bash
# Remove Bun-specific files
rm bunfig.toml

# Restore npm usage in package.json scripts
# Replace all "bun" with "npm" in package.json files
```

### 2. Restore ESLint and Prettier

```bash
# Remove Biome
npm uninstall @biomejs/biome

# Reinstall ESLint and Prettier
npm install --save-dev \
  @eslint/js@^9.32.0 \
  @typescript-eslint/eslint-plugin@^8.38.0 \
  @typescript-eslint/parser@^8.38.0 \
  eslint@^9.0.0 \
  eslint-config-prettier@^10.1.8 \
  eslint-plugin-prettier@^5.5.3 \
  prettier@^3.6.2

# Remove biome.json
rm biome.json
```

### 3. Restore ESLint Configuration

Create `eslint.config.js`:

```javascript
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }],
      'prefer-const': 'error',
      'prefer-template': 'error',
      'no-console': ['warn', { allow: ['log'] }],
    },
  },
  prettier,
];
```

### 4. Restore Prettier Configuration

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

### 5. Restore Jest Configuration

For each package, convert TypeScript Jest configs back to JavaScript:

**packages/backend/jest.config.js**:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

**packages/frontend/jest.config.js**:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
};
```

**packages/cli/jest.config.js**:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
```

**packages/shared/jest.config.js**:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
```

### 6. Restore JavaScript Configuration Files

**packages/frontend/postcss.config.js**:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**packages/frontend/tailwind.config.js**:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**scripts/test-runner.js**:
```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.results = {
      unit: null,
      integration: null,
      e2e: null,
      performance: null,
      coverage: null,
    };
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('Starting comprehensive test suite...');
    
    try {
      await this.runUnitTests();
      await this.runIntegrationTests();
      await this.runE2ETests();
      await this.runPerformanceTests();
      await this.generateCoverageReport();
      
      this.generateReport();
    } catch (error) {
      console.error('Test suite failed:', error.message);
      process.exit(1);
    }
  }

  async runUnitTests() {
    console.log('Running unit tests...');
    try {
      execSync('npm run test:all', { stdio: 'inherit' });
      this.results.unit = { status: 'passed', duration: Date.now() - this.startTime };
    } catch (error) {
      this.results.unit = { status: 'failed', error: error.message };
    }
  }

  // ... rest of the methods
}

if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests();
}

module.exports = TestRunner;
```

### 7. Update Package.json Scripts

Restore npm-based scripts in all package.json files:

```json
{
  "scripts": {
    "dev": "npm run dev:backend & npm run dev:frontend",
    "dev:backend": "npm run --workspace=packages/backend dev",
    "dev:frontend": "npm run --workspace=packages/frontend dev",
    "build": "npm run build:shared && npm run build:backend && npm run build:cli && npm run build:frontend",
    "test": "jest",
    "test:all": "npm run --workspaces test",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "format": "prettier --write .",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix"
  }
}
```

### 8. Reinstall Dependencies

```bash
# Remove Bun lockfile and node_modules
rm -rf node_modules bun.lockb

# Reinstall with npm
npm install

# Reinstall Jest and related dependencies
npm install --save-dev \
  jest@^29.7.0 \
  ts-jest@^29.1.2 \
  @types/jest@^29.5.12 \
  @jest/globals@^29.7.0
```

### 9. Update VS Code Settings

If you have VS Code settings configured for Biome, restore ESLint/Prettier:

**.vscode/settings.json**:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### 10. Verification Steps

After rollback, verify everything works:

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Run formatting
npm run format

# Run tests
npm run test:all

# Build project
npm run build

# Start development servers
npm run dev
```

## Troubleshooting

### Common Issues

1. **Module Resolution Errors**: Clear node_modules and reinstall
2. **TypeScript Errors**: Check tsconfig.json files are correct
3. **Test Failures**: Ensure Jest configurations match test file locations
4. **Build Failures**: Verify all TypeScript files compile correctly

### Emergency Rollback

If you need to quickly restore functionality:

1. Checkout the commit before migration started
2. Run `npm install`
3. Verify functionality works
4. Create a new branch for fixes

### Getting Help

If rollback issues persist:

1. Check the original migration commit for reference
2. Compare configurations with pre-migration state
3. Test individual packages separately
4. Consider partial rollback (keep TypeScript configs, restore tooling)

## Prevention

To avoid needing rollback in the future:

1. Test migrations thoroughly in development
2. Use feature flags for gradual rollouts
3. Maintain comprehensive test coverage
4. Document all configuration changes
5. Keep backup branches of working states