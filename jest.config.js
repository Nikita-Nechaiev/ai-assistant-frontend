module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
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
};
