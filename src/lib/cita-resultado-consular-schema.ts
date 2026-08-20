import { db } from "@/lib/db";

export const RESULTADOS_CONSULARES = ["APROBADA", "NEGADA", "REPROGRAMADA"] as const;
export type ResultadoConsular = (typeof RESULTADOS_CONSULARES)[number];

let schemaReady = false;
let schemaPromise: Promise<void> | null = null;

export async function ensureCitaResultadoConsularSchema() {
  if (schemaReady) return;
  if (schemaPromise) return schemaPromise;

  schemaPromise = (async () => {
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "cita_resultado_consular" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "citaId" TEXT NOT NULL UNIQUE REFERENCES "cita"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "resultado" TEXT NOT NULL,
      "observaciones" TEXT,
      "registradoPorId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      "registradoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    schemaReady = true;
  })();

  try {
    await schemaPromise;
  } finally {
    if (!schemaReady) schemaPromise = null;
  }
}
