-- Preparación de búsqueda para alto volumen de centros.
-- Mejora filtros públicos por estatus/estado/municipio y búsqueda textual.

create extension if not exists pg_trgm with schema extensions;

create index if not exists idx_centros_public_search_filters
  on public.centros_acopio (estatus, estado_id, municipio_id, updated_at desc)
  where estatus in ('activo', 'saturado', 'sin_verificar');

create index if not exists idx_centros_nombre_trgm
  on public.centros_acopio
  using gin (nombre extensions.gin_trgm_ops);

create index if not exists idx_centros_direccion_trgm
  on public.centros_acopio
  using gin (direccion extensions.gin_trgm_ops);

create index if not exists idx_centros_telefono_contacto_trgm
  on public.centros_acopio
  using gin (telefono_contacto extensions.gin_trgm_ops)
  where telefono_contacto is not null;

create index if not exists idx_centros_moderacion_filters
  on public.centros_acopio (estatus, verificado, updated_at desc);

create index if not exists idx_centros_nombre_responsable_trgm
  on public.centros_acopio
  using gin (nombre_responsable extensions.gin_trgm_ops)
  where nombre_responsable is not null;

create index if not exists idx_centros_telefono_responsable_trgm
  on public.centros_acopio
  using gin (telefono_responsable extensions.gin_trgm_ops)
  where telefono_responsable is not null;
