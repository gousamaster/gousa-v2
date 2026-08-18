-- CreateTable
CREATE TABLE "prospecto" (
    "id" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "ciudad" TEXT,
    "pais" TEXT DEFAULT 'Bolivia',
    "origen" TEXT,
    "interes" TEXT,
    "observaciones" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'NUEVO',
    "scorePreliminar" INTEGER,
    "convertido" BOOLEAN NOT NULL DEFAULT false,
    "clienteId" TEXT,
    "creadoPorId" TEXT,
    "convertidoPorId" TEXT,
    "convertidoAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "prospecto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prospecto_clienteId_key"
ON "prospecto"("clienteId");

-- CreateIndex
CREATE INDEX "prospecto_telefono_idx"
ON "prospecto"("telefono");

-- CreateIndex
CREATE INDEX "prospecto_email_idx"
ON "prospecto"("email");

-- CreateIndex
CREATE INDEX "prospecto_estado_idx"
ON "prospecto"("estado");

-- CreateIndex
CREATE INDEX "prospecto_convertido_idx"
ON "prospecto"("convertido");

-- CreateIndex
CREATE INDEX "prospecto_deletedAt_idx"
ON "prospecto"("deletedAt");

-- AddForeignKey
ALTER TABLE "prospecto"
ADD CONSTRAINT "prospecto_clienteId_fkey"
FOREIGN KEY ("clienteId")
REFERENCES "cliente"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prospecto"
ADD CONSTRAINT "prospecto_creadoPorId_fkey"
FOREIGN KEY ("creadoPorId")
REFERENCES "user"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prospecto"
ADD CONSTRAINT "prospecto_convertidoPorId_fkey"
FOREIGN KEY ("convertidoPorId")
REFERENCES "user"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
