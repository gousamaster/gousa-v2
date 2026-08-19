CREATE TABLE "prospecto_seguimiento" (
  "id" TEXT NOT NULL,
  "prospecto_id" TEXT NOT NULL,
  "responsable_id" TEXT,
  "creado_por_id" TEXT,
  "tipo" TEXT NOT NULL DEFAULT 'LLAMADA',
  "accion" TEXT NOT NULL,
  "programado_at" TIMESTAMP(3) NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
  "notas" TEXT,
  "completado_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "prospecto_seguimiento_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "prospecto_seguimiento_prospecto_id_fkey"
    FOREIGN KEY ("prospecto_id") REFERENCES "prospecto"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "prospecto_seguimiento_responsable_id_fkey"
    FOREIGN KEY ("responsable_id") REFERENCES "user"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "prospecto_seguimiento_creado_por_id_fkey"
    FOREIGN KEY ("creado_por_id") REFERENCES "user"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "prospecto_seguimiento_prospecto_id_programado_at_idx"
  ON "prospecto_seguimiento"("prospecto_id", "programado_at");

CREATE INDEX "prospecto_seguimiento_estado_programado_at_idx"
  ON "prospecto_seguimiento"("estado", "programado_at");

CREATE INDEX "prospecto_seguimiento_responsable_id_idx"
  ON "prospecto_seguimiento"("responsable_id");
