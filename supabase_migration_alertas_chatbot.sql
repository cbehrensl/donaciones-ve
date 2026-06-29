-- Alertas en vivo para necesidades y saturación de centros.

create table if not exists public.alertas_centro (
  id uuid primary key default gen_random_uuid(),
  centro_id uuid not null references public.centros_acopio(id) on delete cascade,
  tipo text not null check (tipo in ('NECESIDAD_URGENTE', 'INSUMO_SATURADO', 'ACTUALIZACION_CENTRO')),
  mensaje text not null,
  metadata jsonb,
  visible_publico boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_alertas_centro_created_at
  on public.alertas_centro (created_at desc);

create index if not exists idx_alertas_centro_tipo_created
  on public.alertas_centro (tipo, created_at desc);

create index if not exists idx_alertas_centro_public_created
  on public.alertas_centro (visible_publico, created_at desc)
  where visible_publico = true;
