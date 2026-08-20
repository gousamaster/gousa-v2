CREATE TABLE IF NOT EXISTS "prospecto_auditoria" (
  "id" TEXT NOT NULL,
  "prospecto_id" TEXT NOT NULL,
  "usuario_id" TEXT,
  "accion" TEXT NOT NULL,
  "detalle" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "prospecto_auditoria_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "prospecto_auditoria_prospecto_id_fkey"
    FOREIGN KEY ("prospecto_id") REFERENCES "prospecto"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "prospecto_auditoria_usuario_id_fkey"
    FOREIGN KEY ("usuario_id") REFERENCES "user"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "prospecto_auditoria_prospecto_id_created_at_idx"
  ON "prospecto_auditoria"("prospecto_id", "created_at");

CREATE INDEX IF NOT EXISTS "prospecto_auditoria_usuario_id_created_at_idx"
  ON "prospecto_auditoria"("usuario_id", "created_at");

CREATE INDEX IF NOT EXISTS "prospecto_auditoria_accion_created_at_idx"
  ON "prospecto_auditoria"("accion", "created_at");
