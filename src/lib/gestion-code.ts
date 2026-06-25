import { createHash, randomBytes } from "crypto";

/** Normaliza el código ingresado por el usuario (sin espacios, mayúsculas, sin guiones). */
export function normalizeManagementCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Genera un código legible: DV-XXXX-XXXX-XXXX */
export function generateManagementCode(): string {
  const raw = randomBytes(6).toString("hex").toUpperCase();
  const groups = raw.match(/.{1,4}/g) ?? [];
  return `DV-${groups.join("-")}`;
}

/** Hash SHA-256 del código normalizado para almacenar en BD. */
export function hashManagementCode(code: string): string {
  const normalized = normalizeManagementCode(code);
  return createHash("sha256").update(normalized).digest("hex");
}

/** Formatea un código normalizado para mostrar al usuario. */
export function formatManagementCodeDisplay(code: string): string {
  const normalized = normalizeManagementCode(code);
  if (normalized.startsWith("DV")) {
    const body = normalized.slice(2);
    const groups = body.match(/.{1,4}/g) ?? [body];
    return `DV-${groups.join("-")}`;
  }
  const groups = normalized.match(/.{1,4}/g) ?? [normalized];
  return `DV-${groups.join("-")}`;
}
