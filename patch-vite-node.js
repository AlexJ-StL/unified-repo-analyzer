import { readFileSync, writeFileSync } from 'node:fs';

// Patch the vite-node client to fix Windows path issues with Bun
const clientPath = 'node_modules/vite-node/dist/client.mjs';
const content = readFileSync(clientPath, 'utf8');

// Find the import lines and add isAbsolute
const importLines = content.split('\n');
const importLineIndex = importLines.findIndex((line) =>
  line.includes("import { createRequire } from 'node:module';")
);

if (importLineIndex !== -1) {
  // Update the import line to include isAbsolute
  importLines[importLineIndex] = "import { createRequire } from 'node:module';";
  importLines[importLineIndex + 1] = "import { resolve, dirname, isAbsolute } from 'node:path';";

  const updatedContent = importLines.join('\n');
  writeFileSync(clientPath, updatedContent, 'utf8');

  console.log('Successfully updated vite-node imports for Windows+Bun compatibility');
} else {
  process.exit(1);
}
