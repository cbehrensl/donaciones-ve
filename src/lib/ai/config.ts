import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

type AiTier = "flash" | "pro";

const DEFAULT_FLASH_MODEL = "gemini-2.5-flash";
const DEFAULT_PRO_MODEL = "gemini-2.5-pro";

export function isAiConfigured(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
}

function resolveTierByPrompt(prompt?: string): AiTier {
  if (!prompt?.trim()) {
    return "flash";
  }

  const normalized = prompt.toLowerCase();
  const signals = [
    /ambigu|varios|más de uno|confirma|confirmar|compara|comparar/.test(
      normalized,
    ),
    /actualiza|actualizar|modifica|modificar|saturad|urgente/.test(normalized),
    normalized.length > 220,
    normalized.split(/\s+/).length > 35,
  ].filter(Boolean).length;

  return signals >= 2 ? "pro" : "flash";
}

function resolveModelName(tier: AiTier): string {
  const explicitModel = process.env.AI_MODEL?.trim();
  if (explicitModel) {
    return explicitModel;
  }

  if (tier === "pro") {
    return process.env.AI_MODEL_PRO?.trim() || DEFAULT_PRO_MODEL;
  }

  return process.env.AI_MODEL_FLASH?.trim() || DEFAULT_FLASH_MODEL;
}

export function getAiModel(options?: {
  tier?: AiTier;
  prompt?: string;
  defaultTier?: AiTier;
}): LanguageModel | null {
  if (!isAiConfigured()) {
    return null;
  }

  const tier =
    options?.tier ||
    resolveTierByPrompt(options?.prompt) ||
    options?.defaultTier ||
    "flash";

  return google(resolveModelName(tier));
}
