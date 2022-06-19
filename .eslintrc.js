module.exports = {
    root: true,
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'prettier',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: 'tsconfig.json',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint/eslint-plugin', 'import', 'file-progress'],
    env: {
        node: true,
        jest: true,
    },
    rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        'import/no-unresolved': 'error',
        'import/no-extraneous-dependencies': [
            'warn',
            { 
                devDependencies: [
                    '**/*.test.*', 
                    '**/*.spec.*', 
                    '**/*.*-spec.*'
                ] 
            },
        ],
        'file-progress/activate': 1,
        'prettier/prettier': [
            'error',
            {
            endOfLine: 'auto',
            },
        ],
    },
    ignorePatterns: ['**/@types/*', '.eslintrc.js', 'webpack.*.config.ts'],
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
                project: [`${__dirname}/tsconfig.json`],
                node: [`${__dirname}/tsconfig.json`],
            },
        },
    },
};
