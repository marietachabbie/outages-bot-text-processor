import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    files: [ "**/*.{js,mjs,cjs,ts}" ],
    languageOptions: {
      globals: {
        ...globals.browser,
        "__dirname": true,
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unused-expressions': 'off',
      'array-bracket-spacing': [ 'error', 'always', { objectsInArrays: false }],
      'arrow-spacing': 'error',
      'block-spacing': [ 'error', 'always' ],
      'brace-style': [ 'error', '1tbs', { allowSingleLine: true }],
      'comma-dangle': [ 'error', "always-multiline" ],
      'comma-spacing': [ 'error', { after: true }],
      'default-case': 'error',
      'dot-location': [ 'error', 'property' ],
      'eol-last': 'error',
      'handle-callback-err': 'error',
      'indent': [ 'error', 2, { SwitchCase: 1 }],
      'key-spacing': [ 'error', { afterColon: true, mode: 'strict' }],
      'keyword-spacing': 'error',
      'lines-between-class-members': 'error',
      'max-len': [ 'error', { code: 106, ignoreStrings: true, ignorePattern: '`.*`',
        ignoreUrls: true }],
      'no-invalid-this': [ 'error' ],
      'no-label-var': 'error',
      'no-multi-spaces': 'error',
      'no-multiple-empty-lines': [ 'error', { max: 1, maxEOF: 0 }],
      'no-shadow-restricted-names': 'error',
      'no-trailing-spaces': 'error',
      'no-undef': 'error',
      'no-unused-labels': 'error',
      'object-curly-spacing': [ 'error', 'always', { arraysInObjects: false }],
      'semi': 'error',
    },
  },
];
