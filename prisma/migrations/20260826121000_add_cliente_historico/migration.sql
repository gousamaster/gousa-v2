-- Registro liviano para clientes atendidos antes de la puesta en marcha oficial de NEXUS.
CREATE TABLE IF NOT EXISTS "cliente_historico" (
  "id" TEXT NOT NULL,
  "clienteId" TEXT NOT NULL,
  "servicioTomado" TEXT NOT NULL,
  "servicioOtro" TEXT,
  "fechaAprobacion" TIMESTAMP(3),
  "fechaVencimiento" TIMESTAMP(3),
  "aplicacion" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cliente_historico_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "cliente_historico_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "cliente_historico_clienteId_key" ON "cliente_historico"("clienteId");
CREATE INDEX IF NOT EXISTS "cliente_historico_fechaVencimiento_idx" ON "cliente_historico"("fechaVencimiento");
CREATE INDEX IF NOT EXISTS "cliente_historico_servicioTomado_idx" ON "cliente_historico"("servicioTomado");