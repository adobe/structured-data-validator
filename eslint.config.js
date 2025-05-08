import globals from 'globals';
import pluginJs from '@eslint/js';
import headers from 'eslint-plugin-headers';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha,
      },
    },
    rules: {
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
      'headers/header-format': [
        'error',
        {
          source: 'file',
          path: './license-header.txt',
          variables: {
            year: '2025',
          },
        },
      ],
    },
    plugins: {
      headers,
    },
  },
  pluginJs.configs.recommended,
];
