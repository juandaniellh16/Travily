import js from "@eslint/js";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default js.config(
  {
    ignores: ["node_modules", "dist"],
  },
  {
    extends: [
      js.configs.recommended,
      "plugin:prettier/recommended",
      prettierConfig,
    ],
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
    plugins: ["prettier"],
    rules: {
      "prettier/prettier": [
        "warn",
        {
          singleQuote: true,
          semi: false,
          trailingComma: "none",
          jsxSingleQuote: true,
        },
      ],
    },
  },
);
