/**
 * File importance scoring algorithm for repository analysis
 */

import path from 'path';
import { detectLanguageFromPath } from './languageDetection';

/**
 * Importance score factors
 */
export interface ImportanceFactors {
  /**
   * Base score for the file
   */
  baseScore: number;

  /**
   * Score based on file location
   */
  locationScore: number;

  /**
   * Score based on file type
   */
  typeScore: number;

  /**
   * Score based on file name
   */
  nameScore: number;

  /**
   * Score based on file size
   */
  sizeScore: number;
}

/**
 * Important file patterns by category
 */
export const IMPORTANT_FILE_PATTERNS = {
  // Configuration files
  config: [
    'package.json',
    'tsconfig.json',
    'webpack.config.js',
    'babel.config.js',
    '.eslintrc',
    '.prettierrc',
    'jest.config.js',
    'vite.config.js',
    'next.config.js',
    'nuxt.config.js',
    'angular.json',
    'vue.config.js',
    'rollup.config.js',
    'svelte.config.js',
    'tailwind.config.js',
    'postcss.config.js',
    'stylelint.config.js',
    'commitlint.config.js',
    'lerna.json',
    'nx.json',
    'turbo.json',
    'pnpm-workspace.yaml',
    'rush.json',
    'Cargo.toml',
    'pyproject.toml',
    'setup.py',
    'requirements.txt',
    'Pipfile',
    'poetry.lock',
    'Gemfile',
    'build.gradle',
    'pom.xml',
    'settings.gradle',
    'composer.json',
    'go.mod',
    'Dockerfile',
    'docker-compose.yml',
    '.dockerignore',
    '.gitignore',
    '.github/workflows',
    'azure-pipelines.yml',
    'bitbucket-pipelines.yml',
    'cloudbuild.yaml',
    'Jenkinsfile',
    '.travis.yml',
    '.circleci/config.yml',
    'appveyor.yml',
    'vercel.json',
    'netlify.toml',
    'firebase.json',
    'serverless.yml',
    'terraform.tf',
    'k8s',
    'kubernetes',
    'helm',
    'chart.yaml',
    'values.yaml',
  ],

  // Documentation files
  documentation: [
    'README',
    'readme',
    'README.md',
    'readme.md',
    'CONTRIBUTING',
    'CONTRIBUTING.md',
    'contributing.md',
    'LICENSE',
    'LICENSE.md',
    'license.md',
    'CHANGELOG',
    'CHANGELOG.md',
    'changelog.md',
    'API.md',
    'api.md',
    'ARCHITECTURE.md',
    'architecture.md',
    'DESIGN.md',
    'design.md',
    'ROADMAP.md',
    'roadmap.md',
    'SECURITY.md',
    'security.md',
    'SUPPORT.md',
    'support.md',
    'GOVERNANCE.md',
    'governance.md',
    'CODE_OF_CONDUCT.md',
    'code_of_conduct.md',
    'docs/',
    'documentation/',
    'wiki/',
  ],

  // Entry point files
  entryPoint: [
    'index.js',
    'index.ts',
    'index.tsx',
    'index.jsx',
    'main.js',
    'main.ts',
    'main.py',
    'app.js',
    'app.ts',
    'app.py',
    'server.js',
    'server.ts',
    'cli.js',
    'cli.ts',
    'start.js',
    'start.ts',
    'run.js',
    'run.ts',
    'run.py',
    'Program.cs',
    'Main.java',
    'Application.java',
    'App.java',
    'App.kt',
    'Main.kt',
    'Application.kt',
  ],

  // Test files
  test: [
    'test/',
    'tests/',
    '__tests__/',
    'spec/',
    'specs/',
    '__spec__/',
    'e2e/',
    'cypress/',
    'jest/',
    'mocha/',
    'vitest/',
    'playwright/',
    'selenium/',
    'test.js',
    'test.ts',
    'spec.js',
    'spec.ts',
    '.test.js',
    '.test.ts',
    '.spec.js',
    '.spec.ts',
    '_test.go',
    '_test.py',
    'test_',
    'Test.java',
    'Tests.cs',
  ],

  // Core implementation files
  core: [
    'src/',
    'lib/',
    'app/',
    'core/',
    'internal/',
    'pkg/',
    'components/',
    'modules/',
    'services/',
    'controllers/',
    'models/',
    'views/',
    'hooks/',
    'utils/',
    'helpers/',
    'common/',
    'shared/',
  ],
};

/**
 * Important file extensions by language
 */
export const IMPORTANT_EXTENSIONS = {
  // JavaScript/TypeScript
  js: ['.js', '.ts', '.jsx', '.tsx'],

  // Python
  python: ['.py', '.pyw', '.ipynb'],

  // Java/Kotlin
  jvm: ['.java', '.kt', '.scala', '.groovy'],

  // C#/.NET
  dotnet: ['.cs', '.fs', '.vb', '.xaml'],

  // Go
  go: ['.go'],

  // Rust
  rust: ['.rs'],

  // Ruby
  ruby: ['.rb', '.erb'],

  // PHP
  php: ['.php'],

  // Swift
  swift: ['.swift'],

  // C/C++
  cpp: ['.c', '.cpp', '.cc', '.h', '.hpp'],

  // Web
  web: ['.html', '.css', '.scss', '.sass', '.less'],

  // Data
  data: ['.json', '.yml', '.yaml', '.xml', '.csv', '.sql'],

  // Documentation
  docs: ['.md', '.mdx', '.rst', '.txt'],
};

