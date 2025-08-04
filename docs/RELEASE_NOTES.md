# Unified Repository Analyzer - Release Notes

This document tracks notable changes for the monorepo. Package versions currently: root 1.0.0; packages: @unified-repo-analyzer/{backend,frontend,cli,shared} 0.1.0.

## 1.0.0 — Initial release
Release date: 2025-08-04

Highlights
- Unified analysis engine with intelligent file prioritization
- Multi-format export: JSON, Markdown, HTML
- Batch analysis with progress tracking
- Web UI (React + TypeScript) with live status via WebSocket
- CLI for automation with CI/CD examples
- Repository index for search, discovery, and relationships
- Bun runtime, Biome lint/format, Bun test runner

Technical
- Monorepo with shared types and utilities
- REST API + WebSocket updates
- Frontend bundles code-split; target sub-1MB initial load
- Concurrent processing with caching

Security
- Input validation and robust error handling
- Rate limiting on API endpoints
- Secure defaults and production checklists

Getting started
```bash
bun install
bun run dev
bun test
bun run build:prod
```

Docker
```bash
bun run docker:up
bun run docker:logs
```

Supported technologies
- Languages: TypeScript/JavaScript, Python, Java, C#/.NET, Go, Rust, PHP, Ruby, Swift, Kotlin, others
- Frameworks: React, Vue, Angular, Express, FastAPI, Spring Boot, Django, Rails, .NET Core, others

Migration
- Initial release; no migration steps required.

Known issues
- Very large repos may need increased memory
- Binary files are intentionally skipped
- WebSocket timeouts possible on slow networks; configure backend timeouts

Roadmap
- 1.1.0: Additional LLM providers, dependency graphs, plugin system, performance improvements
- 1.2.0: Team collaboration, historical analysis, integration APIs, advanced reporting

Performance (targets)
- Small (<100 files): ~5–15s
- Medium (100–1000): ~30–90s
- Large (1000+): ~2–10m

Contributing
See docs/CONTRIBUTING.md.

License
MIT — see LICENSE.

Support
- Documentation: docs/
- Issues: https://github.com/your-org/unified-repo-analyzer/issues
- Discussions: https://github.com/your-org/unified-repo-analyzer/discussions
- Email: support@unified-repo-analyzer.com

Previous versions
- None yet; 1.0.0 is the initial release.