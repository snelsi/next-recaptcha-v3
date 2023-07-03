import externals from "rollup-plugin-node-externals";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import preserveDirectives from "rollup-plugin-preserve-directives";

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: "src/index.ts",
  output: {
    format: "esm",
    sourcemap: false,
    preserveModules: true,
    preserveModulesRoot: "src",
    dir: "lib",
  },
  plugins: [externals(), resolve(), preserveDirectives(), typescript()],
  onwarn(warning, warn) {
    if (warning.code === "MODULE_LEVEL_DIRECTIVE" && warning.message.includes(`use client`)) return;
    warn(warning);
  },
};

export default config;
