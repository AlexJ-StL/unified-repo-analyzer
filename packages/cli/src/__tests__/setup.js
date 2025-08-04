"use strict";
// Jest setup file for CLI tests
// This file is executed before each test file
Object.defineProperty(exports, "__esModule", { value: true });
// Mock console methods to reduce noise during tests
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
};
// Reset all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});
//# sourceMappingURL=setup.js.map