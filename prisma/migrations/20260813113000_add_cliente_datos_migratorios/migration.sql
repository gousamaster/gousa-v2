-- CreateTable
CREATE TABLE "cliente_datos_migratorios" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,

    -- Visa estadounidense previa
    "tuvoVisaUsaAntes" BOOLEAN,
    "tipoVisaUsaAnterior" TEXT,
    "numeroVisaAnterior" TEXT,
    "fechaEmisionVisaUsa" TIMESTAMP(3),
    "fechaVencimientoVisaUsa" TIMESTAMP(3),
    "visaRevocadaCancelada" BOOLEAN,
    "detalleRevocacionCancelacion" TEXT,

    -- Viajes previos a Estados Unidos
    "viajoUsaAntes" BOOLEAN,
    "cantidadViajesUsa" INTEGER,
    "ultimoIngresoUsa" TIMESTAMP(3),
    "ultimaSalidaUsa" TIMESTAMP(3),
    "duracionUltimaEstadiaDias" INTEGER,
    "cumplioSiempreTiempoAutorizado" BOOLEAN,

    -- Sobreestadía / trabajo no autorizado
    "tuvoSobreestadia" BOOLEAN,
    "diasSobreestadia" INTEGER,
    "detalleSobreestadia" TEXT,
    "trabajoNoAutorizadoUsa" BOOLEAN,
    "detalleTrabajoNoAutorizado" TEXT,

    -- Rechazos de visa
    "tuvoRechazoVisaUsa" BOOLEAN,
    "cantidadRechazosVisaUsa" INTEGER,
    "fechaUltimoRechazoVisa" TIMESTAMP(3),
    "tipoVisaUltimoRechazo" TEXT,
    "motivoRechazoConocido" TEXT,

    -- Frontera / CBP / ingreso
    "tuvoEntradaRechazadaUsa" BOOLEAN,
    "fechaEntradaRechazada" TIMESTAMP(3),
    "detalleEntradaRechazada" TEXT,
    "tuvoProblemaCbP" BOOLEAN,
    "detalleProblemaCbP" TEXT,

    -- Deportación / remoción
    "tuvoDeportacionRemocion" BOOLEAN,
    "fechaDeportacionRemocion" TIMESTAMP(3),
    "detalleDeportacionRemocion" TEXT,

    -- Peticiones o procesos migratorios
    "tuvoPeticionMigratoriaUsa" BOOLEAN,
    "tipoPeticionMigratoria" TEXT,
    "estadoPeticionMigratoria" TEXT,
    "detallePeticionMigratoria" TEXT,
    "solicitoResidenciaUsa" BOOLEAN,
    "solicitoAsiloUsa" BOOLEAN,
    "solicitoCambioEstatusUsa" BOOLEAN,

    -- Otros antecedentes
    "tuvoOtroAntecedenteMigratorio" BOOLEAN,
    "detalleOtroAntecedenteMigratorio" TEXT,
    "observacionesMigratorias" TEXT,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cliente_datos_migratorios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cliente_datos_migratorios_clienteId_key"
ON "cliente_datos_migratorios"("clienteId");

-- CreateIndex
CREATE INDEX "cliente_datos_migratorios_clienteId_idx"
ON "cliente_datos_migratorios"("clienteId");

-- AddForeignKey
ALTER TABLE "cliente_datos_migratorios"
ADD CONSTRAINT "cliente_datos_migratorios_clienteId_fkey"
FOREIGN KEY ("clienteId")
REFERENCES "cliente"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
