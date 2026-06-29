import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { getAiModel, isAiConfigured } from "@/lib/ai/config";
import { PUBLIC_SEARCH_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { publicSearchIntentSchema } from "@/lib/ai/schemas";
import { buscarCentrosPorNecesidadRapida } from "@/lib/data";
import {
  checkSessionCooldown,
  checkSessionQueryLimit,
} from "@/lib/session-rate-limit";

const requestSchema = z.object({
  message: z.string().trim().min(3).max(300),
});

function containsInjectionPattern(message: string): boolean {
  const normalized = message.toLowerCase();
  const patterns = [
    "ignore previous instructions",
    "ignora las instrucciones",
    "ignora instrucciones previas",
    "system prompt",
    "developer message",
    "jailbreak",
    "bypass",
    "actúa como",
    "actua como",
    "hazte pasar por",
    "revela el prompt",
  ];

  return patterns.some((pattern) => normalized.includes(pattern));
}

function inferIntentFallback(message: string) {
  const normalized = message.toLowerCase();
  const matchFromList = (items: string[]) =>
    items.find((item) => normalized.includes(item));

  const urgencia = normalized.includes("saturad")
    ? "SATURADO"
    : normalized.includes("urgent")
      ? "URGENTE"
      : undefined;

  const knownEstados = [
    "amazonas",
    "anzoátegui",
    "anzoategui",
    "apure",
    "aragua",
    "barinas",
    "bolívar",
    "bolivar",
    "carabobo",
    "cojedes",
    "delta amacuro",
    "distrito capital",
    "falcón",
    "falcon",
    "guárico",
    "guarico",
    "la guaira",
    "lara",
    "mérida",
    "merida",
    "miranda",
    "monagas",
    "nueva esparta",
    "portuguesa",
    "sucre",
    "táchira",
    "tachira",
    "trujillo",
    "yaracuy",
    "zulia",
  ];

  const knownInsumos = [
    "alimentos preparados",
    "alimentos",
    "comida",
    "agua",
    "medicinas",
    "medicamentos",
    "ropa",
    "higiene",
    "pañales",
    "panales",
    "fórmula infantil",
    "formula infantil",
  ];

  const estado = matchFromList(knownEstados);
  const insumo = matchFromList(knownInsumos);

  return {
    insumo,
    estado,
    municipio: undefined,
    urgencia: urgencia as "URGENTE" | "MEDIA" | "SATURADO" | undefined,
    notes: "fallback-deterministico",
  };
}

export async function POST(request: Request) {
  const sessionId =
    request.headers.get("x-session-id")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anon";
  const limitResult = checkSessionQueryLimit({
    sessionId: `public-search:${sessionId}`,
    limit: 20,
    windowMs: 1000 * 60 * 30,
  });

  if (!limitResult.allowed) {
    return NextResponse.json(
      {
        ok: false,
        code: "chat-limite-sesion",
        reply: `Alcanzaste el límite de consultas de esta sesión. Intenta de nuevo en ${limitResult.retryAfterSec} segundos.`,
        results: [],
        remaining: 0,
        retryAfterSec: limitResult.retryAfterSec,
      },
      {
        status: 429,
        headers: { "cache-control": "no-store" },
      },
    );
  }

  const cooldownResult = checkSessionCooldown({
    sessionId: `public-search:${sessionId}`,
    cooldownMs: 3000,
  });

  if (!cooldownResult.allowed) {
    return NextResponse.json(
      {
        ok: false,
        code: "datos-invalidos",
        reply: `Vas muy rápido. Espera ${cooldownResult.retryAfterSec} segundo(s) antes de enviar otra consulta.`,
        results: [],
        remaining: limitResult.remaining,
        retryAfterSec: cooldownResult.retryAfterSec,
      },
      {
        status: 429,
        headers: { "cache-control": "no-store" },
      },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        code: "datos-invalidos",
        reply: "Escribe una pregunta más específica para poder ayudarte.",
        results: [],
        remaining: limitResult.remaining,
      },
      { headers: { "cache-control": "no-store" } },
    );
  }

  if (containsInjectionPattern(parsed.data.message)) {
    return NextResponse.json(
      {
        ok: false,
        code: "datos-invalidos",
        reply:
          "No pude procesar ese tipo de instrucción. Haz la consulta en formato de necesidad y ubicación, por ejemplo: 'agua en Miranda'.",
        results: [],
        remaining: limitResult.remaining,
      },
      { headers: { "cache-control": "no-store" } },
    );
  }

  let object: z.infer<typeof publicSearchIntentSchema>;
  const model = isAiConfigured()
    ? getAiModel({ prompt: parsed.data.message, defaultTier: "flash" })
    : null;

  if (!model) {
    object = inferIntentFallback(parsed.data.message);
  } else {
    try {
      const aiResult = await generateObject({
        model,
        schema: publicSearchIntentSchema,
        system: PUBLIC_SEARCH_SYSTEM_PROMPT,
        prompt: parsed.data.message,
      });
      object = aiResult.object;
    } catch (error) {
      console.error("Fallo de IA en búsqueda rápida, usando fallback:", error);
      object = inferIntentFallback(parsed.data.message);
    }
  }

  const centros = await buscarCentrosPorNecesidadRapida({
    insumo: object.insumo,
    estado: object.estado,
    municipio: object.municipio,
    urgencia: object.urgencia,
    limit: 6,
  });

  if (centros.length === 0) {
    return NextResponse.json(
      {
        ok: true,
        code: "datos-invalidos",
        reply:
          "No encontré coincidencias exactas con ese insumo y ubicación. Intenta agregar estado o usar otro nombre de insumo.",
        intent: object,
        results: [],
        remaining: limitResult.remaining,
      },
      { headers: { "cache-control": "no-store" } },
    );
  }

  const replyLines = centros.slice(0, 4).map((centro) => {
    const municipio = centro.municipios?.nombre ?? "Sin municipio";
    const contacto = centro.contacto ? ` · Tel: ${centro.contacto}` : "";
    return `• ${centro.nombre} (${municipio})${contacto}`;
  });

  return NextResponse.json(
    {
      ok: true,
      code: "detalles-guardados",
      reply: `Encontré ${centros.length} centro(s):\n${replyLines.join("\n")}`,
      intent: object,
      results: centros,
      remaining: limitResult.remaining,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
