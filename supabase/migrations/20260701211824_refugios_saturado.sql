-- Agregar columna saturado a refugios

ALTER TABLE public.refugios
ADD COLUMN saturado BOOLEAN DEFAULT false NOT NULL;
