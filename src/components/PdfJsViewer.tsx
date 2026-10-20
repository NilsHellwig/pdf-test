"use client";

import { useEffect, useRef, useState } from "react";
import { BASE_PATH } from "@/lib/basePath";
import "pdfjs-dist/legacy/web/pdf_viewer.css";

/** Uses the official pdf.js PDFViewer component (same engine as Firefox' built-in viewer). */
export default function PdfJsViewer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Lade…");

  useEffect(() => {
    let cancelled = false;
    let destroy: (() => void) | undefined;

    (async () => {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `${BASE_PATH}/pdf.worker.min.mjs`;
      // pdf_viewer.mjs reads the core library from this global.
      (globalThis as unknown as { pdfjsLib: typeof pdfjsLib }).pdfjsLib = pdfjsLib;
      const { EventBus, PDFLinkService, PDFViewer } = await import("pdfjs-dist/legacy/web/pdf_viewer.mjs");

      const container = containerRef.current;
      if (cancelled || !container) return;

      const eventBus = new EventBus();
      const linkService = new PDFLinkService({ eventBus });
      const viewer = new PDFViewer({
        container,
        viewer: container.firstElementChild as HTMLDivElement,
        eventBus,
        linkService,
      });
      linkService.setViewer(viewer);
      eventBus.on("pagesinit", () => {
        viewer.currentScaleValue = "page-width";
      });

      try {
        const task = pdfjsLib.getDocument({ url });
        destroy = () => void task.destroy();
        const doc = await task.promise;
        if (cancelled) return;
        viewer.setDocument(doc);
        linkService.setDocument(doc);
        setStatus(`${doc.numPages} Seiten geladen`);
      } catch (err) {
        if (!cancelled) setStatus(`Fehler: ${(err as Error).message}`);
      }
    })();

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [url]);

  return (
    <>
      <div className="pdfjs-container">
        <div ref={containerRef} className="pdfjs-scroll">
          <div className="pdfViewer" />
        </div>
      </div>
      <p className="status">{status}</p>
    </>
  );
}
