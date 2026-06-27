"use client";

export default function IframeDonar({ src }: { src: string }) {
  return (
    <main className="page-iframe" style={{ overflow: "hidden" }}>
      <iframe
        src={src}
        style={{ width: "100%", minHeight: "2000px", border: "none", display: "block" }}
        title="Donar dinero"
        allow="fullscreen"
      />
    </main>
  );
}
