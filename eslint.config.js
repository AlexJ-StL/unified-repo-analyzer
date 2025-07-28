import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import path from 'path'; // <--- Import 'path' module
import { fileURLToPath } from 'url'; // <--- Import for __dirname equivalent

// Get __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // This will be the root of your repo

export default [
  js.configs.recommended,
  {
    // --- Configuration for TypeScript files ---
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.es2022,
        ...globals.browser,
        ...globals.jest,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      'no-console': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'no-useless-escape': 'error', // Explicitly enable this rule
    },
  },
  {
    // Specific config for backend package
    files: ['packages/backend/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: [path.resolve(__dirname, 'packages/backend/tsconfig.json')],
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.node,
        ...globals.es2022,
        NodeJS: 'readonly',
        BufferEncoding: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off', // Disable no-undef for backend files since TypeScript handles this
    },
  },
  {
    // Specific config for backend test files
    files: ['packages/backend/**/{__tests__}/**/*.{ts,tsx}', 'packages/backend/**/*.test.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: [path.resolve(__dirname, 'packages/backend/tsconfig.test.json')], // <--- New test tsconfig
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.es2022,
        NodeJS: 'readonly',
        BufferEncoding: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
  {
    // Specific config for frontend package
    files: [
      'packages/frontend/**/{__tests__}/**/*.{js,ts,tsx}',
      'packages/frontend/jest.config.js',
      'packages/frontend/**/*.test.{js,ts,tsx}',
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: [path.resolve(__dirname, 'packages/frontend/tsconfig.json')],
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.jest,
        ...globals.node, // For things like Node streams, process.env
        ...globals.browser, // For browser globals
        ...globals.es2022,
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
  {
    // Specific config for cli package (add this, it was missing)
    files: ['packages/cli/**/*.{js,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: [path.resolve(__dirname, 'packages/cli/tsconfig.json')],
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
  },
  {
    // Specific config for shared package (add this, it was missing)
    files: ['packages/shared/**/*.{js,ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: [path.resolve(__dirname, 'packages/shared/tsconfig.json')],
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
  },
  {
    // Test files config
    files: [
      'packages/cli/**/{__tests__}/**/*.{js,ts,tsx}',
      'packages/cli/jest.config.js',
      'packages/cli/**/*.test.{js,ts,tsx}',
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: [path.resolve(__dirname, 'packages/cli/tsconfig.test.json')],
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.jest,
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      '**/out/**',
      '**/.cache/**',
    ],
  },
];
