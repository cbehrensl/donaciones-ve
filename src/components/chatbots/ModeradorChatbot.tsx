"use client";

import { useState } from "react";
import { useSnackbar } from "@/components/SnackbarProvider";
import type { ModeratorProposal } from "@/lib/ai/schemas";

interface ModeradorChatbotProps {
  token: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export function ModeradorChatbot({ token }: ModeradorChatbotProps) {
  const showSnackbar = useSnackbar();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [proposal, setProposal] = useState<ModeratorProposal | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage(confirm = false) {
    if ((!input.trim() && !confirm) || !token) {
      return;
    }

    setIsLoading(true);

    if (!confirm) {
      setMessages((prev) => [...prev, { role: "user", text: input.trim() }]);
    }

    const payload = confirm
      ? { token, confirm: true, proposal }
      : { token, message: input.trim() };

    const response = await fetch("/api/moderacion/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (!response) {
      showSnackbar("error-guardar");
      setIsLoading(false);
      return;
    }

    const data = await response.json().catch(() => null);
    if (!data) {
      showSnackbar("error-guardar");
      setIsLoading(false);
      return;
    }

    if (data.code) {
      showSnackbar(data.code, { refresh: Boolean(data.ok && confirm) });
    }

    if (typeof data.reply === "string") {
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    }

    if (data.proposal) {
      setProposal(data.proposal as ModeratorProposal);
    } else if (confirm) {
      setProposal(null);
    }

    if (!confirm) {
      setInput("");
    }

    setIsLoading(false);
  }

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
      <h2 className="text-sm font-black uppercase tracking-wide text-blue-900">
        Asistente de actualización rápida
      </h2>
      <p className="mt-1 text-xs text-blue-900/80">
        Escribe cambios en lenguaje natural. El asistente siempre mostrará una
        propuesta antes de aplicar cambios.
      </p>

      <div className="mt-3 max-h-56 space-y-2 overflow-y-auto rounded-lg bg-white p-3">
        {messages.length === 0 ? (
          <p className="text-xs text-zinc-500">
            Ejemplo: &quot;La Iglesia San José en Chacao necesita agua urgente&quot;.
          </p>
        ) : (
          messages.map((msg, idx) => (
            <p
              key={`${msg.role}-${idx}`}
              className={`text-sm ${msg.role === "user" ? "text-zinc-900" : "text-blue-900"}`}
            >
              <strong>{msg.role === "user" ? "Tú" : "Asistente"}:</strong>{" "}
              {msg.text}
            </p>
          ))
        )}
      </div>

      {proposal ? (
        <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <p className="font-bold">Propuesta pendiente</p>
          <p>
            {proposal.centroNombre}: {proposal.categoriaInsumo} ({proposal.urgencia})
            {proposal.detalle ? ` - ${proposal.detalle}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => sendMessage(true)}
              disabled={isLoading}
              className="rounded bg-amber-700 px-3 py-1.5 font-bold text-white hover:bg-amber-800 disabled:opacity-60"
            >
              Confirmar y aplicar
            </button>
            <button
              type="button"
              onClick={() => setProposal(null)}
              className="rounded border border-amber-300 px-3 py-1.5 font-bold text-amber-800"
            >
              Descartar
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Describe la actualización..."
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => sendMessage(false)}
          disabled={isLoading || !input.trim()}
          className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-bold text-white hover:bg-blue-900 disabled:opacity-60"
        >
          {isLoading ? "Procesando..." : "Enviar"}
        </button>
      </div>
    </section>
  );
}
