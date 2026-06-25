-- Esquema: centros de acopio y necesidades (Venezuela)
-- Ejecutar en el SQL Editor de Supabase

create extension if not exists "pgcrypto";

create type public.urgencia_nivel as enum ('URGENTE', 'MEDIA', 'SATURADO');

create type public.tipo_insumo as enum (
  'Medicinas',
  'Agua',
  'Alimentos',
  'Higiene',
  'Ropa',
  'Refugio',
  'Otros'
);

create table public.estados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique
);

create table public.municipios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  estado_id uuid not null references public.estados (id) on delete restrict,
  unique (nombre, estado_id)
);

create table public.centros_acopio (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text not null,
  municipio_id uuid not null references public.municipios (id) on delete restrict,
  ubicacion_url text,
  contacto text,
  estado_vialidad text,
  responsable_nombre text not null,
  responsable_telefono text not null,
  codigo_gestion_hash text not null unique,
  verificado boolean not null default false,
  activo boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.necesidades (
  id uuid primary key default gen_random_uuid(),
  centro_id uuid not null references public.centros_acopio (id) on delete cascade,
  tipo_insumo public.tipo_insumo not null,
  urgencia public.urgencia_nivel not null default 'MEDIA',
  detalle text,
  updated_at timestamptz not null default now()
);

create index idx_municipios_estado on public.municipios (estado_id);
create index idx_centros_municipio on public.centros_acopio (municipio_id);
create index idx_centros_verificado on public.centros_acopio (verificado);
create index idx_centros_activo on public.centros_acopio (activo);
create index idx_centros_codigo_hash on public.centros_acopio (codigo_gestion_hash);
create index idx_necesidades_centro on public.necesidades (centro_id);
create index idx_necesidades_urgencia on public.necesidades (urgencia);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger centros_acopio_updated_at
before update on public.centros_acopio
for each row execute function public.set_updated_at();

create trigger necesidades_updated_at
before update on public.necesidades
for each row execute function public.set_updated_at();

alter table public.estados enable row level security;
alter table public.municipios enable row level security;
alter table public.centros_acopio enable row level security;
alter table public.necesidades enable row level security;

-- Lectura pública de catálogos geográficos
create policy "Lectura pública de estados"
on public.estados for select to anon, authenticated using (true);

create policy "Lectura pública de municipios"
on public.municipios for select to anon, authenticated using (true);

-- Lectura pública: solo centros activos (sin datos privados del responsable vía API)
create policy "Lectura pública de centros activos"
on public.centros_acopio for select to anon, authenticated
using (activo = true);

-- Lectura pública: necesidades de centros activos
create policy "Lectura pública de necesidades"
on public.necesidades for select to anon, authenticated
using (
  exists (
    select 1 from public.centros_acopio c
    where c.id = necesidades.centro_id and c.activo = true
  )
);

-- Escrituras: solo service role (Server Actions). Sin políticas INSERT/UPDATE/DELETE para anon/authenticated.

insert into public.estados (id, nombre) values
  ('e1111111-1111-1111-1111-111111111111', 'Distrito Capital'),
  ('e2222222-2222-2222-2222-222222222222', 'Miranda'),
  ('e3333333-3333-3333-3333-333333333333', 'Zulia')
on conflict (nombre) do nothing;

insert into public.municipios (nombre, estado_id) values
  ('Libertador', 'e1111111-1111-1111-1111-111111111111'),
  ('Chacao', 'e2222222-2222-2222-2222-222222222222'),
  ('Baruta', 'e2222222-2222-2222-2222-222222222222'),
  ('Sucre', 'e2222222-2222-2222-2222-222222222222'),
  ('El Hatillo', 'e2222222-2222-2222-2222-222222222222'),
  ('Maracaibo', 'e3333333-3333-3333-3333-333333333333')
on conflict do nothing;
