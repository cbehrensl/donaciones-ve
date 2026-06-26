"use client";

import { useState } from "react";

interface CopyTextButtonProps {
  text: string;
  label?: string;
}

export function CopyTextButton({
  text,
  label = "Copiar reporte para WhatsApp/SMS",
}: CopyTextButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 2500);
    }
  }

  const style =
    status === "copied"
      ? { borderColor: "#0084D0", background: "#0084D0", color: "#fff" }
      : { borderColor: "#bdd9f0", background: "#EBF3FB", color: "#002858" };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="w-full rounded-xl border-2 px-3 py-3 text-sm font-bold shadow-sm transition-all active:scale-[0.98]"
      style={style}
    >
      {status === "copied"
        ? "✅ ¡Copiado!"
        : status === "error"
          ? "❌ No se pudo copiar"
          : `📋 ${label}`}
    </button>
  );
}
