import { z } from "zod";

export const moderatorIntentSchema = z.object({
  intent: z.enum(["query", "update_need", "mark_saturated", "clarify"]),
  centroHint: z.string().trim().max(120).optional(),
  estado: z.string().trim().max(80).optional(),
  municipio: z.string().trim().max(80).optional(),
  categoriaInsumo: z.string().trim().max(120).optional(),
  urgencia: z.enum(["URGENTE", "MEDIA", "SATURADO"]).optional(),
  detalle: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(300).optional(),
});

export type ModeratorIntent = z.infer<typeof moderatorIntentSchema>;

export const publicSearchIntentSchema = z.object({
  insumo: z.string().trim().max(120).optional(),
  estado: z.string().trim().max(80).optional(),
  municipio: z.string().trim().max(80).optional(),
  urgencia: z.enum(["URGENTE", "MEDIA", "SATURADO"]).optional(),
  notes: z.string().trim().max(200).optional(),
});

export type PublicSearchIntent = z.infer<typeof publicSearchIntentSchema>;

export const moderatorProposalSchema = z.object({
  centroId: z.string().uuid(),
  centroNombre: z.string().min(1),
  categoriaInsumo: z.string().min(1),
  urgencia: z.enum(["URGENTE", "MEDIA", "SATURADO"]),
  detalle: z.string().max(200).nullable(),
  operation: z.enum(["upsert_need"]),
});

export type ModeratorProposal = z.infer<typeof moderatorProposalSchema>;
