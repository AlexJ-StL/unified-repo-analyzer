/**
 * Tests for file system utilities
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import {
  extractDirectoryInfo,
  FileSystemError,
  FileSystemErrorType,
  getCombinedIgnorePatterns,
  getCommonIgnorePatterns,
  readFileWithErrorHandling,
  readGitignore,
  traverseDirectory,
} from '../../src/utils/fileSystem';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const rmdir = promisify(fs.rm);

describe('File System Utilities', () => {
  let testDir: string;

  // Create a test directory structure before tests
  beforeEach(async () => {
    // Create a temporary test directory
    testDir = path.join(os.tmpdir(), `repo-analyzer-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });

    // Create test files and directories
    await mkdir(path.join(testDir, 'src'), { recursive: true });
    await mkdir(path.join(testDir, 'src', 'components'), { recursive: true });
    await mkdir(path.join(testDir, 'src', 'utils'), { recursive: true });
    await mkdir(path.join(testDir, 'tests'), { recursive: true });
    await mkdir(path.join(testDir, 'node_modules'), { recursive: true });
    await mkdir(path.join(testDir, '.git'), { recursive: true });

    // Create some test files
    await writeFile(path.join(testDir, 'package.json'), '{"name":"test"}');
    await writeFile(path.join(testDir, 'README.md'), '# Test Repository');
    await writeFile(path.join(testDir, '.gitignore'), 'node_modules\ndist\n.env');
    await writeFile(path.join(testDir, 'src', 'index.js'), 'console.log("Hello");');
    await writeFile(path.join(testDir, 'src', 'components', 'Button.js'), 'export default Button;');
    await writeFile(
      path.join(testDir, 'src', 'utils', 'helpers.js'),
      'export function helper() {}'
    );
    await writeFile(path.join(testDir, 'tests', 'index.test.js'), 'test("it works");');
  });

  // Clean up test directory after tests
  afterEach(async () => {
    await rmdir(testDir, { recursive: true, force: true });
  });

  describe('traverseDirectory', () => {
    test('should traverse a directory and return files and directories', async () => {
      const result = await traverseDirectory(testDir);

      // Check that we found the expected number of files and directories
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.directories.length).toBeGreaterThan(0);
      expect(result.totalSize).toBeGreaterThan(0);

      // Check that specific files were found
      const fileNames = result.files.map((f) => path.basename(f));
      expect(fileNames).toContain('package.json');
      expect(fileNames).toContain('README.md');
      expect(fileNames).toContain('index.js');
      expect(fileNames).toContain('Button.js');
      expect(fileNames).toContain('helpers.js');
      expect(fileNames).toContain('index.test.js');
    });

    test('should respect maxDepth option', async () => {
      const result = await traverseDirectory(testDir, { maxDepth: 1 });

      // Should only include files in the root directory
      expect(result.files.length).toBe(3); // package.json, README.md, .gitignore
      expect(result.directories.length).toBe(4); // src, tests, node_modules, .git
    });

    test('should respect maxFiles option', async () => {
      const result = await traverseDirectory(testDir, { maxFiles: 2 });

      // Should only include the first 2 files found
      expect(result.files.length).toBe(2);
    });

    test('should respect ignorePatterns option', async () => {
      const result = await traverseDirectory(testDir, {
        ignorePatterns: ['node_modules', '.git', '*.md'],
      });

      // Should not include ignored files and directories
      const fileNames = result.files.map((f) => path.basename(f));
      expect(fileNames).not.toContain('README.md');

      const dirNames = result.directories.map((d) => path.basename(d));
      expect(dirNames).not.toContain('node_modules');
      expect(dirNames).not.toContain('.git');
    });

    test('should respect fileFilter option', async () => {
      const result = await traverseDirectory(testDir, {
        fileFilter: (filePath) => path.extname(filePath) === '.js',
      });

      // Should only include .js files
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.files.every((f) => path.extname(f) === '.js')).toBe(true);
    });

    test('should throw FileSystemError for non-existent directory', async () => {
      const nonExistentDir = path.join(testDir, 'non-existent');

      await expect(traverseDirectory(nonExistentDir)).rejects.toThrow(FileSystemError);
      await expect(traverseDirectory(nonExistentDir)).rejects.toMatchObject({
        type: FileSystemErrorType.NOT_FOUND,
      });
    });

    test('should throw FileSystemError for invalid path', async () => {
      const filePath = path.join(testDir, 'package.json');

      await expect(traverseDirectory(filePath)).rejects.toThrow(FileSystemError);
      await expect(traverseDirectory(filePath)).rejects.toMatchObject({
        type: FileSystemErrorType.INVALID_PATH,
      });
    });
  });

  describe('readFileWithErrorHandling', () => {
    test('should read a file successfully', async () => {
      const filePath = path.join(testDir, 'README.md');
      const content = await readFileWithErrorHandling(filePath);

      expect(content).toBe('# Test Repository');
    });

    test('should throw FileSystemError for non-existent file', async () => {
      const nonExistentFile = path.join(testDir, 'non-existent.txt');

      await expect(readFileWithErrorHandling(nonExistentFile)).rejects.toThrow(FileSystemError);
      await expect(readFileWithErrorHandling(nonExistentFile)).rejects.toMatchObject({
        type: FileSystemErrorType.NOT_FOUND,
      });
    });
  });

  describe('getCommonIgnorePatterns', () => {
    test('should return an array of common ignore patterns', () => {
      const patterns = getCommonIgnorePatterns();

      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns).toContain('node_modules/**');
      expect(patterns).toContain('.git/**');
    });
  });

  describe('readGitignore', () => {
    test('should read and parse .gitignore file', async () => {
      const patterns = await readGitignore(testDir);

      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns).toContain('node_modules');
      expect(patterns).toContain('dist');
      expect(patterns).toContain('.env');
    });

    test('should return empty array if .gitignore does not exist', async () => {
      const emptyDir = path.join(testDir, 'empty');
      await mkdir(emptyDir, { recursive: true });

      const patterns = await readGitignore(emptyDir);

      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBe(0);
    });
  });

  describe('getCombinedIgnorePatterns', () => {
    test('should combine gitignore patterns with common and custom patterns', async () => {
      const customPatterns = ['*.log', 'temp/'];
      const patterns = await getCombinedIgnorePatterns(testDir, customPatterns);

      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns).toContain('node_modules');
      expect(patterns).toContain('dist');
      expect(patterns).toContain('.env');
      expect(patterns).toContain('*.log');
      expect(patterns).toContain('temp/');
      expect(patterns).toContain('node_modules/**'); // From common patterns
    });
  });

  describe('extractDirectoryInfo', () => {
    test('should extract directory information from traversal result', async () => {
      const traversalResult = await traverseDirectory(testDir);
      const dirInfos = extractDirectoryInfo(traversalResult, testDir);

      expect(Array.isArray(dirInfos)).toBe(true);
      expect(dirInfos.length).toBeGreaterThan(0);

      // Check root directory
      const rootDir = dirInfos.find((d) => d.path === '/');
      expect(rootDir).toBeDefined();
      expect(rootDir?.files).toBe(3); // package.json, README.md, .gitignore

      // Check src directory
      const srcDir = dirInfos.find((d) => d.path === 'src' || d.path === '/src');
      expect(srcDir).toBeDefined();
      expect(srcDir?.files).toBe(1); // index.js
      expect(srcDir?.subdirectories).toBe(2); // components, utils
    });
  });
});
