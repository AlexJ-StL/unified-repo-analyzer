/**
 * Simple test script for Path Validation Utility
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathValidator, SecurityLevel } from './packages/shared/src/utils/path-utils.js';

async function testPathUtils() {
  console.log('Testing Path Validation Utility...\n');

  // Create a temporary test file
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'path-test-'));
  const testFile = path.join(tempDir, 'test.txt');
  const testDir = path.join(tempDir, 'testdir');

  try {
    // Create test files
    await fs.writeFile(testFile, 'test content');
    await fs.mkdir(testDir);

    console.log('1. Testing valid file path:');
    const fileResult = await pathValidator.validatePath(testFile);
    console.log(`   Valid: ${fileResult.isValid}`);
    console.log(`   Normalized: ${fileResult.normalizedPath}`);
    console.log(`   Exists: ${fileResult.metadata.exists}`);
    console.log(`   Is File: ${fileResult.metadata.isFile}`);

    console.log('\n2. Testing valid directory path:');
    const dirResult = await pathValidator.validatePath(testDir);
    console.log(`   Valid: ${dirResult.isValid}`);
    console.log(`   Normalized: ${dirResult.normalizedPath}`);
    console.log(`   Exists: ${dirResult.metadata.exists}`);
    console.log(`   Is Directory: ${dirResult.metadata.isDirectory}`);

    console.log('\n3. Testing non-existent path:');
    const nonexistentResult = await pathValidator.validatePath(
      path.join(tempDir, 'nonexistent.txt')
    );
    console.log(`   Valid: ${nonexistentResult.isValid}`);
    console.log(`   Errors: ${nonexistentResult.errors.map((e) => e.code).join(', ')}`);

    console.log('\n4. Testing invalid path (empty):');
    const emptyResult = await pathValidator.validatePath('');
    console.log(`   Valid: ${emptyResult.isValid}`);
    console.log(`   Errors: ${emptyResult.errors.map((e) => e.code).join(', ')}`);

    console.log('\n5. Testing quick validation:');
    const quickResult = await pathValidator.quickValidate(testFile, SecurityLevel.STANDARD);
    console.log(`   Valid: ${quickResult.isValid}`);
    console.log(`   Exists: ${quickResult.metadata.exists}`);

    console.log('\n6. Testing security checks:');
    const maliciousPath = path.join(testDir, '..', '..', 'etc', 'passwd');
    const securityResult = await pathValidator.validatePath(maliciousPath, {
      securityChecks: true,
    });
    console.log(`   Malicious path valid: ${securityResult.isValid}`);
    console.log(`   Errors: ${securityResult.errors.map((e) => e.code).join(', ')}`);

    console.log('\n✅ Path Validation Utility tests completed successfully!');
  } catch (_error) {
  } finally {
    // Clean up
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (_e) {
      // Ignore cleanup errors
    }
  }
}

// Run the test
testPathUtils().catch(console.error);
