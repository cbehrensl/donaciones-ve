export function getMissingRefugiosColumn(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const maybe = error as { message?: unknown; code?: unknown };
  const message = typeof maybe.message === "string" ? maybe.message : "";

  const match = message.match(/column\s+refugios\.(\w+)\s+does not exist/i);
  return match?.[1]?.toLowerCase() ?? null;
}

export function isMissingRefugiosColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybe = error as { message?: unknown; code?: unknown };
  const message =
    typeof maybe.message === "string" ? maybe.message.toLowerCase() : "";
  const code = typeof maybe.code === "string" ? maybe.code : "";

  return (
    code === "42703" ||
    message.includes("column refugios.") ||
    (message.includes("refugios") && message.includes("does not exist"))
  );
}

export function omitMissingRefugiosColumn<T extends Record<string, unknown>>(
  payload: T,
  error: unknown,
): T {
  const missingColumn = getMissingRefugiosColumn(error);
  if (!missingColumn || !(missingColumn in payload)) {
    return payload;
  }
  const next = { ...payload };
  delete next[missingColumn];
  return next as T;
}
