import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { isModeratorTokenValid } from "@/lib/moderacion-auth";
import { getAiModel, isAiConfigured } from "@/lib/ai/config";
import { MODERATOR_CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import {
  moderatorIntentSchema,
  moderatorProposalSchema,
  type ModeratorProposal,
} from "@/lib/ai/schemas";
import {
  aplicarActualizacionNecesidad,
  buscarCentrosPorHint,
} from "@/lib/moderacion-updates";

const requestSchema = z.object({
  token: z.string().trim().min(1),
  message: z.string().trim().min(1).max(500).optional(),
  confirm: z.boolean().optional(),
  proposal: moderatorProposalSchema.optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, code: "datos-invalidos", reply: "Solicitud inválida." },
      { status: 400 },
    );
  }

  const { token, message, confirm, proposal } = parsed.data;

  if (!isModeratorTokenValid(token)) {
    return NextResponse.json(
      { ok: false, code: "no-autorizado", reply: "Token de moderador inválido." },
      { status: 401 },
    );
  }

  if (!isAiConfigured()) {
    return NextResponse.json({
      ok: false,
      code: "ai-no-configurado",
      reply: "El asistente no está disponible todavía en este entorno.",
    });
  }

  if (confirm && proposal) {
    const result = await aplicarActualizacionNecesidad({
      centroId: proposal.centroId,
      categoriaInsumo: proposal.categoriaInsumo,
      urgencia: proposal.urgencia,
      detalle: proposal.detalle,
      origen: "chat",
    });

    if (!result.ok) {
      return NextResponse.json({
        ok: false,
        code: "error-guardar",
        reply:
          result.error ??
          "No se pudo aplicar la actualización. Intenta de nuevo en unos segundos.",
      });
    }

    return NextResponse.json({
      ok: true,
      code: "chat-confirmado",
      reply: `Listo. Actualicé ${proposal.categoriaInsumo} en ${proposal.centroNombre} con urgencia ${proposal.urgencia}.`,
    });
  }

  if (!message) {
    return NextResponse.json(
      { ok: false, code: "datos-invalidos", reply: "Falta el mensaje." },
      { status: 400 },
    );
  }

  const model = getAiModel({ prompt: message, defaultTier: "flash" });
  if (!model) {
    return NextResponse.json({
      ok: false,
      code: "ai-no-configurado",
      reply: "El asistente no está disponible todavía en este entorno.",
    });
  }

  const { object } = await generateObject({
    model,
    schema: moderatorIntentSchema,
    system: MODERATOR_CHAT_SYSTEM_PROMPT,
    prompt: message,
  });

  const candidates = await buscarCentrosPorHint({
    centroHint: object.centroHint,
    estado: object.estado,
    municipio: object.municipio,
    limit: 6,
  });

  if (candidates.length === 0) {
    return NextResponse.json({
      ok: false,
      code: "chat-sin-centro",
      reply:
        "No encontré un centro con esos datos. Indica nombre del centro y municipio para evitar errores.",
      candidates: [],
    });
  }

  if (object.intent === "query" || object.intent === "clarify") {
    const preview = candidates
      .slice(0, 4)
      .map((c) => `• ${c.nombre}${c.municipio ? ` (${c.municipio})` : ""}`)
      .join("\n");

    return NextResponse.json({
      ok: true,
      code: "detalles-guardados",
      reply: `Encontré estos centros relacionados:\n${preview}\n\nIndícame el centro exacto y el insumo para preparar la actualización.`,
      candidates,
    });
  }

  if (!object.categoriaInsumo) {
    return NextResponse.json({
      ok: false,
      code: "datos-invalidos",
      reply: "Necesito que indiques el insumo (por ejemplo: agua, alimentos, medicinas).",
      candidates,
    });
  }

  if (candidates.length > 1) {
    const preview = candidates
      .slice(0, 5)
      .map((c) => `• ${c.nombre}${c.municipio ? ` (${c.municipio})` : ""}`)
      .join("\n");

    return NextResponse.json({
      ok: false,
      code: "chat-sin-centro",
      reply: `Hay varios centros posibles:\n${preview}\n\nEscribe el nombre exacto del centro para confirmar la actualización.`,
      candidates,
    });
  }

  const selected = candidates[0];
  const urgencia =
    object.intent === "mark_saturated"
      ? "SATURADO"
      : object.urgencia ?? "MEDIA";

  const nextProposal: ModeratorProposal = {
    centroId: selected.id,
    centroNombre: selected.nombre,
    categoriaInsumo: object.categoriaInsumo,
    urgencia,
    detalle: object.detalle ?? null,
    operation: "upsert_need",
  };

  return NextResponse.json({
    ok: true,
    code: "detalles-guardados",
    proposal: nextProposal,
    candidates,
    reply: `Propuesta: actualizar ${object.categoriaInsumo} en ${selected.nombre} (${selected.municipio ?? "sin municipio"}) con urgencia ${urgencia}.${object.detalle ? ` Detalle: ${object.detalle}.` : ""} Confirma para aplicarlo.`,
  });
}
