// Copies the pdf.js worker into public/ and generates a multi-page sample PDF.
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const require = createRequire(import.meta.url);
mkdirSync("public", { recursive: true });

copyFileSync(
  require.resolve("pdfjs-dist/build/pdf.worker.min.mjs"),
  "public/pdf.worker.min.mjs",
);

const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);
const colors = [rgb(0.85, 0.2, 0.2), rgb(0.2, 0.6, 0.3), rgb(0.2, 0.4, 0.85)];

for (let i = 1; i <= 3; i++) {
  const page = doc.addPage([595, 842]); // A4
  page.drawRectangle({ x: 0, y: 742, width: 595, height: 100, color: colors[i - 1] });
  page.drawText(`Seite ${i} von 3`, { x: 40, y: 780, size: 32, font: bold, color: rgb(1, 1, 1) });
  page.drawText("PDF-Viewer Test – wenn du diese Seite siehst, funktioniert Seite " + i + ".", {
    x: 40, y: 700, size: 13, font,
  });
  for (let line = 0; line < 30; line++) {
    page.drawText(`Zeile ${line + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`, {
      x: 40, y: 660 - line * 20, size: 11, font, color: rgb(0.3, 0.3, 0.3),
    });
  }
}

writeFileSync("public/sample.pdf", await doc.save());
console.log("public/pdf.worker.min.mjs + public/sample.pdf written");
