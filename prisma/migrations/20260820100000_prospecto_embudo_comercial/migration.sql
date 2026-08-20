ALTER TABLE "prospecto"
  ADD COLUMN IF NOT EXISTS "motivo_perdida" TEXT,
  ADD COLUMN IF NOT EXISTS "perdido_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "prospecto_estado_convertido_idx"
  ON "prospecto"("estado", "convertido");
