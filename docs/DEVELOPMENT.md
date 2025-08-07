# Development Guide

This guide covers the development workflow for the Unified Repository Analyzer using the modern TypeScript + Bun + Biome toolchain.

## Quick Start

### Prerequisites

- **Bun 1.0+** (recommended) - [Installation Guide](https://bun.sh/docs/installation)
- **Node.js 18+** (fallback option)
- **Git** for version control

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd unified-repo-analyzer

# Install dependencies
bun install

# Build all packages
bun run build

# Start development servers
bun run dev
```

## Project Structure

```
unified-repo-analyzer/
├── packages/
│   ├── backend/          # Express.js API server
│   ├── frontend/         # React web application  
│   ├── cli/              # Command-line interface
│   └── shared/           # Shared types and utilities
├── scripts/              # Build and utility scripts
├── tests/                # Integration and E2E tests
├── types/                # Global type definitions
├── docs/                 # Documentation
├── bunfig.toml          # Bun configuration
├── biome.json           # Linting and formatting rules
└── vitest.config.ts     # Test configuration
```

## Development Toolchain

### Runtime: Bun

Bun provides native TypeScript execution and faster package management:

- **Native TypeScript**: No compilation step needed for development
- **Fast Package Manager**: Significantly faster than npm/yarn
- **Built-in Test Runner**: Integrated testing with coverage
- **Bundler**: Native bundling for production builds

**Configuration**: `bunfig.toml`

```toml
[install]
registry = "https://registry.npmjs.org"
cache = true
auto = "auto"

[run]
bun = true

[test]
coverage = true

[build]
target = "node"
sourcemap = "external"
```

### Code Quality: Biome

Biome provides unified linting and formatting in a single, fast tool:

- **Unified Tooling**: Linting and formatting in one tool
- **Fast Performance**: Written in Rust for speed
- **TypeScript Native**: Built-in TypeScript support
- **IDE Integration**: Works with VS Code and other editors

**Configuration**: `biome.json`

Key features configured:
- Single quotes for JavaScript/TypeScript
- 2-space indentation
- 100 character line width
- ES5 trailing commas
- Comprehensive linting rules

### Testing: Bun Test

Uses Bun's built-in test runner for fast execution:

- **Native Speed**: No transpilation overhead
- **Built-in Coverage**: Integrated coverage reporting
- **Jest-compatible**: Familiar API for existing tests
- **Watch Mode**: Fast file watching and re-running

## Development Workflow

### Daily Development

1. **Start Development Servers**:
   ```bash
   bun run dev  # Starts backend + frontend
   ```

2. **Run Individual Services**:
   ```bash
   bun run dev:backend   # Backend only
   bun run dev:frontend  # Frontend only  
   bun run dev:cli       # CLI development
   ```

3. **Code Quality Checks**:
   ```bash
   bun run check    # Lint + format check
   bun run lint     # Lint only
   bun run format   # Format files
   ```

4. **Testing**:
   ```bash
   bun test                    # Run all tests
   bun test --watch           # Watch mode
   bun test --coverage        # With coverage
   bun run test:all           # All packages
   ```

### Code Quality Standards

#### Linting Rules

Key rules enforced by Biome:

- **TypeScript**: Strict type checking, no explicit `any`
- **Style**: Consistent formatting, prefer const, template literals
- **Complexity**: Avoid useless code patterns
- **Accessibility**: React accessibility rules
- **Performance**: Optimize React hooks and dependencies

#### Formatting Standards

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Line Width**: 100 characters
- **Trailing Commas**: ES5 style
- **Semicolons**: Always required

#### Type Safety

All configuration files are TypeScript for better type safety:

- `packages/frontend/tailwind.config.ts`
- `packages/frontend/postcss.config.ts`
- `scripts/test-runner.ts`
- `types/config.ts` - Shared type definitions

### Building

#### Development Build
```bash
bun run build
```

#### Production Build
```bash
bun run build:prod
```

#### Individual Packages
```bash
bun run build:backend
bun run build:frontend
bun run build:cli
bun run build:shared
```

### Testing Strategy

#### Unit Tests
- Located alongside source files in `__tests__` directories
- Use Bun's test runner with Jest-compatible API
- Focus on individual functions and components

#### Integration Tests
- Located in `tests/` directory
- Test interactions between packages
- Validate API endpoints and data flow

#### End-to-End Tests
- Located in `tests/e2e/`
- Test complete user workflows
- Use real browser automation

#### Performance Tests
- Benchmark critical operations
- Monitor build times and bundle sizes
- Track test execution speed

### Package Management

#### Adding Dependencies

```bash
# Production dependency
bun add package-name

# Development dependency  
bun add -d package-name

# Workspace-specific dependency
bun add package-name --cwd packages/backend
```

#### Updating Dependencies

```bash
# Update all dependencies
bun update

# Update specific package
bun update package-name
```

#### Workspace Management

The project uses Bun workspaces for monorepo management:

- Shared dependencies in root `package.json`
- Package-specific dependencies in individual `package.json` files
- Automatic linking between workspace packages

## IDE Configuration

### VS Code

Recommended extensions:
- **Biome** - Official Biome extension for linting/formatting
- **TypeScript Importer** - Auto-import TypeScript modules
- **Error Lens** - Inline error display

**Settings** (`.vscode/settings.json`):
```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": true,
    "source.organizeImports.biome": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Other IDEs

Biome has plugins for:
- **IntelliJ IDEA / WebStorm**
- **Neovim** 
- **Sublime Text**
- **Emacs**

## Debugging

### Backend Debugging

```bash
# Start with debugger
bun --inspect src/index.ts

# VS Code launch configuration
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/packages/backend/src/index.ts",
  "runtime": "bun",
  "env": {
    "NODE_ENV": "development"
  }
}
```

### Frontend Debugging

- Use browser DevTools
- React DevTools extension
- Source maps enabled for TypeScript

### Test Debugging

```bash
# Debug specific test
bun test --inspect-brk test-file.test.ts

# VS Code test debugging
{
  "type": "node", 
  "request": "launch",
  "name": "Debug Tests",
  "program": "${workspaceFolder}/node_modules/.bin/bun",
  "args": ["test", "${file}"],
  "console": "integratedTerminal"
}
```

## Performance Optimization

### Build Performance

- **Bun Bundler**: Native bundling for faster builds
- **TypeScript**: No transpilation in development
- **Incremental Builds**: Only rebuild changed files
- **Parallel Processing**: Concurrent package builds

### Development Performance

- **Fast Refresh**: Hot reloading for React
- **Native Execution**: Direct TypeScript execution
- **Efficient Watching**: Smart file watching
- **Optimized Dependencies**: Faster package resolution

### Test Performance

- **Native Test Runner**: No transpilation overhead
- **Parallel Execution**: Concurrent test running
- **Smart Caching**: Reuse test results when possible
- **Coverage Integration**: Built-in coverage without overhead

## Troubleshooting

### Common Issues

1. **Bun Installation Issues**:
   ```bash
   # Reinstall Bun
   curl -fsSL https://bun.sh/install | bash
   
   # Clear cache
   bun install --force
   ```

2. **TypeScript Errors**:
   ```bash
   # Check TypeScript configuration
   bun run tsc --noEmit
   
   # Clear TypeScript cache
   rm -rf node_modules/.cache
   ```

3. **Biome Issues**:
   ```bash
   # Check Biome configuration
   bunx @biomejs/biome check --help
   
   # Fix formatting issues
   bun run format
   ```

4. **Test Failures**:
   ```bash
   # Run tests with verbose output
   bun test --verbose
   
   # Clear test cache
   rm -rf .bun/cache
   ```

### Performance Issues

1. **Slow Builds**: Check for large dependencies or circular imports
2. **Memory Usage**: Monitor with `bun --heap-usage`
3. **Test Speed**: Use `--bail` to stop on first failure
4. **File Watching**: Exclude unnecessary directories in `.gitignore`

## Contributing

### Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Prefer composition over inheritance

### Commit Guidelines

- Use conventional commit format
- Include type: feat, fix, docs, style, refactor, test, chore
- Keep commits atomic and focused
- Write clear commit messages

### Pull Request Process

1. Create feature branch from `main`
2. Make changes with tests
3. Run full test suite: `bun run test:all`
4. Check code quality: `bun run check`
5. Update documentation if needed
6. Submit pull request with clear description

### Testing Requirements

- Unit tests for new functions
- Integration tests for API changes
- E2E tests for user-facing features
- Performance tests for critical paths
- Maintain or improve coverage

## Deployment

### Development Deployment

```bash
# Build and start with Docker
bun run docker:build
bun run docker:up
```

### Production Deployment

```bash
# Full production build and deploy
bun run deploy:prod
```

See [DEPLOYMENT.md](../README-DEPLOYMENT.md) for detailed deployment instructions.

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [Biome Documentation](https://biomejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)

## Getting Help

- Check existing issues in the repository
- Review documentation and guides
- Ask questions in team chat or discussions
- Create detailed bug reports with reproduction steps