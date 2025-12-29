import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            "@typescript-eslint/no-unused-vars": ["warn", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_"
            }],
            "@typescript-eslint/no-explicit-any": "warn",
            "prefer-const": "warn",
            "no-console": ["warn", { allow: ["warn", "error"] }],
        },
    },
    {
        ignores: [
            "node_modules/**",
            ".next/**",
            "out/**",
            "scripts/**",
            "*.config.js",
            "*.config.mjs",
            "*.config.ts",
        ],
    },
];
