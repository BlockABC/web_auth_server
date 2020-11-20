module.exports = {
  extends: [
    'blockabc/typescript'
  ],
  parserOptions: {
    project: ['./tsconfig.json', './tsconfig.eslint.json']
  },
  rules: {
    'no-useless-constructor': 0,
    '@typescript-eslint/restrict-template-expressions': 0,
    '@typescript-eslint/no-useless-constructor': 0,
  }
}
