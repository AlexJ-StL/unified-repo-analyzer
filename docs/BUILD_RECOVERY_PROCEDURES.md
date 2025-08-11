# Build Recovery Procedures

This document provides step-by-step recovery procedures for common build failures in the unified repository analyzer application.

## Quick Recovery Commands

For immediate recovery, run these commands in order:

```bash
# 1. Quick health check
bun run build:doctor

# 2. Automated recovery (safe actions only)
bun run build:doctor:fix

# 3. Manual recovery if needed
bun run recovery:full
```

## Common Build Failures and Solutions

### 1. Dependency Corruption Issues

**Symptoms:**
- `bun install` fails with corruption errors
- Missing binary mappings in node_modules/.bin
- "Command not found" errors for installed packages

**Recovery Steps:**
```bash
# Step 1: Complete dependency cleanup
bun run recovery:clean-deps

# Step 2: Force reinstall
bun install --force

# Step 3: Verify installation
bun run build:doctor
```

**Manual Recovery:**
```bash
# Remove all node_modules directories
rm -rf node_modules
rm -rf packages/*/node_modules

# Clear package manager caches
bun pm cache rm

# Reinstall from scratch
bun install
```

### 2. TypeScript Compilation Errors

**Symptoms:**
- Build fails with TypeScript errors
- Type mismatches in API service methods
- Missing type definitions

**Recovery Steps:**
```bash
# Step 1: Check TypeScript configuration
bun run recovery:check-types

# Step 2: Fix common type issues
bun run recovery:fix-types

# Step 3: Rebuild shared types
bun run build:shared
```

**Manual Recovery:**
```bash
# Clear TypeScript cache
rm -f tsconfig.tsbuildinfo
rm -rf packages/*/tsconfig.tsbuildinfo

# Rebuild shared package first
cd packages/shared
bun run build
cd ../..

# Test compilation
bun run build:shared
```

### 3. Build Script Execution Failures

**Symptoms:**
- "tsc not found" errors
- Build scripts fail to execute
- Missing command errors

**Recovery Steps:**
```bash
# Step 1: Validate build environment
bun run recovery:check-env

# Step 2: Fix build scripts
bun run recovery:fix-scripts

# Step 3: Test build process
bun run build
```

**Manual Recovery:**
```bash
# Ensure TypeScript is installed
bun add -D typescript

# Check if build scripts exist
ls -la packages/*/package.json

# Test individual package builds
bun run build:shared
bun run build:backend
bun run build:frontend
bun run build:cli
```

### 4. Development Server Issues

**Symptoms:**
- Backend server fails to start
- Frontend development server errors
- API communication failures

**Recovery Steps:**
```bash
# Step 1: Check server configuration
bun run recovery:check-servers

# Step 2: Fix server issues
bun run recovery:fix-servers

# Step 3: Test development environment
bun run dev:backend &
bun run dev:frontend
```

**Manual Recovery:**
```bash
# Check backend configuration
cd packages/backend
bun run dev

# In another terminal, check frontend
cd packages/frontend  
bun run dev

# Test API connectivity
curl http://localhost:3001/api/health
```

### 5. Workspace Package Linking Issues

**Symptoms:**
- Packages cannot import from shared
- Module resolution errors
- Workspace dependency issues

**Recovery Steps:**
```bash
# Step 1: Validate workspace configuration
bun run recovery:check-workspace

# Step 2: Fix workspace links
bun run recovery:fix-workspace

# Step 3: Rebuild all packages
bun run build
```

**Manual Recovery:**
```bash
# Check workspace configuration
cat package.json | grep -A 5 workspaces

# Reinstall with workspace linking
bun install

# Build packages in dependency order
bun run build:shared
bun run build:backend
bun run build:cli
bun run build:frontend
```

## Emergency Recovery Procedures

### Complete Environment Reset

When all else fails, use this nuclear option:

```bash
# 1. Backup important files
cp -r packages/*/src /tmp/src-backup

# 2. Complete cleanup
bun run recovery:nuclear

# 3. Restore from backup if needed
# cp -r /tmp/src-backup/* packages/*/src/

# 4. Rebuild everything
bun install
bun run build
```

### Rollback to Last Working State

```bash
# 1. Check git status
git status

# 2. Rollback changes
git checkout -- .
git clean -fd

# 3. Restore dependencies
bun install

# 4. Test build
bun run build:doctor
```

## Prevention Measures

### Daily Health Checks

Add to your development routine:

```bash
# Morning health check
bun run build:doctor

# Before committing
bun run build && bun run test:all
```

### Automated Monitoring

Set up these automated checks:

1. **Pre-commit hooks**: Validate build before commits
2. **CI/CD checks**: Run full build validation on push
3. **Dependency monitoring**: Check for outdated or vulnerable packages

### Best Practices

1. **Always build shared package first**: `bun run build:shared`
2. **Use workspace commands**: Prefer `bun run --cwd packages/package-name command`
3. **Keep dependencies updated**: Regular `bun update` runs
4. **Monitor build logs**: Check for warnings that might indicate future issues

## Troubleshooting Tips

### Debugging Build Issues

1. **Enable verbose logging**:
   ```bash
   DEBUG=1 bun run build
   ```

2. **Check individual package builds**:
   ```bash
   cd packages/shared && bun run build
   cd packages/backend && bun run build
   cd packages/frontend && bun run build
   cd packages/cli && bun run build
   ```

3. **Validate TypeScript configuration**:
   ```bash
   bunx tsc --noEmit
   ```

### Getting Help

1. **Run build doctor**: `bun run build:doctor`
2. **Check logs**: Look in `build-doctor-report.json`
3. **Review error messages**: Focus on the first error, not cascading errors
4. **Check system requirements**: Node.js >=18, Bun >=1.0

## Recovery Script Reference

| Command                        | Description                      | Risk Level |
| ------------------------------ | -------------------------------- | ---------- |
| `bun run recovery:clean-deps`  | Clean and reinstall dependencies | Low        |
| `bun run recovery:fix-types`   | Fix common TypeScript issues     | Medium     |
| `bun run recovery:check-env`   | Validate build environment       | Low        |
| `bun run recovery:fix-scripts` | Repair build scripts             | Medium     |
| `bun run recovery:nuclear`     | Complete environment reset       | High       |
| `bun run build:doctor`         | Comprehensive diagnostics        | Low        |
| `bun run build:doctor:fix`     | Automated safe fixes             | Low        |

## Contact and Support

For issues not covered by these procedures:

1. Check the build doctor report: `build-doctor-report.json`
2. Review recent changes: `git log --oneline -10`
3. Check system resources: Memory, disk space, permissions
4. Consult the development team or create an issue

Remember: When in doubt, start with `bun run build:doctor` for a comprehensive analysis of your build environment.