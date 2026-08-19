import { db } from "@/lib/db";

export async function ensureVuelosSchema() {
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "orden_cotizacion_vuelo_contador" (
      "anio" INTEGER NOT NULL PRIMARY KEY,
      "ultimo" INTEGER NOT NULL DEFAULT 0
    )
  `);

  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "orden_cotizacion_vuelo" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "numeroOrden" TEXT NOT NULL UNIQUE,
      "prospectoId" TEXT NOT NULL REFERENCES "prospecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      "tipoViaje" TEXT NOT NULL DEFAULT 'IDA_VUELTA',
      "origen" VARCHAR(3) NOT NULL,
      "destino" VARCHAR(3) NOT NULL,
      "fechaIda" TIMESTAMP(3) NOT NULL,
      "fechaRetorno" TIMESTAMP(3),
      "tramos" JSONB,
      "flexibilidad" BOOLEAN NOT NULL DEFAULT false,
      "equipaje" BOOLEAN NOT NULL DEFAULT false,
      "observaciones" TEXT,
      "estado" TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK ("estado" IN ('PENDIENTE', 'DESPACHADA')),
      "creadoPorId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "despachadoAt" TIMESTAMP(3),
      CHECK ("origen" <> "destino")
    )
  `);

  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_vuelo" ADD COLUMN IF NOT EXISTS "tipoViaje" TEXT NOT NULL DEFAULT 'IDA_VUELTA'`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_vuelo" ADD COLUMN IF NOT EXISTS "tramos" JSONB`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_vuelo" ALTER COLUMN "fechaRetorno" DROP NOT NULL`);

  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "orden_cotizacion_vuelo_prospectoId_idx"
    ON "orden_cotizacion_vuelo"("prospectoId")
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "orden_cotizacion_vuelo_estado_idx"
    ON "orden_cotizacion_vuelo"("estado")
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "orden_cotizacion_vuelo_creadoPorId_idx"
    ON "orden_cotizacion_vuelo"("creadoPorId")
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "orden_cotizacion_vuelo_createdAt_idx"
    ON "orden_cotizacion_vuelo"("createdAt")
  `);
}
