module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    '@typescript-eslint/ban-types': 'off', // reenable later?
    // ---------
    '@typescript-eslint/no-redeclare': 'error',
    '@typescript-eslint/default-param-last': 'error',
    '@typescript-eslint/no-invalid-void-type': 'warn',
    'no-var': 'warn',
    'prefer-const': 'warn',
    'no-useless-escape': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-case-declarations': 'warn',
  },
}
