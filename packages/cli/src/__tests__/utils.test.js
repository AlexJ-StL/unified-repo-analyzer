"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const fs_1 = __importDefault(require("fs"));
const fs_utils_1 = require("../utils/fs-utils");
const error_handler_1 = require("../utils/error-handler");
// Mock fs module
bun_test_1.mock.module('fs', () => ({
    existsSync: (0, bun_test_1.mock)(() => true),
    statSync: (0, bun_test_1.mock)(() => ({ isDirectory: () => true })),
    accessSync: (0, bun_test_1.mock)(() => { }),
    mkdirSync: (0, bun_test_1.mock)(() => { }),
    writeFileSync: (0, bun_test_1.mock)(() => { }),
    constants: {
        R_OK: 4,
    },
}));
// Mock path module
bun_test_1.mock.module('path', () => ({
    resolve: (0, bun_test_1.mock)((p) => `/resolved/${p}`),
    dirname: (0, bun_test_1.mock)((p) => `/dirname/${p}`),
    join: (0, bun_test_1.mock)((dir, file) => `${dir}/${file}`),
    basename: (0, bun_test_1.mock)((p) => p.split('/').pop()),
}));
(0, bun_test_1.describe)('File System Utilities', () => {
    (0, bun_test_1.beforeEach)(() => {
        jest.clearAllMocks();
    });
    (0, bun_test_1.describe)('validateRepositoryPath', () => {
        (0, bun_test_1.test)('should return absolute path for valid directory', () => {
            // Mock implementation for valid directory
            fs_1.default.existsSync.mockReturnValue(true);
            fs_1.default.statSync.mockReturnValue({ isDirectory: () => true });
            fs_1.default.accessSync.mockImplementation(() => { });
            const result = (0, fs_utils_1.validateRepositoryPath)('/test/repo');
            (0, bun_test_1.expect)(result).toBe('/resolved//test/repo');
            (0, bun_test_1.expect)(fs_1.default.existsSync).toHaveBeenCalledWith('/resolved//test/repo');
            (0, bun_test_1.expect)(fs_1.default.statSync).toHaveBeenCalledWith('/resolved//test/repo');
            (0, bun_test_1.expect)(fs_1.default.accessSync).toHaveBeenCalledWith('/resolved//test/repo', fs_1.default.constants.R_OK);
        });
        (0, bun_test_1.test)('should throw error if path does not exist', () => {
            // Mock implementation for non-existent path
            fs_1.default.existsSync.mockReturnValue(false);
            (0, bun_test_1.expect)(() => (0, fs_utils_1.validateRepositoryPath)('/test/repo')).toThrow(error_handler_1.CLIError);
            (0, bun_test_1.expect)(() => (0, fs_utils_1.validateRepositoryPath)('/test/repo')).toThrow('Repository path does not exist');
        });
        (0, bun_test_1.test)('should throw error if path is not a directory', () => {
            // Mock implementation for file (not directory)
            fs_1.default.existsSync.mockReturnValue(true);
            fs_1.default.statSync.mockReturnValue({ isDirectory: () => false });
            (0, bun_test_1.expect)(() => (0, fs_utils_1.validateRepositoryPath)('/test/repo')).toThrow(error_handler_1.CLIError);
            (0, bun_test_1.expect)(() => (0, fs_utils_1.validateRepositoryPath)('/test/repo')).toThrow('Path is not a directory');
        });
        (0, bun_test_1.test)('should throw error if directory is not readable', () => {
            // Mock implementation for unreadable directory
            fs_1.default.existsSync.mockReturnValue(true);
            fs_1.default.statSync.mockReturnValue({ isDirectory: () => true });
            fs_1.default.accessSync.mockImplementation(() => {
                throw new Error('Permission denied');
            });
            (0, bun_test_1.expect)(() => (0, fs_utils_1.validateRepositoryPath)('/test/repo')).toThrow(error_handler_1.CLIError);
            (0, bun_test_1.expect)(() => (0, fs_utils_1.validateRepositoryPath)('/test/repo')).toThrow('Directory is not readable');
        });
    });
    (0, bun_test_1.describe)('ensureOutputDirectory', () => {
        (0, bun_test_1.test)('should return absolute path if directory exists', () => {
            // Mock implementation for existing directory
            fs_1.default.existsSync.mockReturnValue(true);
            const result = (0, fs_utils_1.ensureOutputDirectory)('/test/output');
            (0, bun_test_1.expect)(result).toBe('/resolved//test/output');
            (0, bun_test_1.expect)(fs_1.default.existsSync).toHaveBeenCalledWith('/resolved//test/output');
            (0, bun_test_1.expect)(fs_1.default.mkdirSync).not.toHaveBeenCalled();
        });
        (0, bun_test_1.test)('should create directory if it does not exist', () => {
            // Mock implementation for non-existent directory
            fs_1.default.existsSync.mockReturnValue(false);
            const result = (0, fs_utils_1.ensureOutputDirectory)('/test/output');
            (0, bun_test_1.expect)(result).toBe('/resolved//test/output');
            (0, bun_test_1.expect)(fs_1.default.existsSync).toHaveBeenCalledWith('/resolved//test/output');
            (0, bun_test_1.expect)(fs_1.default.mkdirSync).toHaveBeenCalledWith('/resolved//test/output', { recursive: true });
        });
        (0, bun_test_1.test)('should throw error if directory creation fails', () => {
            // Mock implementation for directory creation failure
            fs_1.default.existsSync.mockReturnValue(false);
            fs_1.default.mkdirSync.mockImplementation(() => {
                throw new Error('Permission denied');
            });
            (0, bun_test_1.expect)(() => (0, fs_utils_1.ensureOutputDirectory)('/test/output')).toThrow(error_handler_1.CLIError);
            (0, bun_test_1.expect)(() => (0, fs_utils_1.ensureOutputDirectory)('/test/output')).toThrow('Failed to create output directory');
        });
    });
    (0, bun_test_1.describe)('writeResultsToFile', () => {
        (0, bun_test_1.test)('should write JSON data to file', () => {
            // Mock implementation
            fs_1.default.existsSync.mockReturnValue(true);
            const data = { name: 'test', value: 123 };
            const result = (0, fs_utils_1.writeResultsToFile)('/test/output.json', data, 'json');
            (0, bun_test_1.expect)(result).toBe('/test/output.json');
            (0, bun_test_1.expect)(fs_1.default.writeFileSync).toHaveBeenCalledWith('/test/output.json', JSON.stringify(data, null, 2));
        });
        (0, bun_test_1.test)('should write string data to file for non-JSON formats', () => {
            // Mock implementation
            fs_1.default.existsSync.mockReturnValue(true);
            const data = '# Markdown Content';
            const result = (0, fs_utils_1.writeResultsToFile)('/test/output.md', data, 'markdown');
            (0, bun_test_1.expect)(result).toBe('/test/output.md');
            (0, bun_test_1.expect)(fs_1.default.writeFileSync).toHaveBeenCalledWith('/test/output.md', data.toString());
        });
        (0, bun_test_1.test)('should create directory if it does not exist', () => {
            // Mock implementation for non-existent directory
            fs_1.default.existsSync.mockReturnValue(false);
            fs_1.default.mkdirSync.mockReturnValue(undefined); // Mock successful directory creation
            const data = { name: 'test', value: 123 };
            (0, fs_utils_1.writeResultsToFile)('/test/output.json', data, 'json');
            (0, bun_test_1.expect)(fs_1.default.existsSync).toHaveBeenCalledWith('/dirname//test/output.json');
            (0, bun_test_1.expect)(fs_1.default.mkdirSync).toHaveBeenCalledWith('/dirname//test/output.json', { recursive: true });
        });
        (0, bun_test_1.test)('should throw error if file writing fails', () => {
            // Mock implementation for file writing failure
            fs_1.default.existsSync.mockReturnValue(true);
            fs_1.default.writeFileSync.mockImplementation(() => {
                throw new Error('Disk full');
            });
            (0, bun_test_1.expect)(() => (0, fs_utils_1.writeResultsToFile)('/test/output.json', {}, 'json')).toThrow(error_handler_1.CLIError);
            (0, bun_test_1.expect)(() => (0, fs_utils_1.writeResultsToFile)('/test/output.json', {}, 'json')).toThrow('Failed to write results to file');
        });
    });
});
//# sourceMappingURL=utils.test.js.map