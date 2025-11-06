module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  roots: ['<rootDir>/components', '<rootDir>/ui', '<rootDir>/hooks', '<rootDir>/store', '<rootDir>/services'],

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
    'ui/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'store/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    '!**/index.ts',
    '!**/*.stories.*',
    '!**/types.ts',
  ],

  coveragePathIgnorePatterns: ['[\\\\/]e2e[\\\\/]', '[\\\\/]backend[\\\\/]'],
};
