import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Allow setState in effects - this is a common and acceptable pattern in React
      // especially for initialization and cleanup logic
      'react-hooks/set-state-in-effect': 'off',
      // Allow any in API response types and error handling
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow unused vars prefixed with _
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
      // Relax react-refresh for context files - they export hooks that are used elsewhere
      'react-refresh/only-export-components': 'off',
      // Allow empty blocks for catch statements
      'no-empty': 'off',
      // Allow missing dependency arrays for intentional patterns (common in data fetching)
      'react-hooks/exhaustive-deps': 'off',
    },
  },
])
