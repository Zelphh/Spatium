import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import { max } from "date-fns";

// console.debug('eslint.config.ts', jsxA11yPlugin);
// console.debug('eslint.config.ts', reactPlugin);
// console.debug('eslint.config.ts', reactHooksPlugin);
// console.debug('eslint.config.ts', prettierPlugin);
// console.debug('eslint.config.ts', prettierConfig);
// console.debug('eslint.config.ts', globals);
// console.debug('eslint.config.ts', js);

export default [
  js.configs.recommended,
  // Configuração base para todos os arquivos
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
          experimentalObjectRestSpread: true,
        },
      },
    },
  },

  // Configuração para arquivos TypeScript
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,mts,mtsx}"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.app.json",
      },
    },
  },
  // Configuração unificada para React, Hooks, A11y e Prettier
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "18.0",
      },
      "import/resolver": {
        node: {
          paths: ["src"],
        },
      },
    },
    rules: {
      // React rules
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/jsx-filename-extension": [
        1,
        { extensions: [".js", ".jsx", ".tsx"] },
      ],
      "react/jsx-props-no-spreading": 0,
      "react/require-default-props": [0, { extensions: [".ts", ".tsx"] }],
      "react/prop-types": "off",

      // Prettier rules
      ...prettierConfig.rules,

      // React Hooks rules
      ...reactHooksPlugin.configs.recommended.rules,

      "jsx-a11y/control-has-associated-label": 0,

      "prettier/prettier": ["warn"],
      "max-len": [
        "warn",
        {
          code: 80,
          ignoreUrls: true,
          // "ignoreStrings": true,
          // "ignoreTemplateLiterals": true,
          ignoreComments: true,
        },
      ],

      // Console e debugging
      "no-console": "off",

      // Promise rules
      "promise/param-names": 0,
      "no-return-await": 0,

      // Variable rules
      "no-use-before-define": 0,
      "no-unused-vars": 1,

      // Import rules
      "import/no-unresolved": [0, { extensions: [".ts", ".tsx"] }],
      "import/extensions": [0, { extensions: [".ts", ".tsx"] }],

      // TypeScript rules (desabilitadas para arquivos JS)
      "@typescript-eslint/require-array-sort-compare": [
        0,
        { extensions: [".js", ".jsx"] },
      ],
      "@typescript-eslint/no-var-requires": [
        0,
        { extensions: [".js", ".jsx"] },
      ],
      "@typescript-eslint/unbound-method": [0, { extensions: [".js", ".jsx"] }],
      "@typescript-eslint/no-misused-promises": [
        0,
        { extensions: [".js", ".jsx"] },
      ],
      "@typescript-eslint/no-this-alias": [0, { extensions: [".js", ".jsx"] }],
      "@typescript-eslint/explicit-function-return-type": [
        0,
        { extensions: [".js", ".jsx"] },
      ],
      "@typescript-eslint/no-floating-promises": [
        0,
        { extensions: [".js", ".jsx"] },
      ],
      "@typescript-eslint/strict-boolean-expressions": [
        0,
        { extensions: [".js", ".jsx"] },
      ],
      "@typescript-eslint/no-confusing-void-expression": [
        0,
        { extensions: [".js", ".jsx"] },
      ],
      "@typescript-eslint/no-unsafe-argument": [
        0,
        { extensions: [".js", ".jsx"] },
      ],
      "@typescript-eslint/prefer-optional-chain": [
        0,
        { extensions: [".js", ".jsx"] },
      ],
      "@typescript-eslint/promise-function-async": [
        0,
        { extensions: [".js", ".jsx"] },
      ],
      "@typescript-eslint/no-unused-vars": [0, { extensions: [".js", ".jsx"] }],
      "@typescript-eslint/restrict-template-expressions": [
        0,
        { extensions: [".js", ".jsx"] },
      ],
      "@typescript-eslint/no-dynamic-delete": [
        0,
        { extensions: [".js", ".jsx"] },
      ],
      "@typescript-eslint/prefer-nullish-coalescing": [
        0,
        { extensions: [".js", ".jsx"] },
      ],
      "@typescript-eslint/restrict-plus-operands": [
        0,
        { extensions: [".js", ".jsx"] },
      ],
      "@typescript-eslint/no-implied-eval": [
        0,
        { extensions: [".js", ".jsx"] },
      ],
    },
  },
  jsxA11yPlugin.flatConfigs.recommended,

  // Overrides específicos para arquivos TypeScript
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-undef": "off",
    },
  },

  // Override para release.config.mjs
  {
    files: ["release.config.mjs"],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
  },

  // Arquivos ignorados
  {
    ignores: [
      "dist/",
      "build/",
      "node_modules/",
      "src/serviceWorker.js",
      ".eslintrc.cjs",
    ],
  },
];
