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

CREATE OR REPLACE FUNCTION set_prospecto_responsable_comercial_default()
RETURNS trigger AS $$
BEGIN
  IF NEW."responsable_comercial_id" IS NULL THEN
    NEW."responsable_comercial_id" := NEW."creadoPorId";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prospecto_responsable_comercial_default ON "prospecto";
CREATE TRIGGER prospecto_responsable_comercial_default
BEFORE INSERT ON "prospecto"
FOR EACH ROW
EXECUTE FUNCTION set_prospecto_responsable_comercial_default();
