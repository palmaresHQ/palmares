// https://eslint.org/docs/latest/rules/

/** @type {import('eslint').Linter.RulesRecord} */
export const prettier = {
  'prettier/prettier': ['error', {
    singleQuote: true,
    trailingComma: 'none',
    arrowParens: 'always',
    printWidth: 120,
    bracketSpacing: true,
    jsxBracketSameLine: true,
  }]
}
