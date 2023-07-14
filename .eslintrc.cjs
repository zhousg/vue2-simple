module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: 'standard',
  overrides: [
    {
      env: {
        node: true
      },
      files: [
        '.eslintrc.{js,cjs}'
      ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': 'warn',
    'space-before-function-paren': ['error', 'never'],
    'no-new': 'off',
    'no-prototype-builtins': 'off',
    'no-useless-escape': 'off',
    'no-new-func': 'off'
  }
}
