import { db } from "@/lib/db";

export async function ensureRentACarSchema() {
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "orden_cotizacion_rentacar_contador" (
      "anio" INTEGER NOT NULL PRIMARY KEY,
      "ultimo" INTEGER NOT NULL DEFAULT 0
    )
  `);

  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "orden_cotizacion_rentacar" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "numeroOrden" TEXT NOT NULL UNIQUE,
      "prospectoId" TEXT REFERENCES "prospecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      "clienteId" TEXT REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      "recogidaIata" TEXT NOT NULL,
      "entregaIata" TEXT NOT NULL,
      "mismaEntrega" BOOLEAN NOT NULL DEFAULT true,
      "fechaRecogida" DATE NOT NULL,
      "horaRecogida" TEXT NOT NULL,
      "fechaEntrega" DATE NOT NULL,
      "horaEntrega" TEXT NOT NULL,
      "tipoVehiculo" TEXT NOT NULL,
      "seguro" TEXT NOT NULL,
      "detalles" TEXT,
      "estado" TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK ("estado" IN ('PENDIENTE','DESPACHADA')),
      "creadoPorId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "despachadoAt" TIMESTAMP(3),
      CHECK (("prospectoId" IS NOT NULL AND "clienteId" IS NULL) OR ("prospectoId" IS NULL AND "clienteId" IS NOT NULL))
    )
  `);

  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "orden_cotizacion_rentacar_estado_idx" ON "orden_cotizacion_rentacar"("estado")`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "orden_cotizacion_rentacar_createdAt_idx" ON "orden_cotizacion_rentacar"("createdAt")`);
}
