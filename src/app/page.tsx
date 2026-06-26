"use client";

import { useEffect, useRef, useState } from "react";

const DONAR_IFRAME_URL = process.env.NEXT_PUBLIC_DONAR_IFRAME_URL ?? "";

export default function DonarPage() {
  const [height, setHeight] = useState("100vh");
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => {
      const top = mainRef.current?.getBoundingClientRect().top ?? 0;
      setHeight(`${window.innerHeight - top}px`);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!DONAR_IFRAME_URL) {
    return (
      <p className="m-auto text-sm" style={{ color: "#0084D0" }}>
        Configura la variable de entorno <code>NEXT_PUBLIC_DONAR_IFRAME_URL</code> para mostrar el formulario de donación.
      </p>
    );
  }

  return (
    <main ref={mainRef} style={{ display: "block", overflow: "hidden", height }}>
      <iframe
        src={DONAR_IFRAME_URL}
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        title="Donar dinero"
        allow="fullscreen"
      />
    </main>
  );
}
