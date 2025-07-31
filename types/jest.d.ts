/**
 * Jest configuration type definitions
 */
export interface JestConfig {
    preset?: string;
    testEnvironment?: 'node' | 'jsdom' | string;
    testMatch?: string[];
    transform?: Record<string, [string, any?] | string>;
    moduleFileExtensions?: string[];
    collectCoverage?: boolean;
    collectCoverageFrom?: string[];
    coverageDirectory?: string;
    coverageReporters?: string[];
    transformIgnorePatterns?: string[];
    setupFilesAfterEnv?: string[];
    moduleNameMapper?: Record<string, string>;
    testPathIgnorePatterns?: string[];
}
