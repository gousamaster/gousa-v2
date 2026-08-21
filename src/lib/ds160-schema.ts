import { db } from "@/lib/db";

export const ESTADOS_DS160 = ["INICIADO", "EN_PROCESO", "PARA_CERRAR", "CERRADO"] as const;
export type EstadoDs160 = (typeof ESTADOS_DS160)[number];

let ready = false;
let promise: Promise<void> | null = null;

export async function ensureDs160Schema() {
  if (ready) return;
  if (promise) return promise;
  promise = (async () => {
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "tramite_ds160" (
      "tramiteId" TEXT NOT NULL PRIMARY KEY REFERENCES "tramite"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "applicationId" TEXT,
      "respuestaSeguridad" TEXT,
      "estado" TEXT NOT NULL DEFAULT 'INICIADO',
      "actualizadoPorId" TEXT REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "tramite_ds160_evidencia" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "tramiteId" TEXT NOT NULL REFERENCES "tramite"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "estado" TEXT NOT NULL,
      "nombreArchivo" TEXT NOT NULL,
      "mimeType" TEXT NOT NULL,
      "tamanoBytes" INTEGER NOT NULL,
      "contenido" BYTEA NOT NULL,
      "subidoPorId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "tramite_ds160_evidencia_tramite_idx" ON "tramite_ds160_evidencia"("tramiteId","createdAt")`);
    ready = true;
  })();
  try { await promise; } finally { if (!ready) promise = null; }
}
