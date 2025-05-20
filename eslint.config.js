import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig(
  [
    {
      files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
      plugins: { js },
      extends: ['js/recommended'],
    },
    {
      files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
      languageOptions: { globals: { ...globals.browser, ...globals.node } },
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
      },
    },
    {
      files: ['packages/frontend/**/*.{js,mjs,cjs,ts,jsx,tsx}'],
      plugins: {
        'react-hooks': pluginReactHooks,
      },
      rules: {
        ...pluginReactHooks.configs.recommended.rules,
      },
    },
    eslintPluginPrettierRecommended,
    {
      rules: {
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-redeclare': 'error',
        '@typescript-eslint/default-param-last': 'error',
        '@typescript-eslint/no-invalid-void-type': 'warn',
        'no-var': 'warn',
        'prefer-const': 'warn',
        'no-useless-escape': 'warn',

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
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-empty-object-type': 'off', // allow {} as object type
        '@typescript-eslint/no-unused-expressions': [
          'error',
          { allowTernary: true, allowShortCircuit: true },
        ],

        'no-case-declarations': 'warn',
        'no-constant-binary-expression': 'error',
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
  ])
)
