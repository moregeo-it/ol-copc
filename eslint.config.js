import openlayers from 'eslint-config-openlayers';

/**
 * @type {Array<import("eslint").Linter.Config>}
 */
export default [
  ...openlayers,
  {
    // global ignores (don't include other keys in this object)
    // https://eslint.org/docs/latest/use/configure/configuration-files#globally-ignoring-files-with-ignores
    ignores: [
      'config/jsdoc/api/template/static/scripts/',
      'examples/resources/*',
      'site/build/*',
    ],
  },
  {
    name: 'common-config',
    rules: {
      'jsdoc/reject-any-type': ['off'], //TODO: make codebase work with 'error' instead of 'off'
      'jsdoc/reject-function-type': ['off'], //TODO: make codebase work with 'error' instead of 'off'
      'no-unused-vars': [
        'error',
        {'vars': 'all', 'args': 'none', 'caughtErrorsIgnorePattern': '^_$'},
      ],
    },
  },
  {
    name: 'examples-config',
    files: ['examples/*'],
    rules: {
      'no-unused-vars': ['error', {'varsIgnorePattern': '^map'}],
    },
  },
  {
    name: 'test-config',
    files: ['test/**/*'],
    languageOptions: {
      globals: {
        afterAll: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        it: 'readonly',
        vi: 'readonly',
      },
    },
  },
];
