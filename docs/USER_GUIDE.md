# User Guide — Unified Repository Analyzer

This guide explains how to analyze repositories using the web UI and CLI, interpret results, and optimize workflows.
- Project version: root 1.0.0; packages @unified-repo-analyzer/{backend,frontend,cli,shared} 0.1.0

## Table of Contents

- Getting Started
- Web Interface Guide
- Command Line Interface
- Analysis Modes
- Understanding Results
- Advanced Features
- Best Practices
- Troubleshooting

## Getting Started

### First-time setup

1) Access the application
- Web Interface: http://localhost:3001 (default)
- CLI: npm install -g @unified-repo-analyzer/cli

2) Configure LLM provider
- Settings → LLM Providers
- Provide at least one API key (Claude, Gemini, OpenRouter)
- Test the connection

3) Set analysis preferences
- Choose default mode (Quick, Standard, Comprehensive)
- Set file and line limits
- Choose output formats (json, markdown, html)

### Quick Start Tutorial

Let's analyze your first repository:

1. **Select Repository**
   - Click "Analyze Repository" on the main page
   - Enter the path to your repository (e.g., `/path/to/your/project`)
   - Or use the file browser to navigate to your project

2. **Configure Analysis**
   - Choose "Standard" mode for a balanced analysis
   - Keep default settings for your first analysis
   - Click "Start Analysis"

3. **Review Results**
   - Wait for the analysis to complete (usually 30-90 seconds)
   - Explore the Executive Summary for a high-level overview
   - Check the Technical Breakdown for detailed insights
   - Review recommendations and potential issues

## Web Interface Guide

### Main Dashboard

The dashboard provides an overview of your analyzed repositories and quick access to key features:

- **Recent Analyses**: View your most recently analyzed repositories
- **Quick Actions**: Start new analysis, search repositories, or view batch results
- **Statistics**: See analysis counts, success rates, and system status
- **Shortcuts**: Access frequently used features quickly

### Repository Analysis

#### Single Repository Analysis

1) Repository selection
- Path input: enter a full path
- File browser: use the integrated selector
- Recent paths: pick from recent
- Validation: path and access checks are automatic

2) Analysis configuration
- Mode
  - Quick: 5–15s
  - Standard: 30–90s
  - Comprehensive: 2–10m
- Provider
  - Claude: code understanding, docs
  - Gemini: technical analysis and patterns
  - Mock: test without API cost
- Limits
  - Max files (default 100)
  - Max lines per file (default 1000)
- Output
  - json (machine)
  - markdown (readable)
  - html (rich report)

3. **Progress Tracking**
   - Real-time progress updates with WebSocket connection
   - File processing status and current operation
   - Estimated time remaining and completion percentage
   - Cancel option if needed

#### Batch Analysis

For analyzing multiple repositories simultaneously:

1. **Add Repositories**
   - Click "Add Repository" to add each path
   - Import from a text file with one path per line
   - Use glob patterns for automatic discovery (e.g., `/projects/*/`)

2. **Batch Configuration**
   - Apply the same settings to all repositories
   - Or configure individual settings per repository
   - Set concurrency limits to manage system resources

3. **Monitor Progress**
   - View progress for each repository individually
   - See overall batch completion status
   - Handle partial failures gracefully

### Search and Discovery

#### Repository Search

1. **Basic Search**
   - Enter keywords in the search box
   - Search across repository names, descriptions, and technologies
   - Use filters to narrow results

2. **Advanced Filters**
   ```
   Languages: Filter by programming languages
   Frameworks: Filter by frameworks and libraries
   File Types: Filter by specific file extensions
   Size Range: Filter by repository size
   Date Range: Filter by analysis date
   Tags: Filter by custom tags
   ```

3. **Search Results**
   - Repository cards with key information
   - Sort by relevance, date, size, or complexity
   - Pagination for large result sets
   - Export search results

#### Repository Discovery

- **Technology Trends**: See what technologies are most used in your repositories
- **Similar Projects**: Find repositories with similar technology stacks
- **Integration Opportunities**: Discover repositories that could work well together
- **Orphaned Projects**: Identify repositories that haven't been analyzed recently

### Results Visualization

#### Executive Summary
- **Project Overview**: High-level description of the repository's purpose
- **Technology Stack**: Primary languages, frameworks, and tools used
- **Key Metrics**: File counts, size, complexity indicators
- **Health Score**: Overall assessment of code quality and maintainability

