module.exports = {
  root: true,
  extends: ['airbnb-typescript', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2020,
    sourceType: 'module',
  },

  overrides: [
    {
      files: ['**/*.tsx'],
      rules: {},
    },
  ],

  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
      },
      typescript: {
        project: './tsconfig.json',
      },
    },
  },

  ignorePatterns: ['.eslintrc.js'],

  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],

    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/require-default-props': 'off',
    'react/prop-types': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/no-unescaped-entities': 'off',
    'react/no-array-index-key': 'off',

    'no-underscore-dangle': 'off',
    'no-param-reassign': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/return-await': 'off',
    'object-shorthand': ['warn', 'always'],

    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
      },
    ],

    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        tsx: 'never',
        js: 'never',
        jsx: 'never',
      },
    ],

    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],

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
      {
        selector: 'variable',
        format: ['PascalCase', 'UPPER_CASE'],
        types: ['boolean'],
        prefix: ['is', 'are', 'was', 'were', 'has', 'have', 'had', 'do', 'does', 'did', 'can', 'should', 'will'],
      },
      {
        selector: 'variableLike',
        format: ['camelCase', 'snake_case', 'UPPER_CASE', 'PascalCase'],
      },
      {
        selector: 'parameter',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
      {
        selector: 'enumMember',
        format: ['PascalCase', 'UPPER_CASE'],
      },
    ],

    /* miscellaneous tweaks */
    'import/prefer-default-export': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'consistent-return': 'off',
    indent: [0, 0],
    'no-return-await': 'off',
  },

  plugins: ['react', 'react-hooks', '@typescript-eslint', 'eslint-comments', 'import'],
};
