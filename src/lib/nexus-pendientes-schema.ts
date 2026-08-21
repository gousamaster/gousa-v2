import { db } from "@/lib/db";

let schemaReady = false;
let schemaPromise: Promise<void> | null = null;

export async function ensureNexusPendientesSchema() {
  if (schemaReady) return;
  if (schemaPromise) return schemaPromise;

  schemaPromise = (async () => {
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "nexus_pendiente" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "titulo" TEXT NOT NULL,
      "detalle" TEXT,
      "categoria" TEXT NOT NULL DEFAULT 'OTRO',
      "fechaObjetivo" TIMESTAMP(3) NOT NULL,
      "prospectoId" TEXT REFERENCES "prospecto"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "clienteId" TEXT REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "asignadoAId" TEXT REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE,
      "creadoPorId" TEXT REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE,
      "completado" BOOLEAN NOT NULL DEFAULT FALSE,
      "completadoAt" TIMESTAMP(3),
      "completadoPorId" TEXT REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "nexus_pendiente_fecha_idx" ON "nexus_pendiente"("fechaObjetivo")`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "nexus_pendiente_completado_idx" ON "nexus_pendiente"("completado")`);
    schemaReady = true;
  })();

  try { await schemaPromise; }
  finally { if (!schemaReady) schemaPromise = null; }
}
