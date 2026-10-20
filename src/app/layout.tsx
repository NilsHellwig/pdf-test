import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF-Viewer Test",
  description: "Vergleich verschiedener PDF-Einbettungen auf Mobile und Desktop",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
