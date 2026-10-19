module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  roots: ['<rootDir>'],

  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },

  testPathIgnorePatterns: [
    '[\\\\/]e2e[\\\\/]',
    '[\\\\/]backend[\\\\/]',
    '[\\\\.]next[\\\\/]',
    '[\\\\/]node_modules[\\\\/]',
  ],

  watchPathIgnorePatterns: ['[\\\\/]e2e[\\\\/]', '[\\\\/]playwright-report[\\\\/]', '[\\\\/]test-results[\\\\/]'],

  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'store/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    'helpers/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'providers/**/*.{ts,tsx}',
    'hydration/**/*.{ts,tsx}',
    'middleware.ts',
    '!**/*.d.ts',
    '!**/*.{test,spec}.{ts,tsx}',
    '!**/index.ts',
    '!**/*.stories.*',
    '!**/types.ts',
  ],

  coverageThreshold: { global: { statements: 81, branches: 81, functions: 81, lines: 81 } },

  coverageReporters: ['text', 'json', 'json-summary', 'html', 'lcov'],

  coveragePathIgnorePatterns: ['[\\\\/]e2e[\\\\/]', '[\\\\/]backend[\\\\/]'],
};
