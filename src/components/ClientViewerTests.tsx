"use client";

import dynamic from "next/dynamic";

// Rendered client-only: reads window.location / navigator on first render.
export const ClientViewerTests = dynamic(
  () => import("./ViewerTests").then((m) => m.ViewerTests),
  { ssr: false },
);
