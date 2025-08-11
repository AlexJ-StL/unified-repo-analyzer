# Build Validation and Recovery System

This document describes the comprehensive build validation, recovery, and monitoring system implemented for the unified repository analyzer.

## Overview

The build validation system consists of four main components:

1. **Build Doctor** - Comprehensive diagnostics and automated recovery
2. **Recovery Tools** - Automated scripts for common build failures
3. **Health Monitor** - Continuous health checks and validation
4. **Build Monitor** - Real-time monitoring and prevention system

## Quick Start

### Immediate Build Issues
```bash
# Quick health check and automated fixes
bun run build:doctor:fix

# Full recovery if issues persist
bun run recovery:full

# Comprehensive health report
bun run build:health
```

### Continuous Monitoring
```bash
# Start continuous monitoring (recommended for development)
bun run monitor:start

# Check monitor status
bun run monitor:status

# Stop monitoring
bun run monitor:stop
```

## Components

### 1. Build Doctor (`scripts/build-doctor.ts`)

Comprehensive build diagnostics and recovery tool that analyzes your build environment and provides automated fixes.

**Features:**
- Project structure validation
- Dependency integrity checks
- TypeScript configuration analysis
- Build script validation
- Environment compatibility checks
- Automated recovery suggestions
- Safe automated fixes

**Usage:**
```bash
# Run diagnostics only
bun run build:doctor

# Run diagnostics and apply safe fixes
bun run build:doctor:fix
```

**Output:**
- Console report with color-coded status
- Detailed JSON report saved to `build-doctor-report.json`
- Specific recovery recommendations

### 2. Recovery Tools (`scripts/recovery-tools.ts`)

Automated recovery scripts for common build failures with different levels of intervention.

**Available Recovery Actions:**

| Command                  | Description                       | Risk Level | Duration  |
| ------------------------ | --------------------------------- | ---------- | --------- |
| `recovery:clean-deps`    | Clean and reinstall dependencies  | Low        | 2-5 min   |
| `recovery:fix-types`     | Fix TypeScript compilation issues | Medium     | 5-15 min  |
| `recovery:check-env`     | Validate build environment        | Low        | 1-2 min   |
| `recovery:fix-scripts`   | Repair build scripts              | Medium     | 2-5 min   |
| `recovery:fix-workspace` | Fix workspace configuration       | Low        | 2-5 min   |
| `recovery:full`          | Run complete recovery sequence    | Medium     | 10-30 min |
| `recovery:nuclear`       | Complete environment reset        | High       | 15-45 min |

**Usage Examples:**
```bash
# Clean and restore dependencies
bun run recovery:clean-deps

# Fix TypeScript issues
bun run recovery:fix-types

# Complete recovery (recommended)
bun run recovery:full

# Nuclear option (last resort)
bun run recovery:nuclear
```

### 3. Health Monitor (`scripts/build-health-monitor.ts`)

Comprehensive health checking system that evaluates multiple aspects of your build environment.

**Health Checks:**
- **Dependency Health** - node_modules integrity, package accessibility
- **TypeScript Health** - Compiler access, configuration validity, compilation success
- **Build System Health** - Script configuration, build process functionality
- **Workspace Health** - Package structure, workspace linking
- **Environment Health** - Node.js version, system resources, tool availability
- **Performance Health** - Build times, dependency size, optimization opportunities
- **Security Health** - Sensitive file exposure, configuration security
- **Maintenance Health** - Outdated dependencies, cleanup opportunities

**Usage:**
```bash
# Run comprehensive health check
bun run build:health
```

**Output:**
- Overall health score (0-100)
- Detailed status for each health category
- Specific recommendations for improvements
- Health report saved to `build-health-report.json`

### 4. Build Monitor (`scripts/build-monitor.ts`)

Real-time monitoring system that watches for changes and proactively prevents build issues.

**Features:**
- **File Watching** - Monitors configuration files for changes
- **Periodic Health Checks** - Regular automated health assessments
- **Automated Alerts** - Notifications for health degradation
- **Auto-Fix Capabilities** - Automatic resolution of common issues
- **Health History** - Tracks health trends over time
- **Configurable Thresholds** - Customizable alert and fix triggers

**Usage:**
```bash
# Start continuous monitoring
bun run monitor:start

# Check current status
bun run monitor:status

# Stop monitoring
bun run monitor:stop
```

**Configuration:**
Monitor behavior is configured via `.kiro/build-monitor.json`:

