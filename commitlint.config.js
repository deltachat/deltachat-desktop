// Commitlint configuration for enforcing conventional commits
// https://commitlint.js.org/

export default {
  extends: ['@commitlint/config-conventional'],

  rules: {
    // Allow lowercase for types to match git-cliff configuration
    // Using severity 1 (warning) instead of 2 (error) to allow non-conventional commits
    'type-case': [1, 'always', 'lower-case'],

    // Enforce these specific types (warning only)
    'type-enum': [
      1,
      'always',
      [
        // User-facing changes (appear in changelog)
        'feat', // New features
        'fix', // Bug fixes
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'style', // Code style changes

        // Non-user-facing changes (not in changelog)
        'docs', // Documentation
        'test', // Tests
        'chore', // Maintenance
        'ci', // CI/CD
        'build', // Build system
      ],
    ],

    // Subject should not be empty (warning only)
    'subject-empty': [1, 'never'],

    // Subject should not end with period (warning only)
    'subject-full-stop': [1, 'never', '.'],

    // Disable subject case enforcement - allow any case
    'subject-case': [0],

    // Body should have blank line (warning only)
    'body-leading-blank': [1, 'always'],

    // Footer should have blank line (warning only)
    'footer-leading-blank': [1, 'always'],

    // Max line length (warning only)
    'header-max-length': [1, 'always', 100],
  },
}
