CREATE TABLE IF NOT EXISTS "prospecto_historial" (
  "id" TEXT NOT NULL,
  "prospecto_id" TEXT NOT NULL,
  "estado_anterior" TEXT,
  "estado_nuevo" TEXT NOT NULL,
  "motivo_perdida" TEXT,
  "cambiado_por_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "prospecto_historial_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "prospecto_historial_prospecto_id_fkey"
    FOREIGN KEY ("prospecto_id") REFERENCES "prospecto"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "prospecto_historial_cambiado_por_id_fkey"
    FOREIGN KEY ("cambiado_por_id") REFERENCES "user"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "prospecto_historial_prospecto_id_created_at_idx"
  ON "prospecto_historial"("prospecto_id", "created_at");

CREATE INDEX IF NOT EXISTS "prospecto_historial_estado_nuevo_created_at_idx"
  ON "prospecto_historial"("estado_nuevo", "created_at");
