import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist", "server/data"] },
  {
    files: ["server/**/*.{js,mjs}"],
    languageOptions: {
      ecmaVersion: 2024,
      globals: globals.node,
      sourceType: "module",
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
  {
    files: ["**/*.{js,jsx}"],
    ignores: ["server/**"],
    languageOptions: {
      ecmaVersion: 2024,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: {
      react: { version: "detect" },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },
];
