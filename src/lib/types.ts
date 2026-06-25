export type Urgencia = "URGENTE" | "MEDIA" | "SATURADO";

export type TipoInsumo = string;

export type SemafaroEstado = "URGENTE" | "MEDIA" | "SATURADO" | "SIN_DATOS";

export interface Estado {
  id: string;
  nombre: string;
}

export interface Municipio {
  id: string;
  nombre: string;
  estado_id: string;
  estado?: Estado | null;
}

export interface Necesidad {
  id: string;
  centro_id: string;
  categoria_id?: string;
  tipo_insumo: TipoInsumo;
  urgencia: Urgencia;
  detalle: string | null;
  updated_at: string;
}

export interface CentroAcopio {
  id: string;
  nombre: string;
  direccion: string;
  municipio_id: string;
  estatus?: string;
  ubicacion_url: string | null;
  contacto: string | null;
  estado_vialidad: string | null;
  verificado: boolean;
  activo: boolean;
  updated_at: string;
  municipios?: Municipio | null;
  necesidades?: Necesidad[];
}

export interface ContactoEmergencia {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  telefonos: string[];
  whatsapp: string | null;
  zona: string | null;
  estado_id: string | null;
  estado_nombre: string | null;
  disponible_24h: boolean;
  es_gratuito: boolean;
}

/** Datos privados del responsable; solo accesibles vía service role. */
export interface CentroAcopioPrivado extends CentroAcopio {
  responsable_nombre: string;
  responsable_telefono: string;
}

export type CrearCentroResult =
  | { ok: true; centroId: string; codigoGestion: string }
  | { ok: false; message: string };

export interface ModeracionResumen {
  total: number;
  visibles: number;
  pendientes: number;
  verificados: number;
  ocultos: number;
  urgencias: number;
}

export interface DataLoadError {
  scope: string;
  message: string;
}
