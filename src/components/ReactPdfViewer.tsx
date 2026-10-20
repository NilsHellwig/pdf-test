"use client";

// Must run before pdf.js streams text content (Safari).
import "@/lib/readable-stream-async-iterator.mjs";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { BASE_PATH } from "@/lib/basePath";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `${BASE_PATH}/pdf.worker.mjs`;

export default function ReactPdfViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState(0);
  const [width, setWidth] = useState<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width) - 16);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="frame scroll">
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={<p className="fallback">Lade PDF…</p>}
        error={<p className="fallback">Fehler beim Laden (CORS?).</p>}
      >
        {width &&
          Array.from({ length: numPages }, (_, i) => (
            <Page key={i} pageNumber={i + 1} width={width} className="rpdf-page" />
          ))}
      </Document>
    </div>
  );
}
