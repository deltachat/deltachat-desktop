module.exports = {
  parserOptions: { project: './packages/e2e-tests/tsconfig.json' },
  rules: {
    // `expect()` usually needs to be awaited. Not awaiting causes flakiness.
    // https://playwright.dev/docs/best-practices#lint-your-tests
    '@typescript-eslint/no-floating-promises': 'warn',
  },
}
