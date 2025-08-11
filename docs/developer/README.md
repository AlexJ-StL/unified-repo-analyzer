# Developer Guide

This guide covers how to contribute to, extend, and customize the Unified Repository Analyzer.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Core Components](#core-components)
5. [Adding New Features](#adding-new-features)
6. [Testing](#testing)
7. [API Development](#api-development)
8. [Frontend Development](#frontend-development)
9. [CLI Development](#cli-development)
10. [Contributing](#contributing)

## Architecture Overview

The Unified Repository Analyzer follows a modular monorepo architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │      CLI        │    │   External      │
│   (React SPA)   │    │   (Node.js)     │    │   Integrations  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │     REST API Server     │
                    │      (Express.js)       │
                    └─────────────┬───────────┘
                                  │
                    ┌─────────────┴───────────┐
                    │   Core Analysis Engine  │
                    │     (TypeScript)        │
                    └─────────────┬───────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
    ┌─────┴─────┐         ┌───────┴───────┐       ┌───────┴───────┐
    │    LLM    │         │  File System  │       │  Repository   │
    │ Providers │         │   Utilities   │       │     Index     │
    └───────────┘         └───────────────┘       └───────────────┘
```

### Key Principles

- **Modularity**: Each package has a single responsibility
- **Type Safety**: Full TypeScript coverage with strict typing
- **Testability**: Comprehensive test coverage with mocking capabilities
- **Extensibility**: Plugin-like architecture for easy feature additions
- **Performance**: Optimized for large repositories and concurrent processing

## Development Setup

### Prerequisites

- Node.js 18+ with npm/yarn
- Git
- VS Code (recommended) with TypeScript extension

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/unified-repo-analyzer/unified-repo-analyzer.git
cd unified-repo-analyzer

# Install dependencies for all packages
bun install

# Build shared packages
bun run build:shared

# Start development servers
bun run dev
```

This starts:
- Backend API server on `http://localhost:3001`
- Frontend development server on `http://localhost:3000`
- File watchers for automatic rebuilding

### Development Scripts

```bash
# Build all packages
bun run build

# Run tests
bun run test

# Run tests with coverage
bun run test:coverage

# Lint code
bun run lint

# Format code
bun run format

# Type checking
bun run type-check

# Clean build artifacts
bun run clean
```

## Project Structure

```
unified-repo-analyzer/
├── packages/
│   ├── backend/           # Express.js API server
│   ├── frontend/          # React web application
│   ├── cli/              # Command-line interface
│   └── shared/           # Shared types and utilities
├── tests/
│   ├── e2e/              # End-to-end tests
│   └── fixtures/         # Test data and fixtures
├── docs/                 # Documentation
├── scripts/              # Build and deployment scripts
└── tools/                # Development tools and configs
```

### Package Details

#### Backend (`packages/backend/`)

```
src/
├── api/                  # REST API routes and controllers
├── core/                 # Core analysis engine
├── providers/            # LLM provider implementations
├── services/             # Business logic services
├── utils/                # Utility functions
├── types/                # TypeScript type definitions
└── server.ts             # Application entry point
```

#### Frontend (`packages/frontend/`)

```
src/
├── components/           # React components
├── hooks/                # Custom React hooks
├── services/             # API client and services
├── stores/               # State management
├── utils/                # Utility functions
├── types/                # TypeScript types
└── App.tsx               # Application root
```

#### CLI (`packages/cli/`)

```
src/
├── commands/             # CLI command implementations
├── utils/                # CLI-specific utilities
├── types/                # CLI type definitions
└── index.ts              # CLI entry point
```

#### Shared (`packages/shared/`)

```
src/
├── types/                # Shared TypeScript types
├── utils/                # Shared utility functions
├── constants/            # Application constants
└── schemas/              # Validation schemas
```

## Core Components

### Analysis Engine

The core analysis engine is the heart of the system:

```typescript
// packages/backend/src/core/AnalysisEngine.ts
export class AnalysisEngine {
  async analyzeRepository(
    path: string, 
    options: AnalysisOptions
  ): Promise<RepositoryAnalysis> {
    // Implementation
  }
}
```

Key responsibilities:
- Repository discovery and traversal
- File content analysis
- Language and framework detection
- Code structure parsing
- Integration with LLM providers

### LLM Provider System

Extensible provider system for different LLM services:

```typescript
// packages/backend/src/providers/LLMProvider.ts
export abstract class LLMProvider {
  abstract name: string;
  abstract analyze(prompt: string): Promise<LLMResponse>;
  abstract formatPrompt(projectInfo: ProjectInfo): string;
  abstract validateConfig(): boolean;
}
```

#### Adding a New LLM Provider

1. Create provider class:

```typescript
// packages/backend/src/providers/NewProvider.ts
export class NewProvider extends LLMProvider {
  name = 'new-provider';

  async analyze(prompt: string): Promise<LLMResponse> {
    // Implementation
  }

  formatPrompt(projectInfo: ProjectInfo): string {
    // Implementation
  }

  validateConfig(): boolean {
    // Implementation
  }
}
```

2. Register provider:

```typescript
// packages/backend/src/providers/index.ts
import { NewProvider } from './NewProvider';

export const providers = {
  'new-provider': NewProvider,
  // ... other providers
};
```

3. Add configuration:

```typescript
// packages/shared/src/types/providers.ts
export interface ProviderConfigs {
  'new-provider': {
    apiKey: string;
    model?: string;
    // ... other config options
  };
}
```

### Repository Index System

Manages searchable repository metadata:

```typescript
// packages/backend/src/services/IndexService.ts
export class IndexService {
  async addRepository(analysis: RepositoryAnalysis): Promise<void> {
    // Implementation
  }

  async searchRepositories(query: SearchQuery): Promise<SearchResult[]> {
    // Implementation
  }

  async findSimilarRepositories(repoId: string): Promise<RepositoryMatch[]> {
    // Implementation
  }
}
```

## Adding New Features

### 1. Define Types

Start by defining TypeScript types in the shared package:

```typescript
// packages/shared/src/types/newFeature.ts
export interface NewFeatureConfig {
  enabled: boolean;
  options: {
    setting1: string;
    setting2: number;
  };
}

export interface NewFeatureResult {
  data: any[];
  metadata: {
    processingTime: number;
    version: string;
  };
}
```

### 2. Implement Core Logic

Add the core implementation in the backend:

```typescript
// packages/backend/src/services/NewFeatureService.ts
export class NewFeatureService {
  async processFeature(
    input: any, 
    config: NewFeatureConfig
  ): Promise<NewFeatureResult> {
    // Implementation
  }
}
```

### 3. Add API Endpoints

Create REST API endpoints:

```typescript
// packages/backend/src/api/newFeature.ts
import { Router } from 'express';
import { NewFeatureService } from '../services/NewFeatureService';

const router = Router();
const service = new NewFeatureService();

router.post('/new-feature', async (req, res) => {
  try {
    const result = await service.processFeature(req.body, req.body.config);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### 4. Add CLI Commands

Extend the CLI interface:

```typescript
// packages/cli/src/commands/newFeature.ts
import { Command } from 'commander';
import { NewFeatureService } from '@unified-repo-analyzer/backend';

export const newFeatureCommand = new Command('new-feature')
  .description('Execute new feature')
  .option('--setting1 <value>', 'Setting 1')
  .option('--setting2 <number>', 'Setting 2', parseInt)
  .action(async (options) => {
    // Implementation
  });
```

### 5. Add Frontend Components

Create React components for the web interface:

```typescript
// packages/frontend/src/components/NewFeature/NewFeatureComponent.tsx
import React from 'react';
import { useNewFeature } from '../../hooks/useNewFeature';

export const NewFeatureComponent: React.FC = () => {
  const { data, loading, error, execute } = useNewFeature();

  return (
    <div>
      {/* Component implementation */}
    </div>
  );
};
```

### 6. Add Tests

Write comprehensive tests:

```typescript
// packages/backend/src/services/__tests__/NewFeatureService.test.ts
import { NewFeatureService } from '../NewFeatureService';

describe('NewFeatureService', () => {
  let service: NewFeatureService;

  beforeEach(() => {
    service = new NewFeatureService();
  });

  test('should process feature correctly', async () => {
    const result = await service.processFeature(mockInput, mockConfig);
    expect(result).toMatchObject({
      data: expect.any(Array),
      metadata: expect.objectContaining({
        processingTime: expect.any(Number)
      })
    });
  });
});
```

## Testing

### Test Structure

```
packages/
├── backend/
│   ├── src/
│   │   └── __tests__/        # Unit tests
│   └── integration/          # Integration tests
├── frontend/
│   ├── src/
│   │   └── __tests__/        # Component tests
│   └── e2e/                  # End-to-end tests
└── shared/
    └── src/
        └── __tests__/        # Utility tests
```

### Running Tests

```bash
# Run all tests
bun run test

# Run tests for specific package
bun run test:backend
bun run test:frontend
bun run test:cli

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage

# Run e2e tests
bun run test:e2e
```

### Test Utilities

Use the provided test utilities for consistent testing:

```typescript
// tests/utils/testHelpers.ts
import { createTestRepository, startTestServer } from '../e2e/setup';

// Create mock repositories
const repo = await createTestRepository('test-repo', {
  'package.json': JSON.stringify({ name: 'test' }),
  'index.js': 'console.log("Hello World");'
});

// Start test server
const server = await startTestServer();
```

### Mocking

Mock external dependencies:

```typescript
// packages/backend/src/__tests__/mocks/llmProvider.ts
export const mockLLMProvider = {
  analyze: jest.fn().mockResolvedValue({
    summary: 'Mock summary',
    insights: ['Mock insight']
  }),
  formatPrompt: jest.fn().mockReturnValue('Mock prompt'),
  validateConfig: jest.fn().mockReturnValue(true)
};
```

## API Development

### Adding New Endpoints

1. Define route handler:

```typescript
// packages/backend/src/api/routes/newEndpoint.ts
import { Router, Request, Response } from 'express';
import { validateRequest } from '../middleware/validation';
import { newEndpointSchema } from '../schemas/newEndpoint';

const router = Router();

router.post('/new-endpoint', 
  validateRequest(newEndpointSchema),
  async (req: Request, res: Response) => {
    try {
      // Implementation
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
```

2. Add validation schema:

```typescript
// packages/backend/src/schemas/newEndpoint.ts
import { z } from 'zod';

export const newEndpointSchema = z.object({
  body: z.object({
    param1: z.string(),
    param2: z.number().optional()
  })
});
```

3. Register route:

```typescript
// packages/backend/src/api/index.ts
import newEndpointRoutes from './routes/newEndpoint';

app.use('/api', newEndpointRoutes);
```

### Middleware

Common middleware patterns:

```typescript
// packages/backend/src/middleware/auth.ts
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Authentication logic
  next();
};

// packages/backend/src/middleware/rateLimit.ts
export const createRateLimit = (windowMs: number, max: number) => {
  return rateLimit({ windowMs, max });
};
```

## Frontend Development

### Component Structure

Follow this structure for React components:

```typescript
// packages/frontend/src/components/MyComponent/MyComponent.tsx
import React from 'react';
import { MyComponentProps } from './types';
import { useMyComponent } from './hooks';
import styles from './MyComponent.module.css';

export const MyComponent: React.FC<MyComponentProps> = ({ prop1, prop2 }) => {
  const { state, actions } = useMyComponent({ prop1, prop2 });

  return (
    <div className={styles.container}>
      {/* Component JSX */}
    </div>
  );
};

// packages/frontend/src/components/MyComponent/types.ts
export interface MyComponentProps {
  prop1: string;
  prop2?: number;
}

// packages/frontend/src/components/MyComponent/hooks.ts
export const useMyComponent = (props: MyComponentProps) => {
  // Custom hook logic
  return { state, actions };
};

// packages/frontend/src/components/MyComponent/index.ts
export { MyComponent } from './MyComponent';
export type { MyComponentProps } from './types';
```

### State Management

Use Zustand for state management:

```typescript
// packages/frontend/src/stores/myStore.ts
import { create } from 'zustand';

interface MyStore {
  data: any[];
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  clearError: () => void;
}

export const useMyStore = create<MyStore>((set, get) => ({
  data: [],
  loading: false,
  error: null,
  
  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient.fetchData();
      set({ data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  clearError: () => set({ error: null })
}));
```

### API Client

Use the centralized API client:

```typescript
// packages/frontend/src/services/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 30000
});

export const analysisApi = {
  analyze: (data: AnalysisRequest) => 
    apiClient.post('/analyze', data),
  
  getAnalysis: (id: string) => 
    apiClient.get(`/analysis/${id}`),
  
  exportAnalysis: (id: string, format: string) => 
    apiClient.post('/export', { analysisId: id, format })
};
```

## CLI Development

### Command Structure

```typescript
// packages/cli/src/commands/myCommand.ts
import { Command } from 'commander';
import { logger } from '../utils/logger';
import { MyService } from '../services/MyService';

export const myCommand = new Command('my-command')
  .description('Description of my command')
  .argument('<required-arg>', 'Required argument description')
  .option('-o, --option <value>', 'Option description')
  .option('--flag', 'Flag description')
  .action(async (requiredArg, options) => {
    try {
      logger.info(`Executing my-command with ${requiredArg}`);
      
      const service = new MyService();
      const result = await service.execute(requiredArg, options);
      
      logger.success('Command completed successfully');
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      logger.error(`Command failed: ${error.message}`);
      process.exit(1);
    }
  });
```

### Progress Indicators

Use consistent progress indicators:

```typescript
// packages/cli/src/utils/progress.ts
import ora from 'ora';

export class ProgressIndicator {
  private spinner = ora();

  start(text: string) {
    this.spinner.start(text);
  }

  update(text: string) {
    this.spinner.text = text;
  }

  succeed(text?: string) {
    this.spinner.succeed(text);
  }

  fail(text?: string) {
    this.spinner.fail(text);
  }
}
```

### Configuration Management

Handle configuration consistently:

```typescript
// packages/cli/src/config/ConfigManager.ts
export class ConfigManager {
  private configPath = path.join(os.homedir(), '.repo-analyzer', 'config.json');

  async load(): Promise<Config> {
    // Load configuration
  }

  async save(config: Config): Promise<void> {
    // Save configuration
  }

  async merge(updates: Partial<Config>): Promise<Config> {
    // Merge configuration updates
  }
}
```

## Contributing

### Code Style

- Use TypeScript with strict mode enabled
- Follow Biome linting and formatting configurations
- Write descriptive commit messages
- Add JSDoc comments for public APIs

### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes with tests
4. Run the full test suite: `bun run test`
5. Update documentation if needed
6. Submit a pull request

### Code Review Guidelines

- Ensure all tests pass
- Verify TypeScript types are correct
- Check for proper error handling
- Validate performance implications
- Review security considerations

### Release Process

1. Update version numbers
2. Update CHANGELOG.md
3. Create release branch
4. Run full test suite
5. Build and test packages
6. Create GitHub release
7. Publish to npm

---

For more detailed information, see the individual package README files and inline code documentation.