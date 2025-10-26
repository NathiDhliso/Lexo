import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'tests/**/*', '**/*.spec.ts', '**/*.test.ts', '**/*.test.tsx'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Disable problematic rule causing ESLint crash
      '@typescript-eslint/no-unused-expressions': 'off',
      // Relaxed rules - focus on critical issues only
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'off', // Too many false positives in complex types
      'no-case-declarations': 'warn',
      'no-prototype-builtins': 'warn',
      'prefer-const': 'off', // Let developers choose let vs const
      'react-hooks/exhaustive-deps': 'warn',
      // Additional quality rules
      'no-console': 'off', // Allow console for debugging
      'no-debugger': 'warn',
      'no-alert': 'off', // Allow alerts for user confirmations
    },
  }
);
