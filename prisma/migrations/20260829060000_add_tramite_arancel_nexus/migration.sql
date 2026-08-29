CREATE TABLE IF NOT EXISTS "tramite_arancel_nexus" (
  "id" TEXT PRIMARY KEY,
  "tramiteId" TEXT NOT NULL UNIQUE REFERENCES "tramite"("id") ON DELETE CASCADE,
  "clienteId" TEXT NOT NULL REFERENCES "cliente"("id") ON DELETE CASCADE,
  "fechaEnvio" TIMESTAMP(3) NOT NULL,
  "venceAt" TIMESTAMP(3) NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
  "observacion" TEXT,
  "ultimoUsuarioId" TEXT REFERENCES "user"("id") ON DELETE SET NULL,
  "pagoConfirmadoAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "tramite_arancel_nexus_vence_idx"
  ON "tramite_arancel_nexus"("venceAt");
