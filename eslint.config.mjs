import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "out/**", "node_modules/**", "scripts/**", "next-env.d.ts"],
  },
  {
    rules: {
      // R3F JSX intrinsic elements (<mesh/>, <group/>) are fine.
      "react/no-unknown-property": "off",
    },
  },
];

export default eslintConfig;
