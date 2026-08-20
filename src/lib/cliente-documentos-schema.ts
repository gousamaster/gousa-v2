import { db } from "@/lib/db";

export const TIPOS_DOCUMENTO_CLIENTE = [
  "PASAPORTE",
  "CEDULA_IDENTIDAD",
  "CONFIRMACION_CITA",
  "FORMULARIO_LLENADO",
  "CONFIRMACION_FORMULARIO",
] as const;

export type TipoDocumentoCliente = (typeof TIPOS_DOCUMENTO_CLIENTE)[number];

let schemaReady = false;
let schemaPromise: Promise<void> | null = null;

export async function ensureClienteDocumentosSchema() {
  if (schemaReady) return;
  if (schemaPromise) return schemaPromise;

  schemaPromise = (async () => {
    // Una sola sentencia evita carreras entre CREATE TABLE/INDEX cuando
    // Vercel atiende varias solicitudes simultáneas al abrir la pestaña.
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "cliente_documento_esencial" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "clienteId" TEXT NOT NULL REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "tipo" TEXT NOT NULL,
        "nombreArchivo" TEXT NOT NULL,
        "mimeType" TEXT NOT NULL,
        "tamanoBytes" INTEGER NOT NULL,
        "contenido" BYTEA NOT NULL,
        "subidoPorId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("clienteId","tipo")
      );
      CREATE INDEX IF NOT EXISTS "cliente_documento_esencial_cliente_idx"
        ON "cliente_documento_esencial"("clienteId");
      CREATE INDEX IF NOT EXISTS "cliente_documento_esencial_tipo_idx"
        ON "cliente_documento_esencial"("tipo");
    `);
    schemaReady = true;
  })();

  try {
    await schemaPromise;
  } finally {
    if (!schemaReady) schemaPromise = null;
  }
}
