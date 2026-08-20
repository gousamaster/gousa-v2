ALTER TABLE "prospecto"
  ADD COLUMN IF NOT EXISTS "responsable_comercial_id" TEXT;

UPDATE "prospecto"
SET "responsable_comercial_id" = "creadoPorId"
WHERE "responsable_comercial_id" IS NULL
  AND "creadoPorId" IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'prospecto_responsable_comercial_id_fkey'
  ) THEN
    ALTER TABLE "prospecto"
      ADD CONSTRAINT "prospecto_responsable_comercial_id_fkey"
      FOREIGN KEY ("responsable_comercial_id") REFERENCES "user"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "prospecto_responsable_comercial_id_idx"
  ON "prospecto"("responsable_comercial_id");
