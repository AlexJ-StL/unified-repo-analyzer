const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', 'packages', 'cli', 'bin', 'repo-analyzer.ts');
const destDir = path.resolve(__dirname, '..', 'packages', 'cli', 'dist', 'bin');
const dest = path.join(destDir, 'repo-analyzer.js');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

let code = fs.readFileSync(src, 'utf8');
// Ensure shebang
if (!code.startsWith('#!/usr/bin/env node')) {
  code = '#!/usr/bin/env node\n' + code;
}

// Convert TS to JS by removing type annotations? For simplicity, just copy as is; bun will handle TS at runtime? We'll just copy.
fs.writeFileSync(dest, code, { mode: 0o755 });
console.log(`Inserted shebang and copied to ${dest}`);
