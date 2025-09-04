#!/usr/bin/env bun

/**
 * Selective Test Runner
 * Runs only tests affected by recent changes
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

async function runSelectiveTests() {
  console.log('🎯 Running selective tests based on changes...');
  
  try {
    // Get changed files
    let changedFiles: string[] = [];
    
    try {
      const gitOutput = execSync('git diff --name-only HEAD~1', {
        encoding: 'utf-8',
        timeout: 5000,
      });
      changedFiles = gitOutput.trim().split('\n').filter(Boolean);
    } catch {
      console.log('⚠️ Could not detect git changes, running all tests');
      changedFiles = [];
    }
    
    if (changedFiles.length === 0) {
      console.log('📝 No changes detected, running minimal test set');
      execSync('bun test --maxConcurrency=1', {
        stdio: 'inherit',
        timeout: 30000,
      });
      return;
    }
    
    console.log(`📁 Found ${changedFiles.length} changed files`);
    
    // Find related test files
    const testFiles: string[] = [];
    
    for (const file of changedFiles) {
      // Direct test files
      if (file.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/)) {
        testFiles.push(file);
      }
      
      // Find corresponding test files
      const testFile = file.replace(/\.(ts|tsx|js|jsx)$/, '.test.$1');
      if (existsSync(testFile)) {
        testFiles.push(testFile);
      }
      
      // Package-level tests
      const packageMatch = file.match(/packages\/([^/]+)/);
      if (packageMatch) {
        const packageName = packageMatch[1];
        try {
          // Use cross-platform glob instead of Unix find command
          const { glob } = await import('glob');
          const packageTests = await glob(`packages/${packageName}/**/*.test.*`, {
            cwd: process.cwd(),
          });
          testFiles.push(...packageTests);
        } catch {
          // Glob might not be available, skip package tests
        }
      }
    }
    
    const uniqueTestFiles = [...new Set(testFiles)];
    
    if (uniqueTestFiles.length === 0) {
      console.log('🔍 No specific tests found, running fast subset');
      execSync('bun test --maxConcurrency=1', {
        stdio: 'inherit',
        timeout: 30000,
      });
    } else {
      console.log(`🧪 Running ${uniqueTestFiles.length} affected tests`);
      const testPaths = uniqueTestFiles.join(' ');
      execSync(`bun test ${testPaths}`, {
        stdio: 'inherit',
        timeout: 60000,
      });
    }
    
    console.log('✅ Selective tests completed');
    
  } catch (error) {
    console.error('❌ Selective test execution failed:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  await runSelectiveTests();
}
