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
      // Relax react-hooks/set-state-in-effect to warning (common pattern in React)
      'react-hooks/set-state-in-effect': 'warn',
      // Allow any in API response types
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow unused vars prefixed with _
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
      // Relax react-refresh for context files
      'react-refresh/only-export-components': 'warn',
      // Allow empty blocks
      'no-empty': 'off',
    },
  },
])
