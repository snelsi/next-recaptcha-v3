import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import nextTs from "eslint-config-next/typescript";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettierConfig from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig([
  {
    ignores: ["**/lib/**"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  {
    rules: {
      // Disable pages-specific rules for library projects
      "@next/next/no-html-link-for-pages": "off",
    },
  },
]);

export default eslintConfig;
