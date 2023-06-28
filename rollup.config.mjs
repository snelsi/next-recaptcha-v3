import externals from "rollup-plugin-node-externals";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import preserveDirectives from "rollup-plugin-preserve-directives";

const outputOptions = {
  sourcemap: false,
  preserveModules: true,
  preserveModulesRoot: "src",
  dir: "lib",
};

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: "src/index.ts",
  output: [
    {
      format: "cjs",
      entryFileNames: "[name].cjs",
      exports: "auto",
      ...outputOptions,
    },
    {
      format: "esm",
      ...outputOptions,
    },
  ],
  plugins: [externals(), resolve(), commonjs(), preserveDirectives(), typescript()],
};

export default config;
