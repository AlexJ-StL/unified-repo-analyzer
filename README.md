# Unified Repository Analyzer

A comprehensive tool for analyzing code repositories, generating executive summaries and technical breakdowns.

## Features

- Repository analysis with executive summaries and technical breakdowns
- Multiple LLM provider support (Claude, Gemini, etc.)
- Batch processing for multiple repositories
- Repository indexing and search capabilities
- Modern React web interface
- Command-line interface for automation
- Multiple export formats (JSON, Markdown, HTML)

## Project Structure

This is a monorepo containing the following packages:

- `packages/backend` - Express.js REST API server
- `packages/frontend` - React web application
- `packages/cli` - Command-line interface
- `packages/shared` - Shared types and utilities

## Getting Started

### Prerequisites

- Bun 1.0+ (recommended) or Node.js 18+
- For Bun installation, visit: https://bun.sh/docs/installation

### Installation

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

3. Build all packages:

```bash
bun run build
```

### Development

Start the backend and frontend development servers:

```bash
bun run dev
```

Or start individual packages:

```bash
# Backend
bun run dev:backend

# Frontend
bun run dev:frontend

# CLI
bun run dev:cli
```

### Usage

#### Web Interface

Open your browser and navigate to `http://localhost:3001`

#### CLI

```bash
# Analyze a repository
bunx repo-analyzer analyze /path/to/repository

# Batch analyze multiple repositories
bunx repo-analyzer batch /path/to/repositories

# Search indexed repositories
bunx repo-analyzer search "query"
```

### Development Workflow

This project uses modern tooling for improved developer experience:

#### Code Quality
- **Linting & Formatting**: Uses [Biome](https://biomejs.dev/) for fast, unified linting and formatting
- **Type Checking**: Full TypeScript support with native Bun execution
- **Testing**: Bun's built-in test runner for fast test execution

#### Available Scripts
```bash
# Development
bun run dev                 # Start all development servers
bun run dev:backend         # Start backend only
bun run dev:frontend        # Start frontend only

# Building
bun run build               # Build all packages
bun run build:prod          # Production build

# Testing
bun test                    # Run all tests
bun run test:all            # Run tests for all packages

# Code Quality
bun run lint                # Lint all files
bun run format              # Format all files
bun run check               # Run both linting and formatting

# Deployment
bun run docker:build        # Build Docker images
bun run docker:up           # Start with Docker Compose
bun run deploy:prod         # Full production deployment
```

#### Configuration Files
All configuration files are now in TypeScript for better type safety:
- `bunfig.toml` - Bun runtime configuration
- `biome.json` - Linting and formatting rules
- `packages/*/tsconfig.json` - TypeScript configurations
- `packages/frontend/tailwind.config.ts` - Tailwind CSS config
- `packages/frontend/postcss.config.ts` - PostCSS config

## License

MIT