module.exports = {
  root: true,
  env: {
    node: true,
  },
  files: ['*.js', '*.ts', '*.tsx'],
  plugins: ['@typescript-eslint/eslint-plugin', 'import', 'file-progress'],
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  overrides: [
    {
      files: ['packages/**/*.ts', 'scripts/**/*.ts', 'examples/**/*.tsx', 'libs/**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: 'tsconfig.json',
        sourceType: 'module',
      },
      rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-floating-promises': 'off',
        'import/no-unresolved': 'error',
        'import/no-extraneous-dependencies': [
          'warn',
          { devDependencies: ['**/*.test.*', '**/*.spec.*', '**/*.*-spec.*'] },
        ],
        'file-progress/activate': 1,
        curly: ['error', 'multi-or-nest'],
        'sort-imports': [
          'error',
          {
            ignoreCase: true,
            ignoreDeclarationSort: true,
          },
        ],
        'import/order': [
          1,
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
        'prettier/prettier': [
          'error',
          {
            endOfLine: 'auto',
          },
        ],
      },
    },
  ],
};
