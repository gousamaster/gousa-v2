ALTER TABLE "cliente"
  ADD COLUMN IF NOT EXISTS "servicio_historico_confirmado" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "servicio_historico_confirmado_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "servicio_historico_confirmado_por_id" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cliente_servicio_historico_confirmado_por_id_fkey'
  ) THEN
    ALTER TABLE "cliente"
      ADD CONSTRAINT "cliente_servicio_historico_confirmado_por_id_fkey"
      FOREIGN KEY ("servicio_historico_confirmado_por_id") REFERENCES "user"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "cliente_servicio_historico_confirmado_idx"
  ON "cliente"("servicio_historico_confirmado");
