ALTER TABLE "prospecto"
  ADD COLUMN IF NOT EXISTS "origen_detalle" TEXT,
  ADD COLUMN IF NOT EXISTS "primer_contacto_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "prospecto_origen_idx"
  ON "prospecto"("origen");

CREATE INDEX IF NOT EXISTS "prospecto_primer_contacto_at_idx"
  ON "prospecto"("primer_contacto_at");
