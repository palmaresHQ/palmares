// https://github.com/un-ts/eslint-plugin-import-x

/** @type {import('eslint').Linter.RulesRecord} */
export const imports = {
  /** Reports any imports that come after non-import statements */
  'import/first': 'error',
  /** Stylistic preference */
  'import/newline-after-import': 'error',
  /** No require() or module.exports */
  'import/no-commonjs': 'error',
  /** No import loops */
  'import/no-cycle': 'error',
  /** Reports if a resolved path is imported more than once */
  'import/no-duplicates': 'error',
  /** Stylistic preference */
  'import/order': [
    'error',
    {
      'newlines-between': 'always',
      groups: [['external', 'builtin'], ['internal'], ['object', 'sibling', 'parent', 'index'], ['type']],
      pathGroupsExcludedImportTypes: ['internal'],
      alphabetize: {
        order: 'asc',
        caseInsensitive: true,
      },
      pathGroups: [
        {
          pattern: '@packages/*',
          group: 'parent',
        },
        {
          pattern: '@packages/**',
          group: 'parent',
        },
      ],
    },
  ],
}