/**
 * Calculates importance score for a file
 *
 * @param filePath - Path to the file
 * @param fileSize - Size of the file in bytes
 * @param repoPath - Base path of the repository
 * @returns Importance score between 0 and 1
 */
export function calculateFileImportance(
  filePath: string,
  fileSize: number,
  repoPath: string
): number {
  const factors = calculateImportanceFactors(filePath, fileSize, repoPath);

  // Combine factors with weights
  const weightedScore =
    factors.baseScore * 0.1 +
    factors.locationScore * 0.3 +
    factors.typeScore * 0.25 +
    factors.nameScore * 0.25 +
    factors.sizeScore * 0.1;

  // Normalize to 0-1 range
  return Math.min(Math.max(weightedScore, 0), 1);
}

/**
 * Calculates detailed importance factors for a file
 *
 * @param filePath - Path to the file
 * @param fileSize - Size of the file in bytes
 * @param repoPath - Base path of the repository
 * @returns Importance factors
 */
export function calculateImportanceFactors(
  filePath: string,
  fileSize: number,
  repoPath: string
): ImportanceFactors {
  const relativePath = path.relative(repoPath, filePath);
  const fileName = path.basename(filePath);
  const extension = path.extname(filePath).toLowerCase();
  const language = detectLanguageFromPath(filePath);

  // Base score - all files start with this
  const baseScore = 0.3;

  // Location score - based on directory depth and path patterns
  let locationScore = 0;

  // Files at the root are often important
  const depth = relativePath.split(path.sep).length;
  if (depth === 1) {
    locationScore += 0.4;
  } else if (depth === 2) {
    locationScore += 0.3;
  } else {
    locationScore += Math.max(0.1, 0.5 - (depth - 2) * 0.1);
  }

  // Check for important directories
  for (const pattern of IMPORTANT_FILE_PATTERNS.core) {
    if (relativePath.startsWith(pattern) || relativePath.includes(`/${pattern}`)) {
      locationScore += 0.2;
      break;
    }
  }

  // Type score - based on file extension and language
  let typeScore = 0;

  // Check for important extensions
  for (const [_, extensions] of Object.entries(IMPORTANT_EXTENSIONS)) {
    if (extensions.includes(extension)) {
      typeScore += 0.3;
      break;
    }
  }

  // Adjust based on language
  if (['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust'].includes(language)) {
    typeScore += 0.2;
  }

  // Name score - based on filename patterns
  let nameScore = 0;

  // Check for configuration files
  for (const pattern of IMPORTANT_FILE_PATTERNS.config) {
    if (
      fileName === pattern ||
      relativePath === pattern ||
      relativePath.includes(pattern) ||
      fileName.startsWith(pattern.replace('*', ''))
    ) {
      nameScore += 0.8;
      break;
    }
  }

  // Check for documentation files
  for (const pattern of IMPORTANT_FILE_PATTERNS.documentation) {
    if (
      fileName === pattern ||
      relativePath === pattern ||
      relativePath.includes(pattern) ||
      fileName.startsWith(pattern.replace('*', ''))
    ) {
      nameScore += 0.7;
      break;
    }
  }

  // Check for entry point files
  for (const pattern of IMPORTANT_FILE_PATTERNS.entryPoint) {
    if (
      fileName === pattern ||
      relativePath === pattern ||
      relativePath.includes(pattern) ||
      fileName.startsWith(pattern.replace('*', ''))
    ) {
      nameScore += 0.9;
      break;
    }
  }

  // Check for test files
  for (const pattern of IMPORTANT_FILE_PATTERNS.test) {
    if (
      fileName === pattern ||
      relativePath === pattern ||
      relativePath.includes(pattern) ||
      fileName.startsWith(pattern.replace('*', ''))
    ) {
      nameScore += 0.4;
      break;
    }
  }

  // Size score - based on file size
  // We prefer medium-sized files (not too small, not too large)
  let sizeScore = 0;

  if (fileSize < 100) {
    // Very small files (< 100 bytes) are less important
    sizeScore = 0.2;
  } else if (fileSize < 1024) {
    // Small files (100 bytes - 1 KB)
    sizeScore = 0.4;
  } else if (fileSize < 10 * 1024) {
    // Medium files (1 KB - 10 KB) are ideal
    sizeScore = 0.8;
  } else if (fileSize < 100 * 1024) {
    // Large files (10 KB - 100 KB)
    sizeScore = 0.6;
  } else if (fileSize < 1024 * 1024) {
    // Very large files (100 KB - 1 MB)
    sizeScore = 0.3;
  } else {
    // Huge files (> 1 MB) are less important for analysis
    sizeScore = 0.1;
  }

  return {
    baseScore,
    locationScore,
    typeScore,
    nameScore,
    sizeScore,
  };
}

/**
 * Sorts files by importance score
 *
 * @param files - Array of file paths
 * @param repoPath - Base path of the repository
 * @param fileSizes - Map of file sizes
 * @returns Sorted array of files with importance scores
 */
export function sortFilesByImportance(
  files: string[],
  repoPath: string,
  fileSizes: Map<string, number>
): { path: string; importance: number }[] {
  return files
    .map((file) => {
      const size = fileSizes.get(file) || 0;
      return {
        path: file,
        importance: calculateFileImportance(file, size, repoPath),
      };
    })
    .sort((a, b) => b.importance - a.importance);
}
