#!/usr/bin/env node
/**
 * Script to process backend package in manageable chunks
 * Works across all platforms and terminals
 */

import { spawn } from 'child_process';
import path from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const writeMode = args.includes('--write');
const unsafeMode = args.includes('--unsafe');
const maxDiagnosticsIndex = args.indexOf('--max-diagnostics');
const maxDiagnostics = maxDiagnosticsIndex !== -1 ? args[maxDiagnosticsIndex + 1] : '20';

// Define backend chunks
const chunks = [
  'packages/backend/src/config',
  'packages/backend/src/types',
  'packages/backend/src/utils',
  'packages/backend/src/providers',
  'packages/backend/src/services',
  'packages/backend/src/core',
  'packages/backend/src/api',
  'packages/backend/src/scripts',
  'packages/backend/src/__tests__',
  'packages/backend/src/index.ts',
];

console.log('🔧 Processing Backend Package in Chunks');
console.log(
  `Write mode: ${writeMode} | Unsafe: ${unsafeMode} | Max diagnostics: ${maxDiagnostics}`
);
console.log('');

let processedChunks = 0;
let totalErrors = 0;
let totalWarnings = 0;

async function processChunk(chunk) {
  return new Promise((resolve) => {
    console.log(`📁 Processing: ${chunk}`);

    // Build command arguments
    const biomeArgs = ['biome', 'check', chunk, `--max-diagnostics=${maxDiagnostics}`];

    if (writeMode) {
      biomeArgs.push('--write');
    }

    if (unsafeMode) {
      biomeArgs.push('--unsafe');
    }

    // Execute command
    const child = spawn('bun', biomeArgs, {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${chunk} - No issues found`);
      } else {
        console.log(`⚠️  ${chunk} - Issues found (exit code: ${code})`);

        // Extract error/warning counts
        const combinedOutput = output + errorOutput;
        const errorMatch = combinedOutput.match(/Found (\d+) errors/);
        const warningMatch = combinedOutput.match(/Found (\d+) warnings/);

        if (errorMatch) {
          const chunkErrors = Number.parseInt(errorMatch[1]);
          totalErrors += chunkErrors;
          console.log(`   Errors: ${chunkErrors}`);
        }

        if (warningMatch) {
          const chunkWarnings = Number.parseInt(warningMatch[1]);
          totalWarnings += chunkWarnings;
          console.log(`   Warnings: ${chunkWarnings}`);
        }
      }

      processedChunks++;
      console.log('');
      resolve();
    });
  });
}

async function processAllChunks() {
  for (const chunk of chunks) {
    await processChunk(chunk);
  }

  console.log('📊 Summary');
  console.log(`Processed chunks: ${processedChunks}/${chunks.length}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log(`Total warnings: ${totalWarnings}`);
  console.log('');

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log('🎉 All backend chunks processed successfully!');
  } else {
    console.log('🔧 Consider running with --write to auto-fix issues');
    console.log('⚠️  Use --unsafe for additional fixes (review changes carefully)');
  }

  console.log('');
  console.log(
    '💡 Usage: node scripts/biome-backend-chunks.js [--write] [--unsafe] [--max-diagnostics N]'
  );
}

// Run the script
processAllChunks().catch(console.error);
