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

- Node.js 18+
- npm 8+

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Build all packages:

```bash
npm run build
```

### Development

Start the backend and frontend development servers:

```bash
npm run dev
```

Or start individual packages:

```bash
# Backend
npm run dev:backend

# Frontend
npm run dev:frontend

# CLI
npm run dev:cli
```

### Usage

#### Web Interface

Open your browser and navigate to `http://localhost:3001`

#### CLI

```bash
# Analyze a repository
npx repo-analyzer analyze /path/to/repository

# Batch analyze multiple repositories
npx repo-analyzer batch /path/to/repositories

# Search indexed repositories
npx repo-analyzer search "query"
```

## License

MIT