CREATE TABLE "prospecto_score_evaluacion" (
  "id" TEXT NOT NULL,
  "prospecto_id" TEXT NOT NULL,
  "evaluador_id" TEXT,
  "modelo_version" TEXT NOT NULL,
  "respuestas" JSONB NOT NULL,
  "score" INTEGER NOT NULL,
  "clasificacion" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "prospecto_score_evaluacion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "prospecto_score_evaluacion_prospecto_id_fkey"
    FOREIGN KEY ("prospecto_id") REFERENCES "prospecto"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "prospecto_score_evaluacion_evaluador_id_fkey"
    FOREIGN KEY ("evaluador_id") REFERENCES "user"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "prospecto_score_evaluacion_prospecto_id_created_at_idx"
  ON "prospecto_score_evaluacion"("prospecto_id", "created_at");

CREATE INDEX "prospecto_score_evaluacion_evaluador_id_idx"
  ON "prospecto_score_evaluacion"("evaluador_id");

CREATE INDEX "prospecto_score_evaluacion_modelo_version_idx"
  ON "prospecto_score_evaluacion"("modelo_version");