```json
{
  "enabled": true,
  "checkInterval": 300000,
  "healthThreshold": 80,
  "performanceThreshold": 120000,
  "watchFiles": [
    "package.json",
    "packages/*/package.json",
    "tsconfig.json"
  ],
  "notifications": {
    "console": true,
    "file": true
  },
  "autoFix": {
    "enabled": true,
    "safeOnly": true,
    "maxAttempts": 3
  }
}
```

## Integration with Development Workflow

### Daily Development
```bash
# Morning routine
bun run build:health

# Before major changes
bun run build:doctor

# After dependency changes
bun run recovery:clean-deps
```

### Continuous Integration
```bash
# In CI pipeline
bun run build:doctor
if [ $? -ne 0 ]; then
  bun run recovery:full
  bun run build:doctor
fi
```

### Development Environment Setup
```bash
# Initial setup
bun install
bun run build:doctor:fix
bun run monitor:start

# Keep monitor running during development
```

## Troubleshooting Guide

### Common Scenarios

#### "Build suddenly stopped working"
```bash
# Step 1: Quick diagnosis
bun run build:doctor

# Step 2: Automated recovery
bun run recovery:full

# Step 3: Verify fix
bun run build:health
```

#### "Dependencies seem corrupted"
```bash
# Clean dependency recovery
bun run recovery:clean-deps

# Verify installation
bun run recovery:check-env
```

#### "TypeScript errors everywhere"
```bash
# Fix TypeScript issues
bun run recovery:fix-types

# Rebuild shared package
bun run build:shared
```

#### "Nothing works, need fresh start"
```bash
# Nuclear option (destructive)
bun run recovery:nuclear

# Verify everything works
bun run build:health
```

### Understanding Health Scores

- **90-100**: Excellent health, no action needed
- **80-89**: Good health, minor optimizations possible
- **70-79**: Fair health, some issues should be addressed
- **60-69**: Poor health, immediate attention recommended
- **Below 60**: Critical health, recovery actions required

### Alert Severity Levels

- **Info** 🟢: Informational, no immediate action required
- **Warning** 🟡: Potential issue, should be addressed soon
- **Critical** 🔴: Serious issue, immediate action required

## File Locations

### Generated Reports
- `build-doctor-report.json` - Detailed diagnostic report
- `build-health-report.json` - Comprehensive health assessment
- `build-monitor-alerts.json` - Monitor alert history

### Configuration Files
- `.kiro/build-monitor.json` - Monitor configuration
- `package.json` - Build scripts and dependencies
- `tsconfig.json` - TypeScript configuration

### Log Files
- `backend.log` - Backend application logs
- `backend.err` - Backend error logs

## Best Practices

### Prevention
1. **Run daily health checks** during development
2. **Monitor file changes** with continuous monitoring
3. **Address warnings early** before they become critical
4. **Keep dependencies updated** regularly
5. **Use workspace commands** for package-specific operations

### Recovery
1. **Start with least invasive** recovery options
2. **Run diagnostics first** to understand the problem
3. **Use automated fixes** when available
4. **Verify fixes** with health checks
5. **Document recurring issues** for future prevention

### Monitoring
1. **Enable continuous monitoring** during active development
2. **Set appropriate thresholds** for your team's needs
3. **Review alert history** to identify patterns
4. **Configure notifications** for your workflow
5. **Use auto-fix judiciously** - enable for safe operations only

## Advanced Usage

### Custom Recovery Procedures
You can extend the recovery system by adding custom procedures to the recovery tools script or creating additional scripts that follow the same patterns.

### Integration with CI/CD
The validation system is designed to integrate with continuous integration pipelines:

```yaml
# Example GitHub Actions integration
- name: Validate Build Environment
  run: |
    bun run build:doctor
    if [ $? -ne 0 ]; then
      bun run recovery:full
      bun run build:doctor || exit 1
    fi
```

### Webhook Notifications
The monitor system supports webhook notifications for integration with Slack, Discord, or other notification systems. Configure the webhook URL in the monitor configuration.

### Performance Optimization
The system includes performance monitoring and can suggest optimizations:
- Dependency cleanup recommendations
- Build time optimization suggestions
- Memory usage monitoring
- Disk space management

## Support and Maintenance

### Regular Maintenance
- Review health reports weekly
- Update recovery procedures as needed
- Monitor system performance trends
- Keep validation tools updated

### Getting Help
1. Check the health report for specific guidance
2. Review alert history for patterns
3. Run diagnostics with verbose output
4. Consult the recovery procedures documentation

The build validation system is designed to be self-maintaining and should provide clear guidance for resolving most common build issues automatically.