#### Technical Breakdown
- **Architecture Analysis**: Code structure and organization patterns
- **Dependency Analysis**: External dependencies and their relationships
- **Code Quality Metrics**: Complexity, maintainability, and technical debt
- **Security Considerations**: Potential security issues and recommendations

#### Interactive Features
- **Expandable Sections**: Click to expand detailed information
- **File Tree Navigation**: Browse the repository structure interactively
- **Code Snippets**: View important code sections with syntax highlighting
- **Dependency Graphs**: Visual representation of project dependencies

### Export and Sharing

#### Export Options
1. **JSON Export**
   - Complete analysis data in structured format
   - Suitable for integration with other tools
   - Includes all metadata and raw analysis results

2. **Markdown Export**
   - Human-readable documentation format
   - Perfect for README files or documentation
   - Includes formatted tables and code blocks

3. **HTML Export**
   - Rich, styled report with navigation
   - Suitable for presentations or sharing with stakeholders
   - Includes interactive elements and charts

#### Sharing Features
- **Direct Links**: Share analysis results with team members
- **Email Integration**: Send reports via email
- **Slack/Teams Integration**: Post summaries to team channels
- **Print-Friendly**: Optimized layouts for printing

## Command Line Interface

### Installation

```bash
# Install globally
npm install -g @unified-repo-analyzer/cli

# Or run via npx
npx @unified-repo-analyzer/cli --help
```

### Basic commands

#### Single repository analysis
```bash
# Basic analysis
repo-analyzer analyze /path/to/repository

# With options
repo-analyzer analyze /path/to/repository \
  --mode comprehensive \
  --provider claude \
  --output json,markdown \
  --max-files 500
```

#### Batch Analysis
```bash
# Analyze multiple repositories
repo-analyzer batch /projects/repo1 /projects/repo2 /projects/repo3

# From file list
repo-analyzer batch --from-file repositories.txt

# With glob patterns
repo-analyzer batch "/projects/*/"
```

#### Search and discovery
```bash
# Search repositories
repo-analyzer search "javascript react"

# With filters
repo-analyzer search --language javascript --framework react

# List with sort/limit
repo-analyzer list --sort-by date --limit 20
```

#### Export Operations
```bash
# Export specific analysis
repo-analyzer export analysis-id --format html --output report.html

# Export search results
repo-analyzer search "python" --export results.json
```

### Configuration

#### Global configuration
```bash
# Set default LLM provider
repo-analyzer config set llm.provider claude
repo-analyzer config set llm.apiKey your-api-key

# Default analysis mode
repo-analyzer config set analysis.mode standard

# Output preferences
repo-analyzer config set output.formats json,markdown
```

#### Project configuration
Place .repo-analyzer.json in your project root:
```json
{
  "analysis": {
    "mode": "standard",
    "maxFiles": 200,
    "maxLinesPerFile": 2000,
    "includeLLMAnalysis": true,
    "includeTree": true
  },
  "llm": {
    "provider": "claude",
    "model": "claude-3-sonnet"
  },
  "output": {
    "formats": ["json", "markdown"],
    "directory": "./analysis-results"
  },
  "ignore": ["node_modules","dist","build","*.log"]
}
```

### Advanced CLI Usage

#### Scripting and Automation
```bash
#!/bin/bash
# analyze-all-projects.sh

PROJECTS_DIR="/workspace/projects"
RESULTS_DIR="/workspace/analysis-results"

mkdir -p "$RESULTS_DIR"

for project in "$PROJECTS_DIR"/*; do
  if [ -d "$project" ]; then
    project_name=$(basename "$project")
    echo "Analyzing $project_name..."
    
    repo-analyzer analyze "$project" \
      --mode standard \
      --output json,markdown \
      --output-dir "$RESULTS_DIR/$project_name" \
      --quiet
  fi
done

echo "Analysis complete. Results in $RESULTS_DIR"
```

#### CI/CD Integration
```yaml
# .github/workflows/analyze.yml
name: Repository Analysis

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install analyzer
        run: npm install -g @unified-repo-analyzer/cli
        
      - name: Analyze repository
        run: |
          repo-analyzer analyze . \
            --mode quick \
            --provider mock \
            --output json \
            --output-file analysis.json
        env:
          CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
          
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: analysis-results
          path: analysis.json
```

## Analysis Modes

### Quick (5–15s)
Includes: structure, language/framework detection, basic metrics, dependencies, simple patterns.
Excludes: LLM insights and deep analysis.
Use: overviews, CI, cataloging.

