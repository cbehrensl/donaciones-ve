"use client";

import { useEffect, useMemo, useState } from "react";
import { getActionMessage } from "@/lib/action-feedback";
import { formatWhatsappHref } from "@/lib/contact-links";

interface ResultCentro {
  id: string;
  nombre: string;
  direccion: string;
  ubicacion_url: string | null;
  contacto: string | null;
  municipios?: { nombre: string } | null;
}

interface AssistantMessage {
  role: "assistant" | "user";
  text: string;
}

const SESSION_LIMIT = 20;
const LOCAL_COOLDOWN_MS = 3000;
const SESSION_ID_KEY = "dv-public-chat-session-id";
const SESSION_COUNT_KEY = "dv-public-chat-count";

export function PublicSearchChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: "assistant",
      text: "Hola, soy tu asistente de donaciones. Puedo ayudarte a encontrar centros por insumo y ubicación.",
    },
  ]);
  const [results, setResults] = useState<ResultCentro[]>([]);
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number>(SESSION_LIMIT);
  const [sessionId, setSessionId] = useState<string>("");
  const [nextAllowedAt, setNextAllowedAt] = useState<number>(0);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const storedId = window.sessionStorage.getItem(SESSION_ID_KEY);
    const storedCount = window.sessionStorage.getItem(SESSION_COUNT_KEY);
    const id =
      storedId ||
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    if (!storedId) {
      window.sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    setSessionId(id);

    const count = Number.parseInt(storedCount ?? "0", 10);
    const safeCount = Number.isFinite(count) ? Math.max(count, 0) : 0;
    setRemaining(Math.max(SESSION_LIMIT - safeCount, 0));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setInterval(() => setNowMs(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [isOpen]);

  const quickPrompts = useMemo(
    () => [
      "Dónde se necesita agua en Miranda",
      "Centros que reciben alimentos preparados en Caracas",
      "Qué centros están saturados de ropa",
    ],
    [],
  );

  async function handleSearch(question?: string) {
    const query = (question ?? input).trim();
    if (!query || !sessionId) return;
    const now = Date.now();
    if (now < nextAllowedAt) {
      const retrySec = Math.ceil((nextAllowedAt - now) / 1000);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Espera ${retrySec} segundo(s) antes de enviar otra consulta.`,
        },
      ]);
      return;
    }
    if (remaining <= 0) {
      const message = getActionMessage("chat-limite-sesion");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            message?.text ??
            "Límite de consultas por sesión alcanzado. Intenta más tarde.",
        },
      ]);
      return;
    }

    setLoading(true);
    setNextAllowedAt(now + LOCAL_COOLDOWN_MS);
    setMessages((prev) => [...prev, { role: "user", text: query }]);

    const response = await fetch("/api/busqueda/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-session-id": sessionId,
      },
      body: JSON.stringify({ message: query }),
    }).catch(() => null);

    if (!response) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "No se pudo conectar con el asistente. Intenta de nuevo.",
        },
      ]);
      setResults([]);
      setLoading(false);
      return;
    }

    const data = await response.json().catch(() => null);
    if (!data) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "No se pudo interpretar la respuesta del asistente.",
        },
      ]);
      setResults([]);
      setLoading(false);
      return;
    }

    if (typeof data.reply === "string") {
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    }
    setResults(Array.isArray(data.results) ? (data.results as ResultCentro[]) : []);

    if (typeof data.retryAfterSec === "number" && data.retryAfterSec > 0) {
      setNextAllowedAt(Date.now() + data.retryAfterSec * 1000);
    }

    if (typeof data.remaining === "number") {
      const nextRemaining = Math.max(data.remaining, 0);
      setRemaining(nextRemaining);
      const used = Math.max(SESSION_LIMIT - nextRemaining, 0);
      window.sessionStorage.setItem(SESSION_COUNT_KEY, String(used));
    } else {
      const used = SESSION_LIMIT - remaining + 1;
      window.sessionStorage.setItem(SESSION_COUNT_KEY, String(Math.max(used, 0)));
      setRemaining((prev) => Math.max(prev - 1, 0));
    }

    setLoading(false);
    setInput("");
  }

  return (
    <div className="fixed bottom-4 right-4 z-[90]">
      {isOpen ? (
        <section className="w-[min(92vw,26rem)] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
          <header className="flex items-center justify-between border-b border-zinc-100 bg-zinc-900 px-4 py-3 text-white">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Asistente virtual
              </p>
              <h2 className="text-sm font-black text-white">Dónde donar ahora</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded bg-white/10 px-2 py-1 text-xs font-bold text-white hover:bg-white/20"
            >
              Cerrar
            </button>
          </header>

          <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-2 text-xs text-zinc-600">
            Consultas disponibles en esta sesión: <strong>{remaining}</strong>/{SESSION_LIMIT}
          </div>

          <div className="max-h-72 space-y-2 overflow-y-auto px-4 py-3">
            {messages.map((message, index) => (
              <p
                key={`${message.role}-${index}`}
                className={`rounded-lg px-3 py-2 text-sm ${
                  message.role === "assistant"
                    ? "bg-zinc-100 text-zinc-800"
                    : "ml-8 bg-blue-700 text-white"
                }`}
              >
                {message.text}
              </p>
            ))}
          </div>

          <div className="border-t border-zinc-100 px-4 py-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSearch(prompt)}
                  disabled={loading || remaining <= 0 || nowMs < nextAllowedAt}
                  className="rounded-full border border-zinc-300 px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ej: alimentos preparados en Miranda"
                className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => handleSearch()}
                disabled={
                  loading ||
                  !input.trim() ||
                  remaining <= 0 ||
                  nowMs < nextAllowedAt
                }
                className="rounded-lg bg-blue-800 px-3 py-2 text-xs font-bold text-white hover:bg-blue-900 disabled:opacity-60"
              >
                {loading ? "..." : "Enviar"}
              </button>
            </div>
            {nowMs < nextAllowedAt ? (
              <p className="mt-1 text-[11px] text-zinc-500">
                Puedes enviar otra consulta en{" "}
                {Math.max(Math.ceil((nextAllowedAt - nowMs) / 1000), 1)}s.
              </p>
            ) : null}
          </div>

          {results.length > 0 ? (
            <div className="max-h-48 overflow-y-auto border-t border-zinc-100 bg-white px-4 py-3">
              <ul className="space-y-2">
                {results.map((centro) => (
                  <li
                    key={centro.id}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm"
                  >
                    <p className="font-black text-zinc-900">{centro.nombre}</p>
                    <p className="text-zinc-600">
                      {centro.municipios?.nombre ?? "Sin municipio"} · {centro.direccion}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {centro.contacto ? (
                        <a
                          href={formatWhatsappHref(centro.contacto)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded border border-zinc-300 px-2 py-1 text-xs font-bold text-zinc-700"
                        >
                          WhatsApp
                        </a>
                      ) : null}
                      {centro.ubicacion_url ? (
                        <a
                          href={centro.ubicacion_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800"
                        >
                          Abrir Maps
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-blue-800 px-4 py-3 text-sm font-black text-white shadow-xl hover:bg-blue-900"
        >
          Asistente virtual
        </button>
      )}
    </div>
  );
}
