import { db } from "@/lib/db";

export async function ensureHospedajeSchema() {
  await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "orden_cotizacion_hospedaje_contador" ("anio" INTEGER NOT NULL PRIMARY KEY,"ultimo" INTEGER NOT NULL DEFAULT 0)`);
  await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "orden_cotizacion_hospedaje" ("id" TEXT NOT NULL PRIMARY KEY,"numeroOrden" TEXT NOT NULL UNIQUE,"prospectoId" TEXT REFERENCES "prospecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE,"clienteId" TEXT REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE,"destinoCiudad" TEXT NOT NULL,"destinoPais" TEXT NOT NULL,"checkIn" TIMESTAMP(3) NOT NULL,"checkOut" TIMESTAMP(3) NOT NULL,"habitaciones" INTEGER NOT NULL DEFAULT 1,"personas" INTEGER NOT NULL DEFAULT 1,"menores9" INTEGER NOT NULL DEFAULT 0,"distribucionHabitaciones" JSONB,"observaciones" TEXT,"estado" TEXT NOT NULL DEFAULT 'PENDIENTE',"creadoPorId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"despachadoAt" TIMESTAMP(3))`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_hospedaje" ADD COLUMN IF NOT EXISTS "personas" INTEGER NOT NULL DEFAULT 1`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_hospedaje" ADD COLUMN IF NOT EXISTS "menores9" INTEGER NOT NULL DEFAULT 0`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_hospedaje" ADD COLUMN IF NOT EXISTS "distribucionHabitaciones" JSONB`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_hospedaje" DROP CONSTRAINT IF EXISTS "orden_cotizacion_hospedaje_estado_check"`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_hospedaje" ADD CONSTRAINT "orden_cotizacion_hospedaje_estado_check" CHECK ("estado" IN ('PENDIENTE','DESPACHADA','EMITIDA'))`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_hospedaje" ADD COLUMN IF NOT EXISTS "montoVenta" NUMERIC(12,2)`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_hospedaje" ADD COLUMN IF NOT EXISTS "monedaVenta" TEXT`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_hospedaje" ADD COLUMN IF NOT EXISTS "metodoPago" TEXT`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_hospedaje" ADD COLUMN IF NOT EXISTS "fechaEmision" TIMESTAMP(3)`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_hospedaje" ADD COLUMN IF NOT EXISTS "observacionPago" TEXT`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "orden_cotizacion_hospedaje_estado_idx" ON "orden_cotizacion_hospedaje"("estado")`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "orden_cotizacion_hospedaje_createdAt_idx" ON "orden_cotizacion_hospedaje"("createdAt")`);
}
