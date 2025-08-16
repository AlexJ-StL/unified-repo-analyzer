# Scripts Directory

This directory contains utility scripts for development, build, and maintenance tasks.

## Biome Code Quality Scripts

### biome-backend-chunks.ps1

**Purpose**: Process the large backend package in manageable chunks to avoid freezing issues.

**Usage:**
```powershell
# Check only (reports issues without fixing)
powershell -ExecutionPolicy Bypass -File scripts/biome-backend-chunks.ps1

# Auto-fix safe issues
powershell -ExecutionPolicy Bypass -File scripts/biome-backend-chunks.ps1 -Write

# Include unsafe fixes (review changes carefully)
powershell -ExecutionPolicy Bypass -File scripts/biome-backend-chunks.ps1 -Write -Unsafe

# Increase diagnostic limit
powershell -ExecutionPolicy Bypass -File scripts/biome-backend-chunks.ps1 -MaxDiagnostics 100
```

**Parameters:**
- `-Write`: Apply safe fixes automatically
- `-Unsafe`: Apply unsafe fixes (use with caution)
- `-MaxDiagnostics <number>`: Set maximum diagnostics to display per chunk

**Why needed**: The backend package is large and can cause Biome to freeze when processed as a whole. This script breaks it down into smaller chunks:
- `packages/backend/src/config`
- `packages/backend/src/types`
- `packages/backend/src/utils`
- `packages/backend/src/providers`
- `packages/backend/src/services`
- `packages/backend/src/core`
- `packages/backend/src/api`
- `packages/backend/src/scripts`
- `packages/backend/src/__tests__`
- `packages/backend/src/index.ts`

### biome-folder.ps1

**Purpose**: Process specific folders with Biome.

### biome-report.ps1

**Purpose**: Generate detailed Biome reports.

## Package.json Scripts

The following npm/bun scripts are available for code quality:

```bash
# Standard linting (may freeze on large codebases)
bun run lint
bun run lint:fix
bun run lint:unsafe

# Chunked processing (recommended for backend)
bun run lint:backend          # Check only
bun run lint:backend:fix      # Auto-fix safe issues
bun run lint:backend:unsafe   # Include unsafe fixes

# Safe processing (small packages only)
bun run lint:safe             # Process shared, frontend, cli packages
```

## Build Scripts

### enhanced-build.ts
Main build orchestrator with monitoring and diagnostics.

### build-doctor.ts
Build diagnostics and automated fixes.

### recovery-tools.ts
Dependency and workspace recovery utilities.

### deployment-verification.ts
Production deployment validation checks.

## Best Practices

1. **For development**: Use `bun run lint:backend:fix` for the backend and `bun run lint:safe` for other packages
2. **For CI/CD**: Use `bun run lint` to catch all issues
3. **For cleanup**: Use unsafe fixes sparingly and always review changes
4. **For performance**: Use chunked processing for large codebases

## Troubleshooting

If you encounter issues:

1. **Biome freezes**: Use the chunked processing script
2. **Configuration errors**: Check Biome version compatibility
3. **Binary not found**: Install Biome globally: `npm install -g @biomejs/biome`
4. **Permission errors**: Run PowerShell as administrator or adjust execution policy

See [TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md) for detailed solutions.