-- Agregar campos de gestión a refugios

ALTER TABLE public.refugios
ADD COLUMN codigo_gestion_hash TEXT,
ADD COLUMN responsable_nombre TEXT,
ADD COLUMN responsable_telefono TEXT;

-- Crear índice único para el código de gestión
CREATE UNIQUE INDEX idx_refugios_codigo_gestion_hash ON public.refugios(codigo_gestion_hash) WHERE codigo_gestion_hash IS NOT NULL;

-- Actualizar políticas RLS para permitir inserción pública de refugios
-- y actualización basada en codigo_gestion_hash

-- Permitir inserción pública
CREATE POLICY "Permitir inserción pública de refugios"
ON public.refugios FOR INSERT
TO public
WITH CHECK (true);

-- Permitir actualización si el código coincide (esto lo manejaremos desde el servidor con service_role,
-- pero por si acaso, podemos dejar que el servidor lo haga y no necesitamos RLS pública para UPDATE,
-- ya que la gestión se hace vía Server Actions con service_role o verificando el hash).
-- Actualmente, la app usa Server Actions para la gestión pública, así que no necesitamos RLS para UPDATE público.