### Standard (30–90s)
Includes: Quick + LLM summary, technical breakdown, recommendations, potential issues, code quality.
Excludes: deep architecture/security/performance.
Use: daily workflow, reviews, docs, team sharing.

### Comprehensive (2–10m)
Includes: Standard + deep architecture, comprehensive metrics, security assessment, performance suggestions, advanced patterns, technical debt.
Use: architecture reviews, debt assessment, security audits, major decisions.

## Understanding Results

### Executive Summary

The executive summary provides a high-level overview designed for non-technical stakeholders:

```
Project: E-commerce Web Application
Purpose: Modern React-based e-commerce platform with Node.js backend
Technology Stack: React, Node.js, PostgreSQL, Redis
Maturity: Production-ready with good test coverage
Team Size: Suitable for 5-8 developers
Maintenance: Well-structured, moderate maintenance requirements
```

**Key sections**:
- **Project Purpose**: What the application does
- **Technology Assessment**: Modern vs. legacy technologies
- **Code Quality**: Overall health and maintainability
- **Team Recommendations**: Suggested team size and skills
- **Business Impact**: Potential risks and opportunities

### Technical Breakdown

Detailed technical information for developers and architects:

#### Architecture Analysis
```
Pattern: Microservices with API Gateway
Structure: Well-organized with clear separation of concerns
Modularity: High - components are loosely coupled
Scalability: Good - designed for horizontal scaling
Testability: Excellent - comprehensive test suite
```

#### Code Quality Metrics
```
Cyclomatic Complexity: 12 (Good)
Maintainability Index: 78/100 (Good)
Technical Debt: Low
Test Coverage: 85%
Documentation: Comprehensive
```

#### Dependencies
```
Production Dependencies: 45
Development Dependencies: 67
Outdated Packages: 3 (minor updates available)
Security Vulnerabilities: 0
License Issues: None detected
```

### Recommendations

Actionable suggestions for improvement:

#### High Priority
- Update outdated dependencies (security patches available)
- Add error boundaries to React components
- Implement API rate limiting

#### Medium Priority
- Improve test coverage for edge cases
- Add performance monitoring
- Consider code splitting for better loading times

#### Low Priority
- Update documentation for new features
- Consider migrating to TypeScript
- Optimize bundle size

### Potential Issues

Identified problems and risks:

#### Security
- Missing input validation on user registration endpoint
- Sensitive data logged in production environment
- CORS configuration too permissive

#### Performance
- Large bundle size affecting load times
- N+1 query problem in user dashboard
- Missing database indexes on frequently queried columns

#### Maintainability
- Some components exceed recommended complexity
- Inconsistent error handling patterns
- Missing documentation for complex algorithms

## Advanced Features

### Repository Comparison

Compare multiple repositories to identify:

1. **Technology Overlap**
   - Common languages and frameworks
   - Shared dependencies
   - Similar architectural patterns

2. **Integration Opportunities**
   - Compatible technology stacks
   - Complementary functionality
   - Potential for code sharing

3. **Standardization Needs**
   - Inconsistent patterns across projects
   - Different approaches to similar problems
   - Opportunities for shared libraries

### Relationship Detection

Automatically discover relationships between repositories:

- **Direct Dependencies**: Projects that depend on each other
- **Shared Libraries**: Common internal libraries used across projects
- **Similar Purpose**: Projects solving similar problems
- **Technology Alignment**: Projects using compatible technology stacks

### Custom Analysis Profiles

Create custom analysis profiles for different use cases:

#### Security-Focused Profile
```json
{
  "name": "Security Audit",
  "analysis": {
    "mode": "comprehensive",
    "focusAreas": ["security", "dependencies", "vulnerabilities"],
    "includeSecurityScan": true,
    "checkLicenses": true
  },
  "output": {
    "formats": ["json", "html"],
    "includeSecurityReport": true
  }
}
```

#### Performance Profile
```json
{
  "name": "Performance Analysis",
  "analysis": {
    "mode": "comprehensive",
    "focusAreas": ["performance", "optimization", "bundleSize"],
    "includePerformanceMetrics": true,
    "analyzeBundleSize": true
  }
}
```

### Integration APIs

#### Webhook Integration
```javascript
// Webhook endpoint for analysis completion
app.post('/webhook/analysis-complete', (req, res) => {
  const { analysisId, status, results } = req.body;
  
  if (status === 'completed') {
    // Process results
    processAnalysisResults(results);
    
    // Notify team
    notifyTeam(`Analysis ${analysisId} completed`);
  }
  
  res.status(200).send('OK');
});
```

