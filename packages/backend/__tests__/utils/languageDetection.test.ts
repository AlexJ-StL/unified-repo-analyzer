/**
 * Tests for language detection utilities
 */

import { test, expect, describe, beforeEach, afterEach } from 'bun:test';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { promisify } from 'util';
import {
  detectLanguageFromPath,
  detectLanguageFromShebang,
  detectLanguage,
  detectFrameworks,
  LANGUAGES,
} from '../../src/utils/languageDetection';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const rmdir = promisify(fs.rm);

describe('Language Detection Utilities', () => {
  let testDir: string;

  // Create a test directory structure before tests
  beforeEach(async () => {
    // Create a temporary test directory
    testDir = path.join(os.tmpdir(), `repo-analyzer-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });

    // Create test files with different languages
    await writeFile(path.join(testDir, 'script.js'), 'console.log("Hello");');
    await writeFile(
      path.join(testDir, 'component.tsx'),
      'export const Component = () => <div>Hello</div>;'
    );
    await writeFile(path.join(testDir, 'script.py'), 'print("Hello")');
    await writeFile(path.join(testDir, 'script.sh'), '#!/bin/bash\necho "Hello"');
    await writeFile(path.join(testDir, 'script.rb'), '#!/usr/bin/env ruby\nputs "Hello"');
    await writeFile(path.join(testDir, 'index.html'), '<html><body>Hello</body></html>');
    await writeFile(path.join(testDir, 'styles.css'), 'body { color: red; }');
    await writeFile(path.join(testDir, 'data.json'), '{"name":"test"}');
    await writeFile(path.join(testDir, 'README.md'), '# Test Repository');
    await writeFile(path.join(testDir, 'Dockerfile'), 'FROM node:14');
    await writeFile(
      path.join(testDir, 'package.json'),
      '{"name":"test","dependencies":{"react":"17.0.2"}}'
    );
    await writeFile(path.join(testDir, 'tsconfig.json'), '{"compilerOptions":{}}');
  });

  // Clean up test directory after tests
  afterEach(async () => {
    await rmdir(testDir, { recursive: true, force: true });
  });

  describe('LANGUAGES constant', () => {
    test('should contain definitions for common languages', () => {
      expect(LANGUAGES.length).toBeGreaterThan(0);

      // Check for some common languages
      const languageNames = LANGUAGES.map((l) => l.name);
      expect(languageNames).toContain('JavaScript');
      expect(languageNames).toContain('TypeScript');
      expect(languageNames).toContain('Python');
      expect(languageNames).toContain('Java');
      expect(languageNames).toContain('HTML');
      expect(languageNames).toContain('CSS');
    });

    test('should have extensions defined for each language', () => {
      for (const lang of LANGUAGES) {
        expect(lang.extensions).toBeDefined();
        expect(Array.isArray(lang.extensions)).toBe(true);
        expect(lang.extensions.length).toBeGreaterThan(0);
      }
    });
  });

  describe('detectLanguageFromPath', () => {
    test('should detect language based on file extension', () => {
      expect(detectLanguageFromPath('script.js')).toBe('JavaScript');
      expect(detectLanguageFromPath('component.tsx')).toBe('TypeScript');
      expect(detectLanguageFromPath('script.py')).toBe('Python');
      expect(detectLanguageFromPath('index.html')).toBe('HTML');
      expect(detectLanguageFromPath('styles.css')).toBe('CSS');
      expect(detectLanguageFromPath('data.json')).toBe('JSON');
      expect(detectLanguageFromPath('README.md')).toBe('Markdown');
    });

    test('should detect language based on filename', () => {
      expect(detectLanguageFromPath('package.json')).toBe('JavaScript');
      expect(detectLanguageFromPath('tsconfig.json')).toBe('TypeScript');
      expect(detectLanguageFromPath('Dockerfile')).toBe('Unknown');
    });

    test('should return "Unknown" for unrecognized files', () => {
      expect(detectLanguageFromPath('unknown.xyz')).toBe('Unknown');
      expect(detectLanguageFromPath('noextension')).toBe('Unknown');
    });
  });

  describe('detectLanguageFromShebang', () => {
    test('should detect language based on shebang', () => {
      expect(detectLanguageFromShebang('#!/bin/bash\necho "Hello"')).toBe('Shell');
      expect(detectLanguageFromShebang('#!/usr/bin/env python\nprint("Hello")')).toBe('Python');
      expect(detectLanguageFromShebang('#!/usr/bin/env ruby\nputs "Hello"')).toBe('Ruby');
      expect(detectLanguageFromShebang('#!/usr/bin/env node\nconsole.log("Hello")')).toBe(null);
    });

    test('should return null for content without shebang', () => {
      expect(detectLanguageFromShebang('console.log("Hello");')).toBe(null);
      expect(detectLanguageFromShebang('print("Hello")')).toBe(null);
      expect(detectLanguageFromShebang('')).toBe(null);
    });
  });

  describe('detectLanguage', () => {
    test('should detect language from file path and content', async () => {
      const jsFilePath = path.join(testDir, 'script.js');
      const pyFilePath = path.join(testDir, 'script.py');
      const shFilePath = path.join(testDir, 'script.sh');

      expect(await detectLanguage(jsFilePath)).toBe('JavaScript');
      expect(await detectLanguage(pyFilePath)).toBe('Python');
      expect(await detectLanguage(shFilePath)).toBe('Shell');
    });

    test('should use provided content if available', async () => {
      expect(await detectLanguage('unknown.file', '#!/bin/bash\necho "Hello"')).toBe('Shell');
      expect(await detectLanguage('unknown.file', '#!/usr/bin/env python\nprint("Hello")')).toBe(
        'Python'
      );
      expect(await detectLanguage('unknown.file', 'console.log("Hello");')).toBe('Unknown');
    });

    test('should return "Unknown" for unrecognized files', async () => {
      const unknownFilePath = path.join(testDir, 'unknown.xyz');
      await writeFile(unknownFilePath, 'Some content');

      expect(await detectLanguage(unknownFilePath)).toBe('Unknown');
    });
  });

  describe('detectFrameworks', () => {
    test('should detect frameworks based on file patterns', async () => {
      // Create React-like project structure
      await mkdir(path.join(testDir, 'react-project'), { recursive: true });
      await writeFile(
        path.join(testDir, 'react-project', 'package.json'),
        '{"dependencies":{"react":"17.0.2","react-dom":"17.0.2"}}'
      );
      await writeFile(
        path.join(testDir, 'react-project', 'App.jsx'),
        'import React from "react"; export default () => <div>App</div>;'
      );

      const reactFiles = [
        path.join(testDir, 'react-project', 'package.json'),
        path.join(testDir, 'react-project', 'App.jsx'),
      ];

      const reactFrameworks = await detectFrameworks(
        reactFiles,
        path.join(testDir, 'react-project', 'package.json')
      );

      expect(reactFrameworks.length).toBeGreaterThan(0);
      expect(reactFrameworks[0].name).toBe('React');
      expect(reactFrameworks[0].confidence).toBeGreaterThan(0.5);
    });

    test('should detect frameworks based on dependencies', async () => {
      const packageJsonPath = path.join(testDir, 'package.json');
      const frameworks = await detectFrameworks([packageJsonPath], packageJsonPath);

      expect(frameworks.length).toBeGreaterThan(0);
      expect(frameworks[0].name).toBe('React');
      expect(frameworks[0].confidence).toBeGreaterThan(0);
    });

    test('should return empty array for unrecognized projects', async () => {
      // Create generic project with no framework
      await mkdir(path.join(testDir, 'generic-project'), { recursive: true });
      await writeFile(
        path.join(testDir, 'generic-project', 'package.json'),
        '{"dependencies":{"lodash":"4.17.21"}}'
      );
      await writeFile(path.join(testDir, 'generic-project', 'index.js'), 'console.log("Hello");');

      const genericFiles = [
        path.join(testDir, 'generic-project', 'package.json'),
        path.join(testDir, 'generic-project', 'index.js'),
      ];

      const genericFrameworks = await detectFrameworks(
        genericFiles,
        path.join(testDir, 'generic-project', 'package.json')
      );

      expect(genericFrameworks.length).toBe(0);
    });
  });
});
