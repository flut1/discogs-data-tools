module.exports = {
  extends: ["plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["import"],
  rules: {
    "prettier/prettier": "error",
  },
  env: {
    node: true,
  },
  root: true,
};
