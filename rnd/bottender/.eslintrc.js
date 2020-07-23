module.exports = {
  parser: 'babel-eslint',

  parserOptions: {
    ecmaVersion: 2018,
  },
  extends: ['eslint:recommended', 'prettier'],
  env: {
    node: true,
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'es5',
        singleQuote: true,
        semi: false,
      },
    ],
    semi: [2, 'never'],
  },
  plugins: ['prettier', 'babel'],
  overrides: [
    {
      files: ['**/*.test.js'],
      env: {
        jest: true,
      },
    },
  ],
}
