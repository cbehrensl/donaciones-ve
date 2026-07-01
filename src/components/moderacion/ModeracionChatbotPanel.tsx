"use client";

import { ModeradorChatbot } from "@/components/chatbots/ModeradorChatbot";

interface ModeracionChatbotPanelProps {
  token: string;
}

export function ModeracionChatbotPanel({ token }: ModeracionChatbotPanelProps) {
  return (
    <details className="rounded-xl border border-blue-200 bg-blue-50/50">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-bold text-blue-900 [&::-webkit-details-marker]:hidden">
        <span>Asistente de actualización</span>
        <span className="text-xs font-semibold text-blue-700">Abrir</span>
      </summary>
      <div className="border-t border-blue-100 bg-white p-3">
        <ModeradorChatbot token={token} embedded />
      </div>
    </details>
  );
}
