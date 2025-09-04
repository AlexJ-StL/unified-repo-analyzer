#!/usr/bin/env node
/**
 * CLI bin entry for repo-analyzer.
 * Preserves shebang. Uses dynamic import of built output entry to avoid circular ts-node issues.
 *
 * Note: At build time, ensure the emitted JS retains the shebang (e.g., via tsup/esbuild config or post-build script),
 * or ship this TypeScript file compiled to dist/bin/repo-analyzer.js with the shebang re-inserted.
 *
 * This file intentionally has no exports. It is executed as a program.
 */

// Process is already declared globally

void (async () => {
  await import("../dist/index.js");
})();
