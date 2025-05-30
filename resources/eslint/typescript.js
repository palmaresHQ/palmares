// https://typescript-eslint.io/rules/

/** @type {import('eslint').Linter.RulesRecord} */
export const typescript = {
  /** Prefer Array<T> format */
  'ts/array-type': ['error', { default: 'array', readonly: 'array' }],
  /** Prevent @ts-ignore, allow @ts-expect-error */
  'ts/ban-ts-comment': [
    'error',
    {
      'ts-expect-error': false,
      'ts-ignore': 'allow-with-description'
    }
  ],
  /** Enforce import type { T } */
  'ts/consistent-type-imports': ['error', { prefer: 'type-imports' }],
  /** Shorthand method style is less strict */
  'ts/method-signature-style': ['error', 'property'],
  /** Enforces generic type convention */
  'ts/naming-convention': [
    'error',
    {
      selector: 'typeParameter',
      format: ['PascalCase'],
      leadingUnderscore: 'allow',
      trailingUnderscore: 'forbid',
      custom: {
        regex: '^(T|T[A-Z][A-Za-z0-9]+)$',
        match: true
      }
    }
  ],
  /**  */
  'ts/no-explicit-any': 'off',
  /** Duplicate values can lead to bugs that are hard to track down */
  'ts/no-duplicate-enum-values': 'error',
  /** Using the operator any more than once does nothing */
  'ts/no-extra-non-null-assertion': 'error',
  /** There are several potential bugs with this compared to other loops */
  'ts/no-for-in-array': 'error',
  /** Enforce valid definition of new and constructor */
  'ts/no-misused-new': 'error',
  /** Disallow TypeScript namespaces */
  'ts/no-namespace': 'error',
  /** Disallow non-null assertions after an optional chain expression */
  'ts/no-non-null-asserted-optional-chain': 'error',
  /** Detects conditionals which will always evaluate truthy or falsy */
  'ts/no-unnecessary-condition': 'error',
  /** Checks if the the explicit type is identical to the inferred type */
  'ts/no-unnecessary-type-assertion': 'error',
  /** Don't over-define types for simple things like strings */
  'ts/no-inferrable-types': ['error', { ignoreParameters: true }],
  /** Enforce the use of as const over literal type */
  'ts/prefer-as-const': 'error',
  /** Prefer for-of loop over the standard for loop */
  'ts/prefer-for-of': 'warn',
  /** Warn about async functions which have no await expression */
  'ts/require-await': 'warn',
  /** Prefer of ES6-style import declarations */
  'ts/triple-slash-reference': 'error'
};
