# Unified Repository Analyzer - User Guide

Welcome to the Unified Repository Analyzer! This comprehensive tool helps you understand, analyze, and organize your code repositories through intelligent analysis and insights.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [User Interfaces](#user-interfaces)
5. [Analysis Modes](#analysis-modes)
6. [Export Formats](#export-formats)
7. [Repository Index](#repository-index)
8. [Advanced Features](#advanced-features)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

## Getting Started

The Unified Repository Analyzer provides three ways to interact with your repositories:

- **Web Interface**: Modern React-based UI for interactive analysis
- **Command Line Interface (CLI)**: Perfect for automation and scripting
- **REST API**: For integration with other tools and services

### What Can You Do?

- **Analyze Individual Repositories**: Get detailed insights about structure, dependencies, and code quality
- **Batch Process Multiple Repositories**: Analyze entire directories of projects at once
- **Search and Discover**: Find repositories by technology, framework, or keywords
- **Export Results**: Generate reports in JSON, Markdown, or HTML formats
- **Track Relationships**: Discover connections and potential combinations between repositories

## Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Git (for repository analysis)

### Install from npm

```bash
# Install globally for CLI access
bun install -g @unified-repo-analyzer/cli

# Or install locally in your project
bun install @unified-repo-analyzer/cli
```

### Install from Source

```bash
# Clone the repository
git clone https://github.com/unified-repo-analyzer/unified-repo-analyzer.git
cd unified-repo-analyzer

# Install dependencies
bun install

# Build all packages
bun run build

# Start the development server
bun run dev
```

## Quick Start

### Using the CLI

```bash
# Analyze a single repository
repo-analyzer analyze /path/to/your/project

# Analyze with specific options
repo-analyzer analyze /path/to/your/project --mode comprehensive --format markdown

# Batch analyze multiple repositories
repo-analyzer batch /path/to/projects/directory

# Search your indexed repositories
repo-analyzer search --languages JavaScript,TypeScript --frameworks React
```

### Using the Web Interface

1. Start the server:
   ```bash
   bun run dev
   ```

2. Open your browser to `http://localhost:3000`

3. Select a repository using the file browser

4. Configure analysis options

5. Click "Analyze" and watch real-time progress

6. Explore results in the interactive interface

### Using the API

```bash
# Start analysis
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/path/to/repository",
    "options": {
      "mode": "standard",
      "includeLLMAnalysis": false
    }
  }'

# Get results
curl http://localhost:3000/api/analysis/{analysisId}
```

## User Interfaces

### Web Interface Features

The React-based web interface provides:

- **Repository Selection**: Browse and select repositories from your file system
- **Analysis Configuration**: Choose analysis depth, LLM providers, and output options
- **Real-time Progress**: Watch analysis progress with detailed status updates
- **Interactive Results**: Explore results with tabbed views and interactive visualizations
- **Search Interface**: Find repositories using advanced filtering options
- **Export Tools**: Download results in multiple formats

#### Navigation

- **Home**: Repository selection and analysis configuration
- **Results**: View and interact with analysis results
- **Index**: Browse and search your repository index
- **Settings**: Configure preferences and LLM providers

### CLI Interface Features

The command-line interface offers:

- **Scriptable Commands**: Perfect for automation and CI/CD integration
- **Progress Indicators**: Visual progress bars and status updates
- **Flexible Output**: Multiple format options and customizable verbosity
- **Batch Processing**: Efficient handling of multiple repositories
- **Configuration Files**: Save and reuse analysis configurations

#### Available Commands

```bash
# Analysis commands
repo-analyzer analyze <path> [options]
repo-analyzer batch <base-path> [options]

# Index management
repo-analyzer index --rebuild
repo-analyzer index --update

# Search and discovery
repo-analyzer search [query] [options]
repo-analyzer similar <repository-id>

# Export and sharing
repo-analyzer export <analysis-id> --format <format>
```

## Analysis Modes

### Quick Mode

Fast analysis focusing on basic structure and metadata:

- File and directory counting
- Language detection
- Basic dependency analysis
- Configuration file identification

**Use when**: You need rapid overview of many repositories

**Time**: Usually completes in seconds

```bash
repo-analyzer analyze /path/to/repo --mode quick
```

### Standard Mode (Default)

Balanced analysis with comprehensive insights:

- Everything from Quick mode
- Code structure analysis (functions, classes)
- Framework detection
- File importance scoring
- Dependency graph analysis

**Use when**: You want detailed insights without LLM processing

**Time**: Usually completes in under a minute

```bash
repo-analyzer analyze /path/to/repo --mode standard
```

### Comprehensive Mode

Deep analysis with AI-powered insights:

- Everything from Standard mode
- LLM-generated executive summaries
- Technical recommendations
- Code quality assessment
- Architectural pattern detection

**Use when**: You need the most detailed analysis possible

**Time**: Can take several minutes depending on repository size

```bash
repo-analyzer analyze /path/to/repo --mode comprehensive --llm-provider claude
```

## Export Formats

### JSON Format

Structured data perfect for programmatic processing:

```json
{
  "name": "my-project",
  "language": "TypeScript",
  "frameworks": ["React", "Express"],
  "dependencies": {
    "production": [
      {"name": "react", "version": "^18.0.0"}
    ]
  },
  "insights": {
    "executiveSummary": "A modern React application...",
    "technicalBreakdown": "The codebase follows..."
  }
}
```

**Use for**: API integration, data processing, custom reporting

### Markdown Format

Human-readable documentation:

```markdown
# Repository Analysis: my-project

## Overview
A modern React application built with TypeScript...

## Technical Details
- **Primary Language**: TypeScript
- **Framework**: React
- **Build Tool**: Vite

## Dependencies
### Production
- react (^18.0.0)
- react-dom (^18.0.0)
```

**Use for**: Documentation, README files, team sharing

### HTML Format

Rich, styled reports with navigation:

- Interactive tables and charts
- Syntax-highlighted code samples
- Responsive design for all devices
- Print-friendly layouts

**Use for**: Presentations, detailed reports, archival

## Repository Index

The repository index maintains searchable metadata about all analyzed repositories.

### Automatic Indexing

Every analyzed repository is automatically added to the index with:

- Basic metadata (name, path, size, languages)
- Framework and technology detection
- Dependency information
- Analysis timestamps
- Custom tags and categories

### Search Capabilities

Find repositories using various criteria:

```bash
# Search by language
repo-analyzer search --languages "JavaScript,Python"

# Search by framework
repo-analyzer search --frameworks "React,Django"

# Search by keywords
repo-analyzer search --keywords "api,microservice"

# Combined search
repo-analyzer search --languages TypeScript --frameworks React --keywords "dashboard"
```

### Web Interface Search

The web interface provides advanced search with:

- Real-time filtering
- Faceted search (language, framework, size)
- Saved searches
- Search history
- Repository comparison tools

## Advanced Features

### LLM Integration

Configure multiple LLM providers for enhanced analysis:

#### Supported Providers

- **Claude (Anthropic)**: Excellent for code analysis and technical writing
- **Gemini (Google)**: Strong performance with good cost efficiency
- **OpenAI GPT**: Versatile with good general knowledge

#### Configuration

```bash
# Set up Claude
export CLAUDE_API_KEY="your-api-key"
repo-analyzer analyze /path/to/repo --llm-provider claude

# Configure in web interface
# Go to Settings > LLM Providers > Add Provider
```

### Repository Relationships

Discover connections between repositories:

#### Similarity Detection

Find repositories with similar:
- Technology stacks
- Architectural patterns
- Dependency profiles
- Code structure

#### Combination Suggestions

Get AI-powered suggestions for:
- Merging related repositories
- Creating shared libraries
- Microservice extraction
- Code reuse opportunities

### Performance Optimization

#### Caching

- Analysis results are cached to avoid reprocessing
- Configurable TTL (Time To Live)
- Automatic cache invalidation

#### Concurrent Processing

- Batch operations use worker pools
- Configurable concurrency limits
- Progress tracking for long operations

#### Resource Management

- Memory usage monitoring
- File size limits
- Processing timeouts

## Troubleshooting

### Common Issues

#### "Path not found" Error

**Problem**: Repository path doesn't exist or isn't accessible

**Solutions**:
- Verify the path exists: `ls /path/to/repository`
- Check permissions: `ls -la /path/to/repository`
- Use absolute paths instead of relative paths

#### Analysis Timeout

**Problem**: Large repositories taking too long to analyze

**Solutions**:
- Use Quick mode for initial analysis
- Increase timeout limits: `--timeout 300000`
- Exclude large directories: `--ignore node_modules,dist,build`

#### LLM API Errors

**Problem**: LLM provider returning errors

**Solutions**:
- Verify API key is correct
- Check rate limits and quotas
- Try a different provider
- Disable LLM analysis temporarily

#### Memory Issues

**Problem**: Out of memory errors with large repositories

**Solutions**:
- Reduce max files: `--max-files 500`
- Limit lines per file: `--max-lines-per-file 1000`
- Use streaming mode for large files

### Debug Mode

Enable detailed logging:

```bash
# CLI debug mode
DEBUG=* repo-analyzer analyze /path/to/repo

# Web interface debug
NODE_ENV=development bun run dev
```

### Log Files

Check log files for detailed error information:

- Backend logs: `packages/backend/logs/`
- CLI logs: `~/.repo-analyzer/logs/`
- Browser console for web interface issues

## FAQ

### General Questions

**Q: Is my code sent to external services?**
A: Only if you enable LLM analysis. You can analyze repositories completely offline by disabling LLM features.

**Q: What file types are supported?**
A: The analyzer supports 100+ programming languages and file types. See the full list in the documentation.

**Q: Can I analyze private repositories?**
A: Yes, all analysis is performed locally. Your code never leaves your machine unless you explicitly enable LLM analysis.

### Performance Questions

**Q: How long does analysis take?**
A: Depends on repository size and analysis mode:
- Quick: Seconds to minutes
- Standard: Minutes
- Comprehensive: Minutes to hours for very large repositories

**Q: Can I analyze multiple repositories simultaneously?**
A: Yes, use batch mode or the web interface's batch processing feature.

**Q: What are the system requirements?**
A: Minimum 4GB RAM, 1GB free disk space. More RAM recommended for large repositories.

### Technical Questions

**Q: Can I customize the analysis?**
A: Yes, through configuration files, command-line options, and the web interface settings.

**Q: Is there an API for integration?**
A: Yes, a full REST API is available. See the API documentation for details.

**Q: Can I extend the analyzer with custom plugins?**
A: Plugin system is planned for future releases. Currently, you can modify the source code.

### Troubleshooting Questions

**Q: Analysis fails with permission errors**
A: Ensure the analyzer has read permissions for the repository directory and all subdirectories.

**Q: Web interface won't start**
A: Check that port 3000 is available and Node.js version is 18 or higher.

**Q: Results seem incomplete**
A: Check the analysis logs for errors. Some files might be skipped due to size limits or encoding issues.

## Getting Help

### Documentation

- [API Reference](../api/README.md)
- [Developer Guide](../developer/README.md)
- [Configuration Reference](../configuration/README.md)

### Community

- GitHub Issues: Report bugs and request features
- Discussions: Ask questions and share tips
- Discord: Real-time community support

### Support

For enterprise support and custom implementations, contact our team through the GitHub repository.

---

*Last updated: January 2024*