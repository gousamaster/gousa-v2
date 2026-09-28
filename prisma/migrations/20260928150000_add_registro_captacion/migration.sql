CREATE TABLE "registro_captacion" (
  "id" TEXT NOT NULL,
  "nombres" TEXT NOT NULL,
  "apellidos" TEXT,
  "telefono" TEXT NOT NULL,
  "origen" TEXT,
  "interes" TEXT,
  "observaciones" TEXT,
  "captador" TEXT,
  "consentimiento" BOOLEAN NOT NULL DEFAULT false,
  "estado" TEXT NOT NULL DEFAULT 'REGISTRO',
  "prospectoId" TEXT,
  "creadoPorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "registro_captacion_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "registro_captacion_telefono_idx" ON "registro_captacion"("telefono");
CREATE INDEX "registro_captacion_origen_idx" ON "registro_captacion"("origen");
CREATE INDEX "registro_captacion_estado_idx" ON "registro_captacion"("estado");
CREATE INDEX "registro_captacion_createdAt_idx" ON "registro_captacion"("createdAt");