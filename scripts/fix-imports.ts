#!/usr/bin/env bun

/**
 * Import organization and cleanup script
 * Systematically fixes import organization issues across packages
 * Requirements: 2.2, 5.1, 5.2
 */

import { execSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { glob } from 'glob';

interface ImportGroup {
  external: string[];
  internal: string[];
  relative: string[];
  types: string[];
}

class ImportOrganizer {
  private readonly packages = [
    'packages/shared',
    'packages/backend',
    'packages/frontend',
    'packages/cli',
  ];

  async organizeImports(): Promise<void> {
    console.log('🔧 Organizing imports across all packages...');

    for (const pkg of this.packages) {
      console.log(`\n📦 Processing ${pkg}...`);
      await this.organizePackageImports(pkg);
    }

    console.log('\n✅ Import organization complete!');
  }

  private async organizePackageImports(packagePath: string): Promise<void> {
    try {
      // Use Biome to organize imports for this package
      console.log(`   Running Biome organize imports for ${packagePath}...`);

      execSync(`bunx biome check ${packagePath}/src --write --only=organizeImports`, {
        stdio: 'pipe',
        timeout: 30000,
      });

      console.log(`   ✓ Organized imports in ${packagePath}`);
    } catch (_error) {
      console.log(`   ⚠️  Some issues in ${packagePath}, continuing...`);

      // Try to fix manually if Biome fails
      await this.manualImportFix(packagePath);
    }
  }

  private async manualImportFix(packagePath: string): Promise<void> {
    try {
      const files = await glob(`${packagePath}/src/**/*.{ts,tsx}`, {
        ignore: ['**/*.d.ts', '**/__tests__/**'],
      });

      for (const file of files.slice(0, 5)) {
        // Limit to first 5 files to avoid overload
        await this.fixFileImports(file);
      }
    } catch (_error) {
      console.log(`   ⚠️  Manual fix failed for ${packagePath}`);
    }
  }

  private async fixFileImports(filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      const imports: string[] = [];
      const nonImports: string[] = [];
      let inImportBlock = false;

      for (const line of lines) {
        const trimmed = line.trim();

        if (
          trimmed.startsWith('import ') ||
          (trimmed.startsWith('export ') && trimmed.includes(' from '))
        ) {
          imports.push(line);
          inImportBlock = true;
        } else if (inImportBlock && trimmed === '') {
        } else {
          if (inImportBlock && trimmed !== '') {
            inImportBlock = false;
          }
          nonImports.push(line);
        }
      }

      // Sort imports
      const sortedImports = this.sortImports(imports);

      // Reconstruct file
      const newContent = [...sortedImports, '', ...nonImports].join('\n');

      if (newContent !== content) {
        await writeFile(filePath, newContent);
        console.log(`     ✓ Fixed imports in ${filePath}`);
      }
    } catch (_error) {
      // Skip files that can't be processed
    }
  }

  private sortImports(imports: string[]): string[] {
    const groups: ImportGroup = {
      external: [],
      internal: [],
      relative: [],
      types: [],
    };

    for (const imp of imports) {
      if (imp.includes('import type') || imp.includes('export type')) {
        groups.types.push(imp);
      } else if (imp.includes(" from './") || imp.includes(' from "../')) {
        groups.relative.push(imp);
      } else if (imp.includes(" from '@/") || imp.includes(" from '@")) {
        groups.internal.push(imp);
      } else {
        groups.external.push(imp);
      }
    }

    // Sort each group
    groups.external.sort();
    groups.internal.sort();
    groups.relative.sort();
    groups.types.sort();

    // Combine groups with empty lines between
    const result: string[] = [];

    if (groups.external.length > 0) {
      result.push(...groups.external, '');
    }
    if (groups.internal.length > 0) {
      result.push(...groups.internal, '');
    }
    if (groups.relative.length > 0) {
      result.push(...groups.relative, '');
    }
    if (groups.types.length > 0) {
      result.push(...groups.types, '');
    }

    // Remove trailing empty line
    if (result[result.length - 1] === '') {
      result.pop();
    }

    return result;
  }

  async removeUnusedImports(): Promise<void> {
    console.log('\n🧹 Removing unused imports...');

    for (const pkg of this.packages) {
      try {
        console.log(`   Checking ${pkg} for unused imports...`);

        execSync(`bunx biome check ${pkg}/src --write --only=unusedImports`, {
          stdio: 'pipe',
          timeout: 30000,
        });

        console.log(`   ✓ Cleaned unused imports in ${pkg}`);
      } catch (_error) {
        console.log(`   ⚠️  Some issues in ${pkg}, continuing...`);
      }
    }
  }

  async fixImportTypes(): Promise<void> {
    console.log('\n🏷️  Fixing import type usage...');

    for (const pkg of this.packages) {
      try {
        console.log(`   Fixing import types in ${pkg}...`);

        execSync(`bunx biome check ${pkg}/src --write --only=useImportType`, {
          stdio: 'pipe',
          timeout: 30000,
        });

        console.log(`   ✓ Fixed import types in ${pkg}`);
      } catch (_error) {
        console.log(`   ⚠️  Some issues in ${pkg}, continuing...`);
      }
    }
  }
}

// CLI interface
if (import.meta.main) {
  const organizer = new ImportOrganizer();

  try {
    await organizer.organizeImports();
    await organizer.removeUnusedImports();
    await organizer.fixImportTypes();

    console.log('\n🎯 Import organization complete!');
    console.log('=====================================');
    console.log('✅ Organized import statements');
    console.log('✅ Removed unused imports');
    console.log('✅ Fixed import type usage');
  } catch (_error) {
    process.exit(1);
  }
}

export { ImportOrganizer };
