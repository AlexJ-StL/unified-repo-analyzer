module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.test.(ts|js)'],
  collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.d.ts'],
  transformIgnorePatterns: ['node_modules/(?!@unified-repo-analyzer)'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  moduleNameMapper: {
    '^ora$': '<rootDir>/src/__tests__/mocks/ora.js',
    '^chalk$': '<rootDir>/src/__tests__/mocks/chalk.js',
    '^conf$': '<rootDir>/src/__tests__/mocks/conf.js',
  },
  testPathIgnorePatterns: ['<rootDir>/dist/'],
};
