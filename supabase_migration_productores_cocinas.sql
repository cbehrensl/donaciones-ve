-- Migración: módulo productores de alimentos y cocinas comunitarias
-- Tablas: productores, cocinas_comunitarias, necesidades_cocina

-- ============================================================
-- TABLA: productores
-- Productores de alimentos que donan insumos (proteínas, vegetales, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.productores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  contacto TEXT,
  ubicacion_url TEXT,
  estado_id SMALLINT REFERENCES public.estados(id),
  municipio_id SMALLINT REFERENCES public.municipios(id),
  -- categorias: arreglo de etiquetas de lo que pueden aportar
  -- valores posibles: 'proteinas', 'vegetales', 'no_perecederos', 'lacteos', 'granos', 'frutas', 'otros'
  categorias TEXT[] NOT NULL DEFAULT '{}',
  -- datos privados del responsable (solo service role)
  responsable_nombre TEXT NOT NULL,
  responsable_telefono TEXT NOT NULL,
  codigo_gestion_hash TEXT,
  -- moderación
  verificado BOOLEAN NOT NULL DEFAULT false,
  activo BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_productores_codigo_gestion_hash
  ON public.productores (codigo_gestion_hash)
  WHERE codigo_gestion_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_productores_estado_id
  ON public.productores (estado_id, verificado, activo);

CREATE INDEX IF NOT EXISTS idx_productores_municipio_id
  ON public.productores (municipio_id, verificado, activo);

ALTER TABLE public.productores ENABLE ROW LEVEL SECURITY;

-- Lectura pública: solo productores verificados y activos
CREATE POLICY "Productores verificados visibles al público"
  ON public.productores FOR SELECT
  USING (verificado = true AND activo = true);

-- Inserción: cualquiera puede registrar un productor (como centros_acopio)
CREATE POLICY "Registro público de productores"
  ON public.productores FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Actualización vía service role únicamente.
-- No se crea policy de UPDATE: service role bypasses RLS desde server actions.

-- ============================================================
-- TABLA: cocinas_comunitarias
-- Cocinas que preparan comida para la comunidad y necesitan insumos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cocinas_comunitarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  contacto TEXT,
  direccion TEXT NOT NULL,
  ubicacion_url TEXT,
  estado_id SMALLINT REFERENCES public.estados(id),
  municipio_id SMALLINT REFERENCES public.municipios(id),
  horario TEXT,
  capacidad_beneficiarios INT,
  -- datos privados del responsable
  responsable_nombre TEXT NOT NULL,
  responsable_telefono TEXT NOT NULL,
  codigo_gestion_hash TEXT,
  -- moderación
  verificado BOOLEAN NOT NULL DEFAULT false,
  activo BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cocinas_codigo_gestion_hash
  ON public.cocinas_comunitarias (codigo_gestion_hash)
  WHERE codigo_gestion_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cocinas_estado_id
  ON public.cocinas_comunitarias (estado_id, verificado, activo);

CREATE INDEX IF NOT EXISTS idx_cocinas_municipio_id
  ON public.cocinas_comunitarias (municipio_id, verificado, activo);

ALTER TABLE public.cocinas_comunitarias ENABLE ROW LEVEL SECURITY;

-- Lectura pública: solo cocinas verificadas y activas
CREATE POLICY "Cocinas verificadas visibles al público"
  ON public.cocinas_comunitarias FOR SELECT
  USING (verificado = true AND activo = true);

-- Inserción pública
CREATE POLICY "Registro público de cocinas"
  ON public.cocinas_comunitarias FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Actualización vía service role.
-- No se crea policy de UPDATE: service role bypasses RLS desde server actions.

-- ============================================================
-- TABLA: necesidades_cocina
-- Qué ingredientes necesita cada cocina comunitaria
-- ============================================================
CREATE TABLE IF NOT EXISTS public.necesidades_cocina (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cocina_id UUID NOT NULL REFERENCES public.cocinas_comunitarias(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL,   -- ej: 'Proteínas', 'Vegetales', 'Granos', etc.
  urgencia TEXT NOT NULL DEFAULT 'MEDIA'
    CHECK (urgencia IN ('URGENTE', 'MEDIA', 'SATURADO')),
  detalle TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_necesidades_cocina_cocina_id
  ON public.necesidades_cocina (cocina_id, activo);

ALTER TABLE public.necesidades_cocina ENABLE ROW LEVEL SECURITY;

-- Lectura pública de necesidades (para mostrar en tarjetas)
CREATE POLICY "Necesidades cocina visibles al público"
  ON public.necesidades_cocina FOR SELECT
  USING (activo = true);

-- Inserción/actualización vía service role.
-- No se crea policy de escritura: service role bypasses RLS desde server actions.

-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_productores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, extensions;

CREATE TRIGGER update_productores_updated_at
  BEFORE UPDATE ON public.productores
  FOR EACH ROW EXECUTE FUNCTION public.handle_productores_updated_at();

CREATE OR REPLACE FUNCTION public.handle_cocinas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, extensions;

CREATE TRIGGER update_cocinas_updated_at
  BEFORE UPDATE ON public.cocinas_comunitarias
  FOR EACH ROW EXECUTE FUNCTION public.handle_cocinas_updated_at();

CREATE OR REPLACE FUNCTION public.handle_necesidades_cocina_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, extensions;

CREATE TRIGGER update_necesidades_cocina_updated_at
  BEFORE UPDATE ON public.necesidades_cocina
  FOR EACH ROW EXECUTE FUNCTION public.handle_necesidades_cocina_updated_at();
