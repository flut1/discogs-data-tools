module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  parser: '@typescript-eslint/parser',
  plugins: ["import", "@typescript-eslint"],
  rules: {
    /* imports */
    'sort-imports': ['error', {ignoreDeclarationSort: true}],
    'import/no-cycle': ['error'],
    'import/order': [
      'error',
      {
        groups: [
          ['builtin', 'external'],
          ['parent'],
          ['sibling', 'index'],
        ],
        'newlines-between': 'always',
      },
    ],
    'import/no-useless-path-segments': ['error'],
    'import/no-unresolved': ['error'],
    /* typescript */
    "@typescript-eslint/explicit-module-boundary-types": "off",
  },
  extends: [
    'eslint:recommended',
    "plugin:import/typescript",
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint'
  ],
  env: {
    node: true,
  },
  root: true,
};
