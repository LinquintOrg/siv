// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [ 'dist/*', 'legacy/*', '.expo/*' ],
  },
  {
    rules: {
      indent: [ 'error', 2, { SwitchCase: 1 } ],
      quotes: [ 'error', 'single', { avoidEscape: true } ],
      semi: [ 'error', 'always' ],
      'no-trailing-spaces': 'warn',
      'comma-dangle': [ 'error', 'always-multiline' ],
      'max-len': [ 'error', { code: 160, ignoreComments: true } ],
      'no-console': 'warn',
      'array-bracket-spacing': [ 'error', 'always' ],
      'eol-last': [ 'error', 'always' ],
      'no-multi-spaces': 'error',
      'object-curly-spacing': [ 'error', 'always' ],
      'react/display-name': 'off',
    },
  },
]);
