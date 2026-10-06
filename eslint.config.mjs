import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // public/ 은 빌드 없이 그대로 배포되는 정적 파일(공용 스크립트 포함)이라 앱 린트 대상에서 제외
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "public/**"] },
];

export default eslintConfig;
