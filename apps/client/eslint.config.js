// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angularTemplateParser = require("@angular-eslint/template-parser");
const angularTemplatePlugin = require("@angular-eslint/eslint-plugin-template");

module.exports = tseslint.config(
  // ===== TypeScript =====
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  {
    files: ["src/app/components/containers/container-debug/**/*.ts"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "no-case-declarations": "off",
      "no-prototype-builtins": "off",
      "no-ex-assign": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "prefer-const": "off",
    },
  },

  {
    files: ["src/app/guards/**/*.ts", "src/app/stores/opponents.store.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  // ===== Angular HTML templates =====
  {
    files: ["**/*.html"],
    languageOptions: {
      parser: angularTemplateParser, // ✅ objet, pas string
    },
    plugins: {
      "@angular-eslint/template": angularTemplatePlugin, // ✅ objet, pas tableau
    },
    rules: {
      // règles explicites (pas de spread)
      "@angular-eslint/template/banana-in-box": "error",
      "@angular-eslint/template/eqeqeq": "error",
      "@angular-eslint/template/no-negated-async": "error",
    },
  },
);
