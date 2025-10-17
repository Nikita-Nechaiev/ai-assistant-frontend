module.exports = {
  root: true,
  extends: ['airbnb-typescript', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2020,
    sourceType: 'module',
  },

  // ignore generated stuff (fixes coverage/*.js parsing errors)
  ignorePatterns: [
    '.eslintrc.js',
    'node_modules/',
    '.next/',
    'dist/',
    'coverage/',
    'playwright-report/',
    'test-results/',
  ],

  overrides: [
    // test & setup files
    {
      files: ['e2e/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'jest.setup.ts', '**/jest.setup.ts'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],

  settings: {
    'import/resolver': {
      node: { paths: ['src'] },
      typescript: { project: './tsconfig.json' },
    },
  },

  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }],

    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    'react/require-default-props': 'off',
    'react/prop-types': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/no-unescaped-entities': 'off',
    'react/no-array-index-key': 'off',

    'no-underscore-dangle': 'off',
    'no-param-reassign': 'off',

    // allow unused args/vars prefixed with "_"
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
    ],

    '@typescript-eslint/return-await': 'off',
    'object-shorthand': ['warn', 'always'],

    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal'],
        pathGroups: [{ pattern: 'react', group: 'external', position: 'before' }],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
      },
    ],

    'import/extensions': ['error', 'ignorePackages', { ts: 'never', tsx: 'never', js: 'never', jsx: 'never' }],

    // keep, but setup file is excluded above
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.ts',
          '**/*.spec.ts',
          '**/playwright.config.ts',
          'jest.setup.ts',
          '**/jest.setup.ts',
        ],
      },
    ],

    'padding-line-between-statements': [
      'warn',
      { blankLine: 'always', prev: 'import', next: '*' },
      { blankLine: 'any', prev: 'import', next: 'import' },
      { blankLine: 'always', prev: ['*'], next: ['const', 'let', 'var', 'export'] },
      { blankLine: 'always', prev: ['const', 'let', 'var', 'export'], next: '*' },
      { blankLine: 'any', prev: ['const', 'let', 'var', 'export'], next: ['const', 'let', 'var', 'export'] },
      { blankLine: 'always', prev: '*', next: ['if', 'class', 'for', 'do', 'while', 'switch', 'try'] },
      { blankLine: 'always', prev: ['if', 'class', 'for', 'do', 'while', 'switch', 'try'], next: '*' },
      { blankLine: 'always', prev: '*', next: 'return' },
    ],

    '@typescript-eslint/naming-convention': [
      'warn',
      { selector: 'parameter', modifiers: ['unused'], format: null, leadingUnderscore: 'allow' },
      { selector: 'parameter', format: null, filter: { regex: '^_+$', match: true } },
      { selector: 'variable', format: null, filter: { regex: '^_+$', match: true } },

      {
        selector: 'variable',
        format: ['PascalCase', 'UPPER_CASE'],
        types: ['boolean'],
        prefix: ['is', 'are', 'was', 'were', 'has', 'have', 'had', 'do', 'does', 'did', 'can', 'should', 'will'],
      },
      { selector: 'variableLike', format: ['camelCase', 'snake_case', 'UPPER_CASE', 'PascalCase'] },
      { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
      { selector: 'typeLike', format: ['PascalCase'] },
      { selector: 'enumMember', format: ['PascalCase', 'UPPER_CASE'] },
    ],

    'import/prefer-default-export': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'consistent-return': 'off',
    indent: [0, 0],
    'no-return-await': 'off',
  },

  plugins: ['react', 'react-hooks', '@typescript-eslint', 'eslint-comments', 'import'],
};
