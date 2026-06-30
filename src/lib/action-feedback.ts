export type ActionFeedbackTone = "success" | "error";

export interface ActionFeedbackMessage {
  tone: ActionFeedbackTone;
  text: string;
}

export type ActionResult = {
  ok: boolean;
  code: string;
};

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
  "alerta-creada": {
    tone: "success",
    text: "La alerta se publicó correctamente para la vista pública.",
  },
  "alerta-eliminada": {
    tone: "success",
    text: "La alerta se eliminó correctamente.",
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
  "cocina-actualizada": {
    tone: "success",
    text: "Los datos de la cocina se guardaron correctamente.",
  },
  "necesidad-agregada": {
    tone: "success",
    text: "El ingrediente se agregó correctamente.",
  },
  "necesidad-actualizada": {
    tone: "success",
    text: "La urgencia del ingrediente se actualizó correctamente.",
  },
  "necesidad-eliminada": {
    tone: "success",
    text: "El ingrediente se quitó de la lista.",
  },
  "productor-actualizado": {
    tone: "success",
    text: "Los datos del productor se guardaron correctamente.",
  },
  "productor-verificado": {
    tone: "success",
    text: "El productor fue verificado y ya se muestra en el directorio.",
  },
  "productor-pendiente": {
    tone: "success",
    text: "El productor volvió al estado pendiente de verificación.",
  },
  "productor-oculto": {
    tone: "success",
    text: "El productor se ocultó de la vista pública.",
  },
  "productor-visible": {
    tone: "success",
    text: "El productor volvió a mostrarse en la plataforma.",
  },
  "acceso-productor": {
    tone: "success",
    text: "Acceso al panel del productor confirmado.",
  },
  "acceso-cocina": {
    tone: "success",
    text: "Acceso al panel de la cocina confirmado.",
  },
  "cocina-verificada": {
    tone: "success",
    text: "La cocina fue verificada y ya se muestra en el directorio.",
  },
  "cocina-pendiente": {
    tone: "success",
    text: "La cocina volvió al estado pendiente de verificación.",
  },
  "cocina-oculta": {
    tone: "success",
    text: "La cocina se ocultó de la vista pública.",
  },
  "cocina-visible": {
    tone: "success",
    text: "La cocina volvió a mostrarse en la plataforma.",
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
  "ai-no-configurado": {
    tone: "error",
    text: "El asistente AI no está configurado en este entorno.",
  },
  "chat-sin-centro": {
    tone: "error",
    text: "No pudimos identificar un centro único. Indica nombre y municipio.",
  },
  "chat-confirmado": {
    tone: "success",
    text: "Actualización aplicada correctamente desde el asistente.",
  },
  "chat-limite-sesion": {
    tone: "error",
    text: "Límite de consultas por sesión alcanzado. Espera unos minutos para continuar.",
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

export function actionSuccess(code: string): ActionResult {
  return { ok: true, code };
}

export function actionError(code: string): ActionResult {
  return { ok: false, code };
}
