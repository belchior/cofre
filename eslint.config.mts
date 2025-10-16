import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
// import markdown from '@eslint/markdown'
// import css from '@eslint/css'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  // { files: ["**/*.md"], plugins: { markdown }, language: "markdown/gfm", extends: ["markdown/recommended"] },
  // { files: ['**/*.css'], plugins: { css }, language: 'css/css', extends: ['css/recommended'] },
  {
    files: ['**/*.{js,ts,tsx,mts}'],
    plugins: { js, pluginReact },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'comma-dangle': ['error', { 'arrays': 'always-multiline', 'objects': 'always-multiline', 'imports': 'always-multiline', 'exports': 'always-multiline', 'functions': 'never' }],
      'indent': ['error', 2, { 'SwitchCase': 1 }],
      'max-len': ['error', { 'code': 120, 'tabWidth': 2, 'ignoreComments': true, 'ignoreTrailingComments': true, 'ignoreUrls': true, 'ignoreStrings': true, 'ignoreTemplateLiterals': true }],
      'no-multiple-empty-lines': ['error', { 'max': 1 }],
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'caughtErrorsIgnorePattern': '^_' }],
      'object-curly-spacing': ['error', 'always'],
      'padded-blocks': ['error', 'never'],
      'quotes': ['error', 'single'],
      'semi': [2, 'never'],
      'space-before-function-paren': ['error', { 'anonymous': 'always', 'asyncArrow': 'always', 'named': 'never' }],
      'space-in-parens': ['error', 'never'],
    },
  },
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
])
