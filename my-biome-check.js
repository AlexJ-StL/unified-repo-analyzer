#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const biomeBinPath = path.join(__dirname, 'node_modules', '.bin', 'biome');
const args = process.argv.slice(2); // Get arguments passed to this script

console.log(`Executing: ${biomeBinPath} ${args.join(' ')}`);

const child = spawn(biomeBinPath, args, { stdio: 'inherit' });

child.on('error', (_error) => {
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code);
});
