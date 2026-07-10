import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tailwindPlugin from 'eslint-plugin-tailwindcss';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  ...tailwindPlugin.configs['flat/recommended'],
  prettierConfig,
  {
    // eslint-plugin-react-hooks@4.x only ships the legacy eslintrc-style
    // `recommended` config (a plugins-array + rules object), not a flat
    // config export. Apply its rules directly under the flat "plugins" object
    // shape instead of spreading the legacy config.
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: reactHooksPlugin.configs.recommended.rules,
  },
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'tailwindcss/no-custom-classname': 'off',
    },
  },
  {
    ignores: ['dist/', 'target/', 'node_modules/', '*.config.*'],
  },
];