#### REST API Usage
```javascript
// Programmatic analysis
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    path: '/path/to/repository',
    mode: 'standard',
    options: {
      maxFiles: 200,
      includeLLMAnalysis: true
    }
  })
});

const analysis = await response.json();
```

## Best Practices

### Repository preparation

1) Clean up before analysis
- Remove build artifacts and temporary files
- Install dependencies
- Update documentation

2) Configure ignore patterns
```text
# .repo-analyzer-ignore
node_modules/
dist/
build/
*.log
.env
coverage/
```

3) Organize code structure
- Consistent naming
- Group related files
- Clear separation of concerns

### Analysis Strategy

1. **Start with Quick Mode**
   - Get an overview before deep analysis
   - Identify potential issues early
   - Validate configuration and access

2. **Use Standard Mode for Regular Work**
   - Balance between speed and insight
   - Suitable for most development workflows
   - Good for team collaboration

3. **Reserve Comprehensive Mode for Important Decisions**
   - Architecture reviews
   - Security audits
   - Major refactoring decisions

### Team Collaboration

1. **Establish Analysis Standards**
   - Define when to run analysis
   - Set quality thresholds
   - Create shared configuration profiles

2. **Share Results Effectively**
   - Use appropriate export formats
   - Include context and recommendations
   - Follow up on identified issues

3. **Integrate with Workflow**
   - Add to code review process
   - Include in CI/CD pipelines
   - Regular health checks

### Performance Optimization

1. **Manage File Limits**
   - Set appropriate limits for your use case
   - Focus on important files first
   - Use ignore patterns effectively

2. **Choose Providers Wisely**
   - Consider cost and performance trade-offs
   - Use mock provider for testing
   - Monitor API usage and costs

3. **Cache Results**
   - Avoid re-analyzing unchanged repositories
   - Use incremental analysis when possible
   - Clean up old cache data regularly

## Troubleshooting

### Common Issues

#### Analysis Fails to Start
**Symptoms**: Analysis doesn't begin or fails immediately

**Possible Causes**:
- Invalid repository path
- Permission issues
- Missing LLM API key
- Network connectivity problems

**Solutions**:
1. Verify repository path exists and is accessible
2. Check file permissions
3. Validate LLM provider configuration
4. Test network connectivity

#### Slow Analysis Performance
**Symptoms**: Analysis takes much longer than expected

**Possible Causes**:
- Large repository size
- High file count
- Network latency to LLM provider
- System resource constraints

**Solutions**:
1. Reduce file limits
2. Use ignore patterns to exclude unnecessary files
3. Choose faster analysis mode
4. Check system resources (CPU, memory)

#### Incomplete Results
**Symptoms**: Analysis completes but results seem incomplete

**Possible Causes**:
- File access permissions
- Unsupported file types
- LLM provider rate limiting
- Token limit exceeded

**Solutions**:
1. Check file permissions
2. Review supported file types
3. Monitor API rate limits
4. Adjust token limits in configuration

#### Export Failures
**Symptoms**: Cannot export or download results

**Possible Causes**:
- Browser security restrictions
- Server storage issues
- Large file size
- Network interruption

**Solutions**:
1. Try different export format
2. Check browser download settings
3. Verify server disk space
4. Use smaller result sets

### Error Messages

#### "Repository not found or inaccessible"
- Verify the path is correct
- Check file system permissions
- Ensure the directory contains a valid repository

#### "LLM provider authentication failed"
- Verify API key is correct
- Check API key permissions
- Ensure provider service is available

#### "Analysis timeout"
- Reduce file limits
- Use faster analysis mode
- Check network connectivity
- Increase timeout settings

#### "Insufficient system resources"
- Close other applications
- Increase available memory
- Reduce concurrent analyses
- Use smaller batch sizes

### Getting help

1) Documentation
- User guide (this document)
- API docs
- Troubleshooting

2) Community
- GitHub Discussions
- Stack Overflow (tag: unified-repo-analyzer)

3) Support
- Email: support@unified-repo-analyzer.com

### Reporting issues

Include:
- System: OS, Node.js, app version
- Error: message, steps to reproduce, expected vs actual
- Configuration: analysis settings, LLM provider config, custom settings
- Repository: size, structure, languages, special characteristics