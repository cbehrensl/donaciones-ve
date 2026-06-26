"use client";

import { useEffect, useRef, useState } from "react";

export default function IframeDonar({ src }: { src: string }) {
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

  return (
    <main ref={mainRef} style={{ display: "block", overflow: "hidden", height }}>
      <iframe
        src={src}
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        title="Donar dinero"
        allow="fullscreen"
      />
    </main>
  );
}
