DO $$
DECLARE
  fuente_exists boolean;
  fuente_detalle_exists boolean;
  fuente_has_data boolean := false;
  fuente_detalle_has_data boolean := false;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='prospecto' AND column_name='fuente'
  ) INTO fuente_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='prospecto' AND column_name='fuente_detalle'
  ) INTO fuente_detalle_exists;

  IF fuente_exists THEN
    EXECUTE 'SELECT EXISTS (SELECT 1 FROM "prospecto" WHERE "fuente" IS NOT NULL AND BTRIM("fuente") <> '''')'
      INTO fuente_has_data;
  END IF;

  IF fuente_detalle_exists THEN
    EXECUTE 'SELECT EXISTS (SELECT 1 FROM "prospecto" WHERE "fuente_detalle" IS NOT NULL AND BTRIM("fuente_detalle") <> '''')'
      INTO fuente_detalle_has_data;
  END IF;

  IF fuente_has_data OR fuente_detalle_has_data THEN
    RAISE EXCEPTION 'No se eliminan fuente/fuente_detalle: contienen datos. Revisar manualmente antes de continuar.';
  END IF;

  IF fuente_exists THEN
    EXECUTE 'ALTER TABLE "prospecto" DROP COLUMN "fuente"';
  END IF;

  IF fuente_detalle_exists THEN
    EXECUTE 'ALTER TABLE "prospecto" DROP COLUMN "fuente_detalle"';
  END IF;
END $$;
