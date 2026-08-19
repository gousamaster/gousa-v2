import { db } from "@/lib/db";

export async function ensureAtraccionesSchema() {
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "orden_cotizacion_atracciones_contador" (
      "anio" INTEGER NOT NULL PRIMARY KEY,
      "ultimo" INTEGER NOT NULL DEFAULT 0
    )
  `);

  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "orden_cotizacion_atracciones" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "numeroOrden" TEXT NOT NULL UNIQUE,
      "prospectoId" TEXT REFERENCES "prospecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      "clienteId" TEXT REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      "destino" TEXT NOT NULL,
      "tipoAtraccion" TEXT NOT NULL,
      "especificacion" TEXT NOT NULL,
      "fechaInicio" DATE NOT NULL,
      "dias" INTEGER NOT NULL DEFAULT 1,
      "adultos" INTEGER NOT NULL DEFAULT 1,
      "menores9" INTEGER NOT NULL DEFAULT 0,
      "upgrade" BOOLEAN NOT NULL DEFAULT false,
      "upgradeDetalle" TEXT,
      "detalles" TEXT,
      "estado" TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK ("estado" IN ('PENDIENTE','DESPACHADA')),
      "creadoPorId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "despachadoAt" TIMESTAMP(3),
      CHECK (("prospectoId" IS NOT NULL AND "clienteId" IS NULL) OR ("prospectoId" IS NULL AND "clienteId" IS NOT NULL)),
      CHECK ("dias" BETWEEN 1 AND 30),
      CHECK ("adultos" >= 1),
      CHECK ("menores9" >= 0)
    )
  `);

  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "orden_cotizacion_atracciones_estado_idx" ON "orden_cotizacion_atracciones"("estado")`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "orden_cotizacion_atracciones_createdAt_idx" ON "orden_cotizacion_atracciones"("createdAt")`);
}
