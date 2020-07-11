module.exports = {
  rules: {
    "sort-imports": ["error", { ignoreDeclarationSort: true }],
    "import/no-cycle": ["error"],
    "import/order": [
      "error",
      {
        groups: [["builtin", "external"], ["parent"], ["sibling", "index"]],
        "newlines-between": "always",
      },
    ],
    "import/no-useless-path-segments": ["error"],
    "import/no-unresolved": ["error"],
  },
};
