module.exports = {
  root: true,
  env: {
    node: true,
  },
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
      files: ['**/*.ts'],
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
        'prettier/prettier': [
          'error',
          {
            endOfLine: 'auto',
          },
        ],
      },
    },
    {
      files: ['**/*.spec.ts', 'integration/**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: 'tsconfig.spec.json',
        sourceType: 'module',
      },
      rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        'import/no-unresolved': 'error',
        'import/no-extraneous-dependencies': [
          'warn',
          { devDependencies: ['**/*.test.*', '**/*.spec.*', '**/*.*-spec.*'] },
        ],
        curly: ['error', 'multi-or-nest'],
        'file-progress/activate': 1,
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
            groups: [
              ['external', 'builtin'],
              ['object', 'internal', 'sibling', 'parent', 'index'],
              ['type'],
            ],
            pathGroupsExcludedImportTypes: ['internal'],
            alphabetize: {
              order: 'asc',
              caseInsensitive: true,
            },
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
