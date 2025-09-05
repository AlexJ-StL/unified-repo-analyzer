const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', '..', 'packages', 'cli', 'bin', 'repo-analyzer.ts');
const destDir = path.resolve(__dirname, '..', 'dist', 'bin');
const dest = path.join(destDir, 'repo-analyzer.js');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

let code = fs.readFileSync(src, 'utf8');
if (!code.startsWith('#!/usr/bin/env node')) {
  code = '#!/usr/bin/env node\n' + code;
}
fs.writeFileSync(dest, code, { mode: 0o755 });
console.log(`Inserted shebang and copied to ${dest}`);