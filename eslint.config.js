import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig(
  [
    {
      files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
      plugins: { js },
      extends: ['js/recommended'],
      languageOptions: { globals: { ...globals.browser, ...globals.node } },
      rules: {
        'no-console': 'warn',
      },
    },
    tseslint.configs.recommended,
    {
      ...pluginReact.configs.flat.recommended,
      files: ['packages/frontend/**/*.{js,mjs,cjs,ts,jsx,tsx}'],
      settings: {
        ...(pluginReact.configs.flat.recommended.settings || {}),
        react: {
          ...(pluginReact.configs.flat.recommended.settings?.react || {}),
          version: 'detect',
        },
      },
      rules: {
        'react/prop-types': 'off',
        'react/button-has-type': 'warn',
      },
    },
    {
      files: ['packages/frontend/**/*.{js,mjs,cjs,ts,jsx,tsx}'],
      plugins: {
        'react-hooks': pluginReactHooks,
      },
      rules: {
        ...pluginReactHooks.configs.recommended.rules,
        'react-hooks/refs': 'warn',
        'react-hooks/purity': 'warn',
        'react-hooks/set-state-in-effect': 'warn',
      },
    },
    {
      files: ['packages/e2e-tests/**/*spec.ts'],
      languageOptions: {
        parserOptions: {
          project: 'packages/e2e-tests/tsconfig.json',
          tsconfigRootDir: import.meta.dirname,
        },
      },
      rules: {
        // `expect()` usually needs to be awaited. Not awaiting causes flakiness.
        // https://playwright.dev/docs/best-practices#lint-your-tests
        '@typescript-eslint/no-floating-promises': 'warn',

        'no-console': 'off',
      },
    },
    {
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            args: 'all',
            argsIgnorePattern: '^_',
            caughtErrors: 'all',
            caughtErrorsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],

        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-empty-object-type': 'off', // allow {} as object type
        '@typescript-eslint/no-unused-expressions': [
          'error',
          { allowTernary: true, allowShortCircuit: true },
        ],
      },
    },
  ],
  globalIgnores([
    '**/node_modules',
    '**/dist',
    '**/.cache',
    '**/.github',
    '**/.test',
    '**/.tx',
    '**/.vscode',
    '**/bin',
    '**/build',
    '**/docs',
    '**/html-dist',
    '**/images',
    '**/README_ASSETS',
    '**/tsc-dist',
    '**/static',
    '**/test',
    '**/index.js',
    '**/.eslintrc.js',
    'packages/shared/ts-compiled-for-tests',
    'packages/target-electron/migration-tests/compiled',
    'packages/e2e-tests/playwright-report',
    'packages/e2e-tests/test-results',
  ])
)
