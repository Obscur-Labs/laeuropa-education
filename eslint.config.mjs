import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Pages are deliberately linked with plain <a> (full page loads): the scroll/lightbox effects in
      // SiteEffects bind once per page load, and every navigation gets a fresh CSP nonce.
      "@next/next/no-html-link-for-pages": "off",
      // Images come from Supabase Storage / static files and are already resized to WebP on upload.
      "@next/next/no-img-element": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
