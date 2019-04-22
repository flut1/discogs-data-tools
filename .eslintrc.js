module.exports = {
  extends: ["airbnb-base", "prettier"],
  parser: "babel-eslint",
  parserOptions: {
    sourceType: "module",
    babelOptions: {

    },
  },
  rules: {
    "linebreak-style": 0,
    "no-console": 0,
    "no-plusplus": 0,
    "no-restricted-syntax": 0,
    "import/prefer-default-export": 0,
    "no-await-in-loop": 0,
    "global-require": 0
  }
};
