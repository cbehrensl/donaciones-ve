-- Migración incremental aplicada al proyecto Supabase donacionesVe.
-- Objetivo: alinear la app Next.js con el esquema existente sin destruir datos.

alter table public.centros_acopio
  add column if not exists ubicacion_url text,
  add column if not exists codigo_gestion_hash text,
  add column if not exists telefono_responsable text;

create unique index if not exists idx_centros_codigo_gestion_hash
  on public.centros_acopio (codigo_gestion_hash)
  where codigo_gestion_hash is not null;

create index if not exists idx_centros_public_lookup
  on public.centros_acopio (estado_id, municipio_id, verificado, estatus)
  where verificado = true;

alter function public.fn_set_updated_at() set search_path = public, extensions;
alter function public.fn_set_necesidad_updated() set search_path = public, extensions;
alter function public.fn_audit_centro() set search_path = public, extensions;
alter function public.fn_crear_perfil_nuevo_usuario() set search_path = public, extensions;
alter function public.fn_registrar_propietario_centro() set search_path = public, extensions;

revoke execute on function public.fn_audit_centro() from anon, authenticated;
revoke execute on function public.fn_crear_perfil_nuevo_usuario() from anon, authenticated;
revoke execute on function public.fn_registrar_propietario_centro() from anon, authenticated;
revoke execute on function public.fn_audit_centro() from public;
revoke execute on function public.fn_crear_perfil_nuevo_usuario() from public;
revoke execute on function public.fn_registrar_propietario_centro() from public;

drop policy if exists "Moderadores gestionan fotos" on public.fotos_centro;
create policy "Moderadores gestionan fotos"
on public.fotos_centro
for all
to authenticated
using (
  exists (
    select 1
    from public.perfiles p
    where p.id = (select auth.uid())
      and p.rol = any (array['moderador'::public.rol_usuario, 'admin'::public.rol_usuario])
  )
)
with check (
  exists (
    select 1
    from public.perfiles p
    where p.id = (select auth.uid())
      and p.rol = any (array['moderador'::public.rol_usuario, 'admin'::public.rol_usuario])
  )
);

drop policy if exists "Moderadores gestionan fotos necesidad" on public.fotos_necesidad;
create policy "Moderadores gestionan fotos necesidad"
on public.fotos_necesidad
for all
to authenticated
using (
  exists (
    select 1
    from public.perfiles p
    where p.id = (select auth.uid())
      and p.rol = any (array['moderador'::public.rol_usuario, 'admin'::public.rol_usuario])
  )
)
with check (
  exists (
    select 1
    from public.perfiles p
    where p.id = (select auth.uid())
      and p.rol = any (array['moderador'::public.rol_usuario, 'admin'::public.rol_usuario])
  )
);

