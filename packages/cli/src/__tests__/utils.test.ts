import { test, expect, describe, beforeEach, mock } from 'bun:test';
import fs from 'fs';
import path from 'path';
import {
  validateRepositoryPath,
  ensureOutputDirectory,
  writeResultsToFile,
} from '../utils/fs-utils';
import { CLIError, ErrorType } from '../utils/error-handler';

// Mock fs module
mock.module('fs', () => ({
  existsSync: mock(() => true),
  statSync: mock(() => ({ isDirectory: () => true })),
  accessSync: mock(() => {}),
  mkdirSync: mock(() => {}),
  writeFileSync: mock(() => {}),
  constants: {
    R_OK: 4,
  },
}));

// Mock path module
mock.module('path', () => ({
  resolve: mock((p) => `/resolved/${p}`),
  dirname: mock((p) => `/dirname/${p}`),
  join: mock((dir, file) => `${dir}/${file}`),
  basename: mock((p) => p.split('/').pop()),
}));

describe('File System Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateRepositoryPath', () => {
    test('should return absolute path for valid directory', () => {
      // Mock implementation for valid directory
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({ isDirectory: () => true });
      (fs.accessSync as jest.Mock).mockImplementation(() => {});

      const result = validateRepositoryPath('/test/repo');

      expect(result).toBe('/resolved//test/repo');
      expect(fs.existsSync).toHaveBeenCalledWith('/resolved//test/repo');
      expect(fs.statSync).toHaveBeenCalledWith('/resolved//test/repo');
      expect(fs.accessSync).toHaveBeenCalledWith('/resolved//test/repo', fs.constants.R_OK);
    });

    test('should throw error if path does not exist', () => {
      // Mock implementation for non-existent path
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      expect(() => validateRepositoryPath('/test/repo')).toThrow(CLIError);
      expect(() => validateRepositoryPath('/test/repo')).toThrow('Repository path does not exist');
    });

    test('should throw error if path is not a directory', () => {
      // Mock implementation for file (not directory)
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({ isDirectory: () => false });

      expect(() => validateRepositoryPath('/test/repo')).toThrow(CLIError);
      expect(() => validateRepositoryPath('/test/repo')).toThrow('Path is not a directory');
    });

    test('should throw error if directory is not readable', () => {
      // Mock implementation for unreadable directory
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({ isDirectory: () => true });
      (fs.accessSync as jest.Mock).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => validateRepositoryPath('/test/repo')).toThrow(CLIError);
      expect(() => validateRepositoryPath('/test/repo')).toThrow('Directory is not readable');
    });
  });

  describe('ensureOutputDirectory', () => {
    test('should return absolute path if directory exists', () => {
      // Mock implementation for existing directory
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = ensureOutputDirectory('/test/output');

      expect(result).toBe('/resolved//test/output');
      expect(fs.existsSync).toHaveBeenCalledWith('/resolved//test/output');
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    test('should create directory if it does not exist', () => {
      // Mock implementation for non-existent directory
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = ensureOutputDirectory('/test/output');

      expect(result).toBe('/resolved//test/output');
      expect(fs.existsSync).toHaveBeenCalledWith('/resolved//test/output');
      expect(fs.mkdirSync).toHaveBeenCalledWith('/resolved//test/output', { recursive: true });
    });

    test('should throw error if directory creation fails', () => {
      // Mock implementation for directory creation failure
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.mkdirSync as jest.Mock).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => ensureOutputDirectory('/test/output')).toThrow(CLIError);
      expect(() => ensureOutputDirectory('/test/output')).toThrow(
        'Failed to create output directory'
      );
    });
  });

  describe('writeResultsToFile', () => {
    test('should write JSON data to file', () => {
      // Mock implementation
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const data = { name: 'test', value: 123 };
      const result = writeResultsToFile('/test/output.json', data, 'json');

      expect(result).toBe('/test/output.json');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/test/output.json',
        JSON.stringify(data, null, 2)
      );
    });

    test('should write string data to file for non-JSON formats', () => {
      // Mock implementation
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const data = '# Markdown Content';
      const result = writeResultsToFile('/test/output.md', data, 'markdown');

      expect(result).toBe('/test/output.md');
      expect(fs.writeFileSync).toHaveBeenCalledWith('/test/output.md', data.toString());
    });

    test('should create directory if it does not exist', () => {
      // Mock implementation for non-existent directory
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.mkdirSync as jest.Mock).mockReturnValue(undefined); // Mock successful directory creation

      const data = { name: 'test', value: 123 };
      writeResultsToFile('/test/output.json', data, 'json');

      expect(fs.existsSync).toHaveBeenCalledWith('/dirname//test/output.json');
      expect(fs.mkdirSync).toHaveBeenCalledWith('/dirname//test/output.json', { recursive: true });
    });

    test('should throw error if file writing fails', () => {
      // Mock implementation for file writing failure
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Disk full');
      });

      expect(() => writeResultsToFile('/test/output.json', {}, 'json')).toThrow(CLIError);
      expect(() => writeResultsToFile('/test/output.json', {}, 'json')).toThrow(
        'Failed to write results to file'
      );
    });
  });
});
