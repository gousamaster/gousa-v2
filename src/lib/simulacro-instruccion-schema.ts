import { db } from "@/lib/db";

let schemaReady = false;
let schemaPromise: Promise<void> | null = null;

export async function ensureSimulacroInstruccionSchema() {
  if (schemaReady) return;
  if (schemaPromise) return schemaPromise;

  schemaPromise = (async () => {
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "simulacro_instruccion" (
      "citaId" TEXT NOT NULL PRIMARY KEY REFERENCES "cita"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "enviada" BOOLEAN NOT NULL DEFAULT FALSE,
      "marcadaPorId" TEXT REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE,
      "marcadaAt" TIMESTAMP(3),
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
