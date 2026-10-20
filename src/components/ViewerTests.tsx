"use client";

import dynamic from "next/dynamic";
import { useState, type ReactNode } from "react";
import { BASE_PATH } from "@/lib/basePath";

// pdf.js needs browser APIs (DOMMatrix, canvas, workers), so skip SSR.
const ReactPdfViewer = dynamic(() => import("./ReactPdfViewer"), { ssr: false });
const PdfJsViewer = dynamic(() => import("./PdfJsViewer"), { ssr: false });

const DEFAULT_PDF = `${BASE_PATH}/sample.pdf`;

type Variant = {
  id: string;
  title: string;
  desc: ReactNode;
  render: (url: string, absoluteUrl: string) => ReactNode;
};

const variants: Variant[] = [
  {
    id: "object",
    title: "1. <object> (aktuelle Lösung)",
    desc: (
      <>
        <code>&lt;object type=&quot;application/pdf&quot;&gt;</code> ohne Fallback – nutzt den
        nativen PDF-Viewer des Browsers.
      </>
    ),
    render: (url) => (
      <div className="frame">
        <object type="application/pdf" data={url} />
      </div>
    ),
  },
  {
    id: "object-fallback",
    title: "2. <object> mit Fallback-Link",
    desc: "Wie 1., zeigt aber einen Link an, wenn der Browser kein PDF inline darstellen kann.",
    render: (url) => (
      <div className="frame">
        <object type="application/pdf" data={url}>
          <div className="fallback">
            Dein Browser kann das PDF nicht direkt anzeigen.{" "}
            <a href={url} target="_blank" rel="noreferrer">
              PDF öffnen
            </a>
          </div>
        </object>
      </div>
    ),
  },
  {
    id: "iframe",
    title: "3. <iframe>",
    desc: "Nativer Browser-Viewer im iframe.",
    render: (url) => (
      <div className="frame">
        <iframe src={url} title="PDF iframe" />
      </div>
    ),
  },
  {
    id: "embed",
    title: "4. <embed>",
    desc: "Nativer Browser-Viewer über das embed-Element.",
    render: (url) => (
      <div className="frame">
        <embed type="application/pdf" src={url} />
      </div>
    ),
  },
  {
    id: "react-pdf",
    title: "5. react-pdf (pdf.js, Canvas)",
    desc: (
      <>
        npm <code>react-pdf</code> – rendert jede Seite selbst per pdf.js als Canvas. Unabhängig
        vom Browser-Viewer. PDF muss same-origin oder per CORS erreichbar sein.
      </>
    ),
    render: (url) => <ReactPdfViewer key={url} url={url} />,
  },
  {
    id: "pdfjs-viewer",
    title: "6. pdf.js PDFViewer (pdfjs-dist)",
    desc: (
      <>
        npm <code>pdfjs-dist</code> mit der offiziellen Viewer-Komponente (wie in Firefox),
        inkl. Textauswahl und Lazy-Rendering der Seiten.
      </>
    ),
    render: (url) => <PdfJsViewer key={url} url={url} />,
  },
  {
    id: "google",
    title: "7. Google Docs Viewer (iframe)",
    desc: "Externer Dienst – funktioniert nur mit öffentlich erreichbarer URL (nicht auf localhost). Datenschutz beachten!",
    render: (_url, absoluteUrl) => (
      <div className="frame">
        <iframe
          src={`https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(absoluteUrl)}`}
          title="Google Docs Viewer"
        />
      </div>
    ),
  },
  {
    id: "link",
    title: "8. Nur Link (Referenz)",
    desc: "Öffnet das PDF in einem neuen Tab – funktioniert überall, ist aber nicht eingebettet.",
    render: (url) => (
      <a href={url} target="_blank" rel="noreferrer">
        PDF in neuem Tab öffnen
      </a>
    ),
  },
];

type Result = "ok" | "fail";

export function ViewerTests() {
  // Allow sharing links with a custom PDF: /?pdf=https://...
  const [initialUrl] = useState(
    () => new URLSearchParams(window.location.search).get("pdf") || DEFAULT_PDF,
  );
  const [input, setInput] = useState(initialUrl);
  const [url, setUrl] = useState(initialUrl);
  const [results, setResults] = useState<Record<string, Result>>({});
  const origin = window.location.origin;
  const userAgent = navigator.userAgent;

  const absoluteUrl = new URL(url, origin).href;

  const applyUrl = () => {
    const next = input.trim() || DEFAULT_PDF;
    setUrl(next);
    setResults({});
    const params = new URLSearchParams(window.location.search);
    if (next === DEFAULT_PDF) params.delete("pdf");
    else params.set("pdf", next);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  };

  const setResult = (id: string, value: Result) =>
    setResults((prev) => {
      const next = { ...prev };
      if (next[id] === value) delete next[id];
      else next[id] = value;
      return next;
    });

  const summary = [
    `Gerät: ${userAgent}`,
    ...variants
      .filter((v) => results[v.id])
      .map((v) => `${results[v.id] === "ok" ? "✅" : "❌"} ${v.title}`),
  ].join("\n");

  return (
    <main>
      <h1>PDF-Viewer Test</h1>
      <p className="intro">
        Verschiedene Arten, ein PDF einzubetten. Bitte jede Variante durchscrollen (alle 3 Seiten
        sichtbar?) und mit 👍/👎 bewerten. Unten kann das Ergebnis kopiert werden.
      </p>

      <div className="toolbar">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyUrl()}
          placeholder="PDF-URL"
          aria-label="PDF-URL"
        />
        <button onClick={applyUrl}>Laden</button>
      </div>
      <div className="env">{userAgent}</div>

      <ul className="toc">
        {variants.map((v) => (
          <li key={v.id}>
            <a href={`#${v.id}`}>{v.title}</a>
          </li>
        ))}
      </ul>

      {variants.map((v) => (
        <section key={v.id} id={v.id} className="card">
          <h2>{v.title}</h2>
          <p className="desc">{v.desc}</p>
          {v.render(url, absoluteUrl)}
          <div className="feedback">
            <button
              className="ok"
              aria-pressed={results[v.id] === "ok"}
              onClick={() => setResult(v.id, "ok")}
            >
              👍 Funktioniert
            </button>
            <button
              className="fail"
              aria-pressed={results[v.id] === "fail"}
              onClick={() => setResult(v.id, "fail")}
            >
              👎 Geht nicht
            </button>
          </div>
        </section>
      ))}

      <div className="summary">
        <strong>Ergebnis</strong>
        <pre>{summary}</pre>
        <button onClick={() => navigator.clipboard?.writeText(summary)}>Kopieren</button>
      </div>
    </main>
  );
}
