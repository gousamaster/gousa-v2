import { db } from "@/lib/db";

export async function ensureRentACarSchema() {
  await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "orden_cotizacion_rentacar_contador" ("anio" INTEGER NOT NULL PRIMARY KEY,"ultimo" INTEGER NOT NULL DEFAULT 0)`);
  await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "orden_cotizacion_rentacar" ("id" TEXT NOT NULL PRIMARY KEY,"numeroOrden" TEXT NOT NULL UNIQUE,"prospectoId" TEXT REFERENCES "prospecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE,"clienteId" TEXT REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE,"recogidaIata" TEXT NOT NULL,"entregaIata" TEXT NOT NULL,"mismaEntrega" BOOLEAN NOT NULL DEFAULT true,"fechaRecogida" DATE NOT NULL,"horaRecogida" TEXT NOT NULL,"fechaEntrega" DATE NOT NULL,"horaEntrega" TEXT NOT NULL,"tipoVehiculo" TEXT NOT NULL,"seguro" TEXT NOT NULL,"detalles" TEXT,"estado" TEXT NOT NULL DEFAULT 'PENDIENTE',"creadoPorId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"despachadoAt" TIMESTAMP(3))`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_rentacar" DROP CONSTRAINT IF EXISTS "orden_cotizacion_rentacar_estado_check"`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_rentacar" ADD CONSTRAINT "orden_cotizacion_rentacar_estado_check" CHECK ("estado" IN ('PENDIENTE','DESPACHADA','EMITIDA'))`);
  for (const sql of [
    `ALTER TABLE "orden_cotizacion_rentacar" ADD COLUMN IF NOT EXISTS "montoVenta" NUMERIC(12,2)`,
    `ALTER TABLE "orden_cotizacion_rentacar" ADD COLUMN IF NOT EXISTS "monedaVenta" TEXT`,
    `ALTER TABLE "orden_cotizacion_rentacar" ADD COLUMN IF NOT EXISTS "metodoPago" TEXT`,
    `ALTER TABLE "orden_cotizacion_rentacar" ADD COLUMN IF NOT EXISTS "fechaEmision" TIMESTAMP(3)`,
    `ALTER TABLE "orden_cotizacion_rentacar" ADD COLUMN IF NOT EXISTS "observacionPago" TEXT`,
    `ALTER TABLE "orden_cotizacion_rentacar" ADD COLUMN IF NOT EXISTS "cerradoPorId" TEXT`,
    `ALTER TABLE "orden_cotizacion_rentacar" ADD COLUMN IF NOT EXISTS "comisionVenta" NUMERIC(12,2) DEFAULT 0`
  ]) await db.$executeRawUnsafe(sql);
  await db.$executeRawUnsafe(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='orden_cotizacion_rentacar_cerradoPorId_fkey') THEN ALTER TABLE "orden_cotizacion_rentacar" ADD CONSTRAINT "orden_cotizacion_rentacar_cerradoPorId_fkey" FOREIGN KEY ("cerradoPorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "orden_cotizacion_rentacar_estado_idx" ON "orden_cotizacion_rentacar"("estado")`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "orden_cotizacion_rentacar_cerradoPorId_idx" ON "orden_cotizacion_rentacar"("cerradoPorId")`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "orden_cotizacion_rentacar_createdAt_idx" ON "orden_cotizacion_rentacar"("createdAt")`);
}
