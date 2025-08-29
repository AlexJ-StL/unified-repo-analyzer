#!/usr/bin/env bun

/**
 * Cleanup script for hanging test processes
 * Run this if you notice too many Bun/Node processes running
 */

import { execSync } from 'node:child_process';

console.log('🧹 Cleaning up test processes...');

try {
  // Kill hanging Bun test processes
  if (process.platform === 'win32') {
    try {
      execSync('taskkill /F /IM bun.exe /T', { stdio: 'ignore' });
      console.log('✅ Killed Bun processes');
    } catch {
      console.log('ℹ️  No Bun processes to kill');
    }

    try {
      execSync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq *vitest*" /T', {
        stdio: 'ignore',
      });
      console.log('✅ Killed Vitest Node processes');
    } catch {
      console.log('ℹ️  No Vitest Node processes to kill');
    }
  } else {
    try {
      execSync('pkill -f "bun.*test"', { stdio: 'ignore' });
      console.log('✅ Killed Bun test processes');
    } catch {
      console.log('ℹ️  No Bun test processes to kill');
    }

    try {
      execSync('pkill -f "vitest"', { stdio: 'ignore' });
      console.log('✅ Killed Vitest processes');
    } catch {
      console.log('ℹ️  No Vitest processes to kill');
    }
  }

  console.log('🎉 Cleanup complete!');
} catch (_error) {
  process.exit(1);
}
