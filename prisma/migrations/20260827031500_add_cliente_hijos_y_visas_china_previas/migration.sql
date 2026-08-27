CREATE TABLE IF NOT EXISTS public.cliente_hijo (
  id text PRIMARY KEY DEFAULT ('hijo_' || md5(random()::text || clock_timestamp()::text)),
  cliente_id text NOT NULL REFERENCES public.cliente(id) ON DELETE CASCADE,
  nombre_completo text NOT NULL,
  fecha_nacimiento date,
  ocupacion text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cliente_hijo_cliente_id ON public.cliente_hijo(cliente_id);

CREATE TABLE IF NOT EXISTS public.cliente_visa_china_anterior (
  id text PRIMARY KEY DEFAULT ('vch_' || md5(random()::text || clock_timestamp()::text)),
  cliente_id text NOT NULL REFERENCES public.cliente(id) ON DELETE CASCADE,
  numero_visa text,
  tipo_visa text,
  fecha_emision date,
  fecha_vencimiento date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cliente_visa_china_anterior_cliente_id ON public.cliente_visa_china_anterior(cliente_id);
