-- CreateTable
CREATE TABLE "cliente_datos_viaje" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "motivo" TEXT,
    "lugar" TEXT,
    "fechaTentativa" TIMESTAMP(3),
    "tiempoEstadia" TEXT,
    "contactoDestino" TEXT,
    "direccionContacto" TEXT,
    "telefonoContacto" TEXT,
    "paisesVisitados" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cliente_datos_viaje_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cliente_datos_viaje_clienteId_key" ON "cliente_datos_viaje"("clienteId");

-- CreateIndex
CREATE INDEX "cliente_datos_viaje_clienteId_idx" ON "cliente_datos_viaje"("clienteId");

-- AddForeignKey
ALTER TABLE "cliente_datos_viaje" ADD CONSTRAINT "cliente_datos_viaje_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
