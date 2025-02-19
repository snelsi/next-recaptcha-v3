import { FlatCompat } from "@eslint/eslintrc";

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = tseslint.config(
  {
    ignores: ["**/lib/**"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  prettierConfig,
);

export default eslintConfig;
