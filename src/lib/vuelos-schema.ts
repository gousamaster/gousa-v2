import { db } from "@/lib/db";

export async function ensureVuelosSchema() {
  await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "orden_cotizacion_vuelo_contador" ("anio" INTEGER NOT NULL PRIMARY KEY,"ultimo" INTEGER NOT NULL DEFAULT 0)`);
  await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "orden_cotizacion_vuelo" ("id" TEXT NOT NULL PRIMARY KEY,"numeroOrden" TEXT NOT NULL UNIQUE,"prospectoId" TEXT REFERENCES "prospecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE,"clienteId" TEXT REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE,"tipoViaje" TEXT NOT NULL DEFAULT 'IDA_VUELTA',"cantidadPax" INTEGER NOT NULL DEFAULT 1,"origen" VARCHAR(3) NOT NULL,"destino" VARCHAR(3) NOT NULL,"fechaIda" TIMESTAMP(3) NOT NULL,"fechaRetorno" TIMESTAMP(3),"tramos" JSONB,"flexibilidad" BOOLEAN NOT NULL DEFAULT false,"equipaje" BOOLEAN NOT NULL DEFAULT false,"observaciones" TEXT,"estado" TEXT NOT NULL DEFAULT 'PENDIENTE',"creadoPorId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"despachadoAt" TIMESTAMP(3),CHECK ("origen" <> "destino"),CHECK ("cantidadPax" >= 1))`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_vuelo" ADD COLUMN IF NOT EXISTS "tipoViaje" TEXT NOT NULL DEFAULT 'IDA_VUELTA'`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_vuelo" ADD COLUMN IF NOT EXISTS "tramos" JSONB`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_vuelo" ADD COLUMN IF NOT EXISTS "clienteId" TEXT`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_vuelo" ADD COLUMN IF NOT EXISTS "cantidadPax" INTEGER NOT NULL DEFAULT 1`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_vuelo" ALTER COLUMN "fechaRetorno" DROP NOT NULL`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_vuelo" ALTER COLUMN "prospectoId" DROP NOT NULL`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_vuelo" DROP CONSTRAINT IF EXISTS "orden_cotizacion_vuelo_estado_check"`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_vuelo" ADD CONSTRAINT "orden_cotizacion_vuelo_estado_check" CHECK ("estado" IN ('PENDIENTE','DESPACHADA','EMITIDA'))`);
  await db.$executeRawUnsafe(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='orden_cotizacion_vuelo_cantidadPax_check') THEN ALTER TABLE "orden_cotizacion_vuelo" ADD CONSTRAINT "orden_cotizacion_vuelo_cantidadPax_check" CHECK ("cantidadPax" >= 1); END IF; END $$;`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_vuelo" ADD COLUMN IF NOT EXISTS "montoVenta" NUMERIC(12,2)`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_vuelo" ADD COLUMN IF NOT EXISTS "monedaVenta" TEXT`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_vuelo" ADD COLUMN IF NOT EXISTS "metodoPago" TEXT`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_vuelo" ADD COLUMN IF NOT EXISTS "fechaEmision" TIMESTAMP(3)`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_vuelo" ADD COLUMN IF NOT EXISTS "observacionPago" TEXT`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_vuelo" ADD COLUMN IF NOT EXISTS "cerradoPorId" TEXT`);
  await db.$executeRawUnsafe(`ALTER TABLE "orden_cotizacion_vuelo" ADD COLUMN IF NOT EXISTS "comisionVenta" NUMERIC(12,2) DEFAULT 0`);
  await db.$executeRawUnsafe(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='orden_cotizacion_vuelo_clienteId_fkey') THEN ALTER TABLE "orden_cotizacion_vuelo" ADD CONSTRAINT "orden_cotizacion_vuelo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;`);
  await db.$executeRawUnsafe(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='orden_cotizacion_vuelo_cerradoPorId_fkey') THEN ALTER TABLE "orden_cotizacion_vuelo" ADD CONSTRAINT "orden_cotizacion_vuelo_cerradoPorId_fkey" FOREIGN KEY ("cerradoPorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "orden_cotizacion_vuelo_prospectoId_idx" ON "orden_cotizacion_vuelo"("prospectoId")`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "orden_cotizacion_vuelo_clienteId_idx" ON "orden_cotizacion_vuelo"("clienteId")`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "orden_cotizacion_vuelo_estado_idx" ON "orden_cotizacion_vuelo"("estado")`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "orden_cotizacion_vuelo_creadoPorId_idx" ON "orden_cotizacion_vuelo"("creadoPorId")`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "orden_cotizacion_vuelo_cerradoPorId_idx" ON "orden_cotizacion_vuelo"("cerradoPorId")`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "orden_cotizacion_vuelo_createdAt_idx" ON "orden_cotizacion_vuelo"("createdAt")`);
}
