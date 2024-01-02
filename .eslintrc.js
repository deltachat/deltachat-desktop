module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [
      './src/main/tsconfig.json',
      './src/renderer/tsconfig.json',
      './src/shared/tsconfig.json',
    ],
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  rules: {
    'no-case-declarations': 'warn',
    'no-constant-binary-expression': 'error',
    'no-useless-escape': 'warn',
    'no-var': 'warn',
    'prefer-const': 'warn',
    // Make sure that all imports are sorted
    'sort-imports': ['warn', {
      'ignoreCase': true,
      'ignoreDeclarationSort': true,
      'ignoreMemberSort': false,
      'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single'],
      'allowSeparatedGroups': true,
    }],
    // @TODO
    // '@typescript-eslint/ban-types': 'off', // reenable later?
    // Make sure we're exporting and importing TS types as such
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    // @TODO
    '@typescript-eslint/default-param-last': 'error',
    // @TODO
    '@typescript-eslint/no-invalid-void-type': 'warn',
    // @TODO
    '@typescript-eslint/no-redeclare': 'error',
    // Do not allow unused vars, except if they're prefixed with an underscore
    '@typescript-eslint/no-unused-vars': [
      'error',
      { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
    ],
    // Sometimes we need to disable type checking
    '@typescript-eslint/ban-ts-comment': 'off',
    // @TODO
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // @TODO
    '@typescript-eslint/no-empty-function': 'off',
    // @TODO
    '@typescript-eslint/no-explicit-any': 'off',
    // @TODO
    '@typescript-eslint/no-namespace': 'off',
    // Enable `prettier` linter warnings
    'prettier/prettier': 'warn',
    // Group imports as follows: builtin, external, internal, type
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          ['internal', 'sibling', 'parent', 'index', 'object'],
          'type',
        ],
        'newlines-between': 'always',
        distinctGroup: false,
      },
    ],
    // Sometimes we want to indicate where an import came from by using the default member
    'import/no-named-as-default-member': 'off',
    // Linter gives false positives, as we're overriding namespaces and use CommonJS dependencies
    'import/default': 'off',
    // Always expect a single newline after all imports
    'import/newline-after-import': [
      'error',
      { count: 1, exactCount: true, considerComments: true },
    ],
  },
};
