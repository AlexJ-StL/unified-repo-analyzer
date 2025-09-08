#!/usr/bin/env node

/**
 * Fix Vitest+Bun+Windows Compatibility Issue
 *
 * This script patches the vite-node module to fix the "File URL path must be an absolute path" error
 * that occurs when running Vitest with Bun on Windows.
 *
 * The issue is in node_modules/vite-node/dist/client.mjs where pathToFileURL() is called
 * with a non-absolute path on Windows.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const VITE_NODE_CLIENT_PATH = 'node_modules/vite-node/dist/client.mjs';

function patchViteNode() {
  console.log('🔍 Checking vite-node compatibility patch...');

  if (!existsSync(VITE_NODE_CLIENT_PATH)) {
    process.exit(1);
  }

  let content = readFileSync(VITE_NODE_CLIENT_PATH, 'utf8');

  // Check if already patched
  if (content.includes('absoluteModulePath = isAbsolute(modulePath)')) {
    console.log('✅ vite-node is already patched for Windows+Bun compatibility');
    return true;
  }

  // Add isAbsolute import
  const importLines = content.split('\n');
  const createRequireIndex = importLines.findIndex((line) =>
    line.includes("import { createRequire } from 'node:module';")
  );

  if (createRequireIndex === -1) {
    return false;
  }

  // Insert isAbsolute import after createRequire
  importLines.splice(
    createRequireIndex + 1,
    0,
    "import { resolve, dirname, isAbsolute } from 'node:path';"
  );
  content = importLines.join('\n');

  // Find and replace the problematic section
  const modulePathLineIndex = content.indexOf('const modulePath = cleanUrl(moduleId);');

  if (modulePathLineIndex === -1) {
    return false;
  }

  // Replace the problematic lines with fixed version
  const lines = content.split('\n');
  const targetLineIndex = lines.findIndex(
    (line) => line.trim() === 'const modulePath = cleanUrl(moduleId);'
  );

  if (targetLineIndex === -1) {
    return false;
  }

  // Replace with fixed version
  const fixedLines = [
    '		const modulePath = cleanUrl(moduleId);',
    '		// Ensure absolute path for Windows+Bun compatibility',
    '		const absoluteModulePath = isAbsolute(modulePath) ? modulePath : resolve(modulePath);',
    '		// disambiguate the `<UNIT>:/` on windows: see nodejs/node#31710',
    '		const href = pathToFileURL(absoluteModulePath).href;',
  ];

  // Replace the original lines (4 lines) with fixed lines
  lines.splice(targetLineIndex, 4, ...fixedLines);

  const fixedContent = lines.join('\n');

  try {
    writeFileSync(VITE_NODE_CLIENT_PATH, fixedContent, 'utf8');
    console.log('✅ Successfully patched vite-node for Windows+Bun compatibility');
    return true;
  } catch (_error) {
    return false;
  }
}

// Run the patch
if (process.platform === 'win32') {
  console.log('🔧 Running on Windows - applying Vitest+Bun compatibility patch...');
  const success = patchViteNode();
  if (!success) {
    process.exit(1);
  }
} else {
  console.log('✅ Not on Windows - no patch needed');
}
