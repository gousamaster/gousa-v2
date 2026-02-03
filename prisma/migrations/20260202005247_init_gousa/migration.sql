-- CreateEnum
CREATE TYPE "TipoCliente" AS ENUM ('ADULTO', 'INFANTE');

-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('PROGRAMADA', 'COMPLETADA', 'CANCELADA', 'REPROGRAMADA');

-- CreateEnum
CREATE TYPE "EstadoComision" AS ENUM ('PENDIENTE', 'APROBADA', 'PAGADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoAprobacion" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "region" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_servicio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "codigo" TEXT NOT NULL,
    "requiereTramite" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogo_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicio_precio_por_region" (
    "id" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicio_precio_por_region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_tipo_cita" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "codigo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogo_tipo_cita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cita_precio_por_region" (
    "id" TEXT NOT NULL,
    "tipoCitaId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cita_precio_por_region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_estado_tramite" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "codigo" TEXT NOT NULL,
    "color" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogo_estado_tramite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_estado_pago" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "codigo" TEXT NOT NULL,
    "color" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogo_estado_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_parentesco" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "codigo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogo_parentesco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_tipo_aprobacion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "codigo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogo_tipo_aprobacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "tipoCliente" "TipoCliente" NOT NULL DEFAULT 'ADULTO',
    "fechaNacimiento" TIMESTAMP(3),
    "lugarNacimiento" TEXT,
    "nacionalidad" TEXT,
    "numeroCi" TEXT,
    "numeroPasaporte" TEXT,
    "email" TEXT,
    "telefonoCelular" TEXT,
    "regionId" TEXT NOT NULL,
    "registradoPorId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente_datos_personales" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "pasaporteFechaEmision" TIMESTAMP(3),
    "pasaporteFechaExpiracion" TIMESTAMP(3),
    "facebook" TEXT,
    "instagram" TEXT,
    "direccionDomicilio" TEXT,
    "estadoCivil" TEXT,
    "profesion" TEXT,
    "nombrePadre" TEXT,
    "fechaNacimientoPadre" TIMESTAMP(3),
    "nombreMadre" TEXT,
    "fechaNacimientoMadre" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cliente_datos_personales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente_datos_laborales" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "lugarTrabajo" TEXT,
    "cargoTrabajo" TEXT,
    "descripcionTrabajo" TEXT,
    "direccionTrabajo" TEXT,
    "telefonoTrabajo" TEXT,
    "fechaContratacion" TIMESTAMP(3),
    "percepcionSalarial" DECIMAL(10,2),
    "nombreTrabajoAnterior" TEXT,
    "telefonoTrabajoAnterior" TEXT,
    "direccionTrabajoAnterior" TEXT,
    "fechaInicioTrabajoAnterior" TIMESTAMP(3),
    "referenciaTrabajoAnterior" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cliente_datos_laborales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente_datos_academicos" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "lugarEstudio" TEXT,
    "carreraEstudio" TEXT,
    "direccionEstudio" TEXT,
    "telefonoEstudio" TEXT,
    "fechaInicioEstudio" TIMESTAMP(3),
    "fechaFinEstudio" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cliente_datos_academicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente_datos_matrimoniales" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "conyugeNombreCompleto" TEXT,
    "conyugeFechaNacimiento" TIMESTAMP(3),
    "conyugeLugarNacimiento" TEXT,
    "matrimonioFechaInicio" TIMESTAMP(3),
    "matrimonioFechaFin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cliente_datos_matrimoniales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente_datos_patrocinador" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombrePatrocinador" TEXT,
    "direccionPatrocinador" TEXT,
    "telefonoPatrocinador" TEXT,
    "emailPatrocinador" TEXT,
    "trabajoPatrocinador" TEXT,
    "fechaInicioTrabajoPatrocinador" TIMESTAMP(3),
    "percepcionSalarialPatrocinador" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cliente_datos_patrocinador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente_servicio" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "precioAcordado" DECIMAL(10,2) NOT NULL,
    "descuentoAplicado" DECIMAL(10,2),
    "precioFinal" DECIMAL(10,2) NOT NULL,
    "estadoPagoId" TEXT NOT NULL,
    "notas" TEXT,
    "aprobacionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cliente_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupo_familiar" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "grupo_familiar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupo_familiar_miembro" (
    "id" TEXT NOT NULL,
    "grupoFamiliarId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "parentescoId" TEXT NOT NULL,
    "esTitular" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grupo_familiar_miembro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tramite" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "clienteServicioId" TEXT NOT NULL,
    "usuarioAsignadoId" TEXT,
    "estadoActualId" TEXT NOT NULL,
    "codigoConfirmacionDs160" TEXT,
    "codigoSeguimientoCourier" TEXT,
    "visaNumero" TEXT,
    "visaFechaEmision" TIMESTAMP(3),
    "visaFechaExpiracion" TIMESTAMP(3),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tramite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tramite_historial" (
    "id" TEXT NOT NULL,
    "tramiteId" TEXT NOT NULL,
    "estadoId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tramite_historial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cita" (
    "id" TEXT NOT NULL,
    "tramiteId" TEXT,
    "grupoFamiliarId" TEXT,
    "tipoCitaId" TEXT NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL,
    "lugar" TEXT,
    "precioAcordado" DECIMAL(10,2) NOT NULL,
    "descuentoAplicado" DECIMAL(10,2),
    "precioFinal" DECIMAL(10,2) NOT NULL,
    "estadoPagoId" TEXT NOT NULL,
    "estado" "EstadoCita" NOT NULL DEFAULT 'PROGRAMADA',
    "notas" TEXT,
    "creadaPorId" TEXT NOT NULL,
    "aprobacionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cita_participante" (
    "id" TEXT NOT NULL,
    "citaId" TEXT NOT NULL,
    "tramiteId" TEXT NOT NULL,
    "asistio" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cita_participante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comision_venta" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "montoComision" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoComision" NOT NULL DEFAULT 'PENDIENTE',
    "fechaPago" TIMESTAMP(3),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comision_venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aprobacion" (
    "id" TEXT NOT NULL,
    "tipoAprobacionId" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "aprobadorId" TEXT,
    "estado" "EstadoAprobacion" NOT NULL DEFAULT 'PENDIENTE',
    "montoOriginal" DECIMAL(10,2) NOT NULL,
    "montoSolicitado" DECIMAL(10,2) NOT NULL,
    "justificacion" TEXT NOT NULL,
    "respuesta" TEXT,
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaRespuesta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aprobacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "region_nombre_key" ON "region"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "region_codigo_key" ON "region"("codigo");

-- CreateIndex
CREATE INDEX "region_activo_idx" ON "region"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_servicio_nombre_key" ON "catalogo_servicio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_servicio_codigo_key" ON "catalogo_servicio"("codigo");

-- CreateIndex
CREATE INDEX "catalogo_servicio_activo_idx" ON "catalogo_servicio"("activo");

-- CreateIndex
CREATE INDEX "catalogo_servicio_orden_idx" ON "catalogo_servicio"("orden");

-- CreateIndex
CREATE INDEX "servicio_precio_por_region_servicioId_idx" ON "servicio_precio_por_region"("servicioId");

-- CreateIndex
CREATE INDEX "servicio_precio_por_region_regionId_idx" ON "servicio_precio_por_region"("regionId");

-- CreateIndex
CREATE INDEX "servicio_precio_por_region_activo_idx" ON "servicio_precio_por_region"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "servicio_precio_por_region_servicioId_regionId_key" ON "servicio_precio_por_region"("servicioId", "regionId");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_tipo_cita_nombre_key" ON "catalogo_tipo_cita"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_tipo_cita_codigo_key" ON "catalogo_tipo_cita"("codigo");

-- CreateIndex
CREATE INDEX "catalogo_tipo_cita_activo_idx" ON "catalogo_tipo_cita"("activo");

-- CreateIndex
CREATE INDEX "catalogo_tipo_cita_orden_idx" ON "catalogo_tipo_cita"("orden");

-- CreateIndex
CREATE INDEX "cita_precio_por_region_tipoCitaId_idx" ON "cita_precio_por_region"("tipoCitaId");

-- CreateIndex
CREATE INDEX "cita_precio_por_region_regionId_idx" ON "cita_precio_por_region"("regionId");

-- CreateIndex
CREATE INDEX "cita_precio_por_region_activo_idx" ON "cita_precio_por_region"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "cita_precio_por_region_tipoCitaId_regionId_key" ON "cita_precio_por_region"("tipoCitaId", "regionId");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_estado_tramite_nombre_key" ON "catalogo_estado_tramite"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_estado_tramite_codigo_key" ON "catalogo_estado_tramite"("codigo");

-- CreateIndex
CREATE INDEX "catalogo_estado_tramite_activo_idx" ON "catalogo_estado_tramite"("activo");

-- CreateIndex
CREATE INDEX "catalogo_estado_tramite_orden_idx" ON "catalogo_estado_tramite"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_estado_pago_nombre_key" ON "catalogo_estado_pago"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_estado_pago_codigo_key" ON "catalogo_estado_pago"("codigo");

-- CreateIndex
CREATE INDEX "catalogo_estado_pago_activo_idx" ON "catalogo_estado_pago"("activo");

-- CreateIndex
CREATE INDEX "catalogo_estado_pago_orden_idx" ON "catalogo_estado_pago"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_parentesco_nombre_key" ON "catalogo_parentesco"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_parentesco_codigo_key" ON "catalogo_parentesco"("codigo");

-- CreateIndex
CREATE INDEX "catalogo_parentesco_activo_idx" ON "catalogo_parentesco"("activo");

-- CreateIndex
CREATE INDEX "catalogo_parentesco_orden_idx" ON "catalogo_parentesco"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_tipo_aprobacion_nombre_key" ON "catalogo_tipo_aprobacion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_tipo_aprobacion_codigo_key" ON "catalogo_tipo_aprobacion"("codigo");

-- CreateIndex
CREATE INDEX "catalogo_tipo_aprobacion_activo_idx" ON "catalogo_tipo_aprobacion"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_numeroCi_key" ON "cliente"("numeroCi");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_numeroPasaporte_key" ON "cliente"("numeroPasaporte");

-- CreateIndex
CREATE INDEX "cliente_regionId_idx" ON "cliente"("regionId");

-- CreateIndex
CREATE INDEX "cliente_registradoPorId_idx" ON "cliente"("registradoPorId");

-- CreateIndex
CREATE INDEX "cliente_tipoCliente_idx" ON "cliente"("tipoCliente");

-- CreateIndex
CREATE INDEX "cliente_activo_idx" ON "cliente"("activo");

-- CreateIndex
CREATE INDEX "cliente_deletedAt_idx" ON "cliente"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_datos_personales_clienteId_key" ON "cliente_datos_personales"("clienteId");

-- CreateIndex
CREATE INDEX "cliente_datos_personales_clienteId_idx" ON "cliente_datos_personales"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_datos_laborales_clienteId_key" ON "cliente_datos_laborales"("clienteId");

-- CreateIndex
CREATE INDEX "cliente_datos_laborales_clienteId_idx" ON "cliente_datos_laborales"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_datos_academicos_clienteId_key" ON "cliente_datos_academicos"("clienteId");

-- CreateIndex
CREATE INDEX "cliente_datos_academicos_clienteId_idx" ON "cliente_datos_academicos"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_datos_matrimoniales_clienteId_key" ON "cliente_datos_matrimoniales"("clienteId");

-- CreateIndex
CREATE INDEX "cliente_datos_matrimoniales_clienteId_idx" ON "cliente_datos_matrimoniales"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_datos_patrocinador_clienteId_key" ON "cliente_datos_patrocinador"("clienteId");

-- CreateIndex
CREATE INDEX "cliente_datos_patrocinador_clienteId_idx" ON "cliente_datos_patrocinador"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_servicio_aprobacionId_key" ON "cliente_servicio"("aprobacionId");

-- CreateIndex
CREATE INDEX "cliente_servicio_clienteId_idx" ON "cliente_servicio"("clienteId");

-- CreateIndex
CREATE INDEX "cliente_servicio_servicioId_idx" ON "cliente_servicio"("servicioId");

-- CreateIndex
CREATE INDEX "cliente_servicio_estadoPagoId_idx" ON "cliente_servicio"("estadoPagoId");

-- CreateIndex
CREATE INDEX "cliente_servicio_deletedAt_idx" ON "cliente_servicio"("deletedAt");

-- CreateIndex
CREATE INDEX "grupo_familiar_activo_idx" ON "grupo_familiar"("activo");

-- CreateIndex
CREATE INDEX "grupo_familiar_deletedAt_idx" ON "grupo_familiar"("deletedAt");

-- CreateIndex
CREATE INDEX "grupo_familiar_miembro_grupoFamiliarId_idx" ON "grupo_familiar_miembro"("grupoFamiliarId");

-- CreateIndex
CREATE INDEX "grupo_familiar_miembro_clienteId_idx" ON "grupo_familiar_miembro"("clienteId");

-- CreateIndex
CREATE INDEX "grupo_familiar_miembro_parentescoId_idx" ON "grupo_familiar_miembro"("parentescoId");

-- CreateIndex
CREATE UNIQUE INDEX "grupo_familiar_miembro_grupoFamiliarId_clienteId_key" ON "grupo_familiar_miembro"("grupoFamiliarId", "clienteId");

-- CreateIndex
CREATE INDEX "tramite_clienteId_idx" ON "tramite"("clienteId");

-- CreateIndex
CREATE INDEX "tramite_clienteServicioId_idx" ON "tramite"("clienteServicioId");

-- CreateIndex
CREATE INDEX "tramite_usuarioAsignadoId_idx" ON "tramite"("usuarioAsignadoId");

-- CreateIndex
CREATE INDEX "tramite_estadoActualId_idx" ON "tramite"("estadoActualId");

-- CreateIndex
CREATE INDEX "tramite_deletedAt_idx" ON "tramite"("deletedAt");

-- CreateIndex
CREATE INDEX "tramite_historial_tramiteId_idx" ON "tramite_historial"("tramiteId");

-- CreateIndex
CREATE INDEX "tramite_historial_estadoId_idx" ON "tramite_historial"("estadoId");

-- CreateIndex
CREATE INDEX "tramite_historial_usuarioId_idx" ON "tramite_historial"("usuarioId");

-- CreateIndex
CREATE INDEX "tramite_historial_createdAt_idx" ON "tramite_historial"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "cita_aprobacionId_key" ON "cita"("aprobacionId");

-- CreateIndex
CREATE INDEX "cita_tramiteId_idx" ON "cita"("tramiteId");

-- CreateIndex
CREATE INDEX "cita_grupoFamiliarId_idx" ON "cita"("grupoFamiliarId");

-- CreateIndex
CREATE INDEX "cita_tipoCitaId_idx" ON "cita"("tipoCitaId");

-- CreateIndex
CREATE INDEX "cita_estadoPagoId_idx" ON "cita"("estadoPagoId");

-- CreateIndex
CREATE INDEX "cita_estado_idx" ON "cita"("estado");

-- CreateIndex
CREATE INDEX "cita_creadaPorId_idx" ON "cita"("creadaPorId");

-- CreateIndex
CREATE INDEX "cita_fechaHora_idx" ON "cita"("fechaHora");

-- CreateIndex
CREATE INDEX "cita_deletedAt_idx" ON "cita"("deletedAt");

-- CreateIndex
CREATE INDEX "cita_participante_citaId_idx" ON "cita_participante"("citaId");

-- CreateIndex
CREATE INDEX "cita_participante_tramiteId_idx" ON "cita_participante"("tramiteId");

-- CreateIndex
CREATE UNIQUE INDEX "cita_participante_citaId_tramiteId_key" ON "cita_participante"("citaId", "tramiteId");

-- CreateIndex
CREATE INDEX "comision_venta_clienteId_idx" ON "comision_venta"("clienteId");

-- CreateIndex
CREATE INDEX "comision_venta_usuarioId_idx" ON "comision_venta"("usuarioId");

-- CreateIndex
CREATE INDEX "comision_venta_estado_idx" ON "comision_venta"("estado");

-- CreateIndex
CREATE INDEX "comision_venta_fechaPago_idx" ON "comision_venta"("fechaPago");

-- CreateIndex
CREATE INDEX "aprobacion_tipoAprobacionId_idx" ON "aprobacion"("tipoAprobacionId");

-- CreateIndex
CREATE INDEX "aprobacion_solicitanteId_idx" ON "aprobacion"("solicitanteId");

-- CreateIndex
CREATE INDEX "aprobacion_aprobadorId_idx" ON "aprobacion"("aprobadorId");

-- CreateIndex
CREATE INDEX "aprobacion_estado_idx" ON "aprobacion"("estado");

-- CreateIndex
CREATE INDEX "aprobacion_fechaSolicitud_idx" ON "aprobacion"("fechaSolicitud");

-- AddForeignKey
ALTER TABLE "servicio_precio_por_region" ADD CONSTRAINT "servicio_precio_por_region_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "catalogo_servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicio_precio_por_region" ADD CONSTRAINT "servicio_precio_por_region_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita_precio_por_region" ADD CONSTRAINT "cita_precio_por_region_tipoCitaId_fkey" FOREIGN KEY ("tipoCitaId") REFERENCES "catalogo_tipo_cita"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita_precio_por_region" ADD CONSTRAINT "cita_precio_por_region_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_datos_personales" ADD CONSTRAINT "cliente_datos_personales_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_datos_laborales" ADD CONSTRAINT "cliente_datos_laborales_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_datos_academicos" ADD CONSTRAINT "cliente_datos_academicos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_datos_matrimoniales" ADD CONSTRAINT "cliente_datos_matrimoniales_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_datos_patrocinador" ADD CONSTRAINT "cliente_datos_patrocinador_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_servicio" ADD CONSTRAINT "cliente_servicio_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_servicio" ADD CONSTRAINT "cliente_servicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "catalogo_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_servicio" ADD CONSTRAINT "cliente_servicio_estadoPagoId_fkey" FOREIGN KEY ("estadoPagoId") REFERENCES "catalogo_estado_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_servicio" ADD CONSTRAINT "cliente_servicio_aprobacionId_fkey" FOREIGN KEY ("aprobacionId") REFERENCES "aprobacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo_familiar_miembro" ADD CONSTRAINT "grupo_familiar_miembro_grupoFamiliarId_fkey" FOREIGN KEY ("grupoFamiliarId") REFERENCES "grupo_familiar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo_familiar_miembro" ADD CONSTRAINT "grupo_familiar_miembro_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo_familiar_miembro" ADD CONSTRAINT "grupo_familiar_miembro_parentescoId_fkey" FOREIGN KEY ("parentescoId") REFERENCES "catalogo_parentesco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramite" ADD CONSTRAINT "tramite_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramite" ADD CONSTRAINT "tramite_clienteServicioId_fkey" FOREIGN KEY ("clienteServicioId") REFERENCES "cliente_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramite" ADD CONSTRAINT "tramite_usuarioAsignadoId_fkey" FOREIGN KEY ("usuarioAsignadoId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramite" ADD CONSTRAINT "tramite_estadoActualId_fkey" FOREIGN KEY ("estadoActualId") REFERENCES "catalogo_estado_tramite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramite_historial" ADD CONSTRAINT "tramite_historial_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramite_historial" ADD CONSTRAINT "tramite_historial_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "catalogo_estado_tramite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramite_historial" ADD CONSTRAINT "tramite_historial_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita" ADD CONSTRAINT "cita_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita" ADD CONSTRAINT "cita_grupoFamiliarId_fkey" FOREIGN KEY ("grupoFamiliarId") REFERENCES "grupo_familiar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita" ADD CONSTRAINT "cita_tipoCitaId_fkey" FOREIGN KEY ("tipoCitaId") REFERENCES "catalogo_tipo_cita"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita" ADD CONSTRAINT "cita_estadoPagoId_fkey" FOREIGN KEY ("estadoPagoId") REFERENCES "catalogo_estado_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita" ADD CONSTRAINT "cita_creadaPorId_fkey" FOREIGN KEY ("creadaPorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita" ADD CONSTRAINT "cita_aprobacionId_fkey" FOREIGN KEY ("aprobacionId") REFERENCES "aprobacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita_participante" ADD CONSTRAINT "cita_participante_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "cita"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita_participante" ADD CONSTRAINT "cita_participante_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comision_venta" ADD CONSTRAINT "comision_venta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comision_venta" ADD CONSTRAINT "comision_venta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aprobacion" ADD CONSTRAINT "aprobacion_tipoAprobacionId_fkey" FOREIGN KEY ("tipoAprobacionId") REFERENCES "catalogo_tipo_aprobacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aprobacion" ADD CONSTRAINT "aprobacion_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aprobacion" ADD CONSTRAINT "aprobacion_aprobadorId_fkey" FOREIGN KEY ("aprobadorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
