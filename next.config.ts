import type { NextConfig } from "next";

// GitHub Pages serves the site under /<repo-name>/; the deploy workflow sets this.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  turbopack: {
    // pdf.js' modern build needs very recent JS APIs (Map.getOrInsert, Iterator helpers,
    // Uint8Array.fromBase64, ...) and crashes e.g. Safari 18. The legacy build ships polyfills.
    // react-pdf imports the modern entry points, so redirect them.
    resolveAlias: {
      "pdfjs-dist": "pdfjs-dist/legacy/build/pdf.mjs",
      "pdfjs-dist/web/pdf_viewer.mjs": "pdfjs-dist/legacy/web/pdf_viewer.mjs",
    },
  },
};

export default nextConfig;
