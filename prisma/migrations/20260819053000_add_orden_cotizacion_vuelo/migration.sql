-- NEXUS 2.0 / SERVICIOS / VUELOS
-- Ordenes de cotizacion asociadas obligatoriamente a un prospecto.

CREATE TABLE "orden_cotizacion_vuelo_contador" (
  "anio" INTEGER NOT NULL,
  "ultimo" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "orden_cotizacion_vuelo_contador_pkey" PRIMARY KEY ("anio")
);

CREATE TABLE "orden_cotizacion_vuelo" (
  "id" TEXT NOT NULL,
  "numeroOrden" TEXT NOT NULL,
  "prospectoId" TEXT NOT NULL,
  "origen" VARCHAR(3) NOT NULL,
  "destino" VARCHAR(3) NOT NULL,
  "fechaIda" TIMESTAMP(3) NOT NULL,
  "fechaRetorno" TIMESTAMP(3) NOT NULL,
  "flexibilidad" BOOLEAN NOT NULL DEFAULT false,
  "equipaje" BOOLEAN NOT NULL DEFAULT false,
  "observaciones" TEXT,
  "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
  "creadoPorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "despachadoAt" TIMESTAMP(3),

  CONSTRAINT "orden_cotizacion_vuelo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "orden_cotizacion_vuelo_numeroOrden_key"
  ON "orden_cotizacion_vuelo"("numeroOrden");
CREATE INDEX "orden_cotizacion_vuelo_prospectoId_idx"
  ON "orden_cotizacion_vuelo"("prospectoId");
CREATE INDEX "orden_cotizacion_vuelo_estado_idx"
  ON "orden_cotizacion_vuelo"("estado");
CREATE INDEX "orden_cotizacion_vuelo_creadoPorId_idx"
  ON "orden_cotizacion_vuelo"("creadoPorId");
CREATE INDEX "orden_cotizacion_vuelo_createdAt_idx"
  ON "orden_cotizacion_vuelo"("createdAt");

ALTER TABLE "orden_cotizacion_vuelo"
  ADD CONSTRAINT "orden_cotizacion_vuelo_prospectoId_fkey"
  FOREIGN KEY ("prospectoId") REFERENCES "prospecto"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "orden_cotizacion_vuelo"
  ADD CONSTRAINT "orden_cotizacion_vuelo_creadoPorId_fkey"
  FOREIGN KEY ("creadoPorId") REFERENCES "user"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "orden_cotizacion_vuelo"
  ADD CONSTRAINT "orden_cotizacion_vuelo_estado_check"
  CHECK ("estado" IN ('PENDIENTE', 'DESPACHADA'));

ALTER TABLE "orden_cotizacion_vuelo"
  ADD CONSTRAINT "orden_cotizacion_vuelo_ruta_check"
  CHECK ("origen" <> "destino");

ALTER TABLE "orden_cotizacion_vuelo"
  ADD CONSTRAINT "orden_cotizacion_vuelo_fechas_check"
  CHECK ("fechaRetorno" >= "fechaIda");
