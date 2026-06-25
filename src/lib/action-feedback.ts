import { redirect } from "next/navigation";

export type ActionFeedbackTone = "success" | "error";

export interface ActionFeedbackMessage {
  tone: ActionFeedbackTone;
  text: string;
}

export const ACTION_MESSAGES: Record<string, ActionFeedbackMessage> = {
  "detalles-guardados": {
    tone: "success",
    text: "Los datos del centro se guardaron correctamente.",
  },
  "insumo-agregado": {
    tone: "success",
    text: "El insumo se agregó correctamente.",
  },
  "insumo-actualizado": {
    tone: "success",
    text: "La urgencia del insumo se actualizó correctamente.",
  },
  "insumo-eliminado": {
    tone: "success",
    text: "El insumo se quitó del centro.",
  },
  "centro-aprobado": {
    tone: "success",
    text: "El centro fue aprobado y ya puede mostrarse como verificado.",
  },
  "centro-pendiente": {
    tone: "success",
    text: "El centro volvió al estado pendiente de verificación.",
  },
  "centro-oculto": {
    tone: "success",
    text: "El centro se ocultó de la vista pública.",
  },
  "centro-visible": {
    tone: "success",
    text: "El centro volvió a mostrarse en la plataforma.",
  },
  "centro-actualizado": {
    tone: "success",
    text: "Los datos del centro se actualizaron correctamente.",
  },
  "fechas-invalidas": {
    tone: "error",
    text: "La fecha fin no puede ser anterior a la fecha inicio.",
  },
  "datos-invalidos": {
    tone: "error",
    text: "Revisa los datos del formulario e intenta de nuevo.",
  },
  "acceso-denegado": {
    tone: "error",
    text: "No tienes permiso para realizar esta acción.",
  },
  "no-autorizado": {
    tone: "error",
    text: "Tu sesión de moderación expiró o no es válida. Vuelve a ingresar.",
  },
  "error-guardar": {
    tone: "error",
    text: "No pudimos guardar los cambios. Intenta de nuevo en unos segundos.",
  },
  "codigo-vacio": {
    tone: "error",
    text: "Ingresa tu código de gestión.",
  },
  "codigo-invalido": {
    tone: "error",
    text: "Código no válido. Verifica e intenta de nuevo.",
  },
  "supabase-no-configurado": {
    tone: "error",
    text: "Supabase no está configurado. No es posible acceder a centros reales.",
  },
  "supabase-service-no-configurado": {
    tone: "error",
    text: "Falta SUPABASE_SERVICE_ROLE_KEY. Es necesaria para validar códigos de gestión.",
  },
};

export function getActionMessage(
  code: string | undefined,
): ActionFeedbackMessage | null {
  if (!code) {
    return null;
  }

  return (
    ACTION_MESSAGES[code] ?? {
      tone: "error",
      text: "Ocurrió un error inesperado. Intenta de nuevo.",
    }
  );
}

function appendModeracionContext(
  params: URLSearchParams,
  formData: FormData,
): void {
  const token = String(formData.get("token") ?? "").trim();
  const q = String(formData.get("q") ?? "").trim();
  const estatus = String(formData.get("estatus") ?? "").trim();
  const verificacion = String(formData.get("verificacion") ?? "").trim();
  const page = String(formData.get("page") ?? "").trim();

  if (token) params.set("token", token);
  if (q) params.set("q", q);
  if (estatus && estatus !== "todos") params.set("estatus", estatus);
  if (verificacion && verificacion !== "todos") {
    params.set("verificacion", verificacion);
  }
  if (page && page !== "1") params.set("page", page);
}

export function redirectModeracion(
  formData: FormData,
  feedback: { ok?: string; error?: string },
): never {
  const params = new URLSearchParams();
  appendModeracionContext(params, formData);

  if (feedback.ok) params.set("ok", feedback.ok);
  if (feedback.error) params.set("error", feedback.error);

  redirect(`/moderacion?${params.toString()}`);
}

export function redirectGestionCentro(
  centroId: string,
  codigo: string,
  feedback: { ok?: string; error?: string },
): never {
  if (!centroId || !codigo) {
    const params = new URLSearchParams();
    params.set("error", feedback.error ?? "acceso-denegado");
    redirect(`/gestion?${params.toString()}`);
  }

  const params = new URLSearchParams();
  params.set("codigo", codigo);

  if (feedback.ok) params.set("ok", feedback.ok);
  if (feedback.error) params.set("error", feedback.error);

  redirect(`/gestion/${centroId}?${params.toString()}`);
}
