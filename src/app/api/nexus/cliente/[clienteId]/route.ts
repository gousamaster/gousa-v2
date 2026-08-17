"use server";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { NexusResponse } from "@/types/nexus";
import { evaluateNexusScore } from "@/server/nexus/rule-engine";

// Read-only API: GET /api/nexus/cliente/[clienteId]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ clienteId: string }> }
) {
  const { clienteId } = await params;

  // Fetch cliente base + datos necesarios para NEXUS
  const cliente = await db.cliente.findUnique({
    where: { id: clienteId },
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      tipoCliente: true,
      fechaNacimiento: true,

      datosPersonales: {
        select: {
          estadoCivil: true,
          profesion: true,
        },
      },

      datosLaborales: {
        select: {
          lugarTrabajo: true,
          cargoTrabajo: true,
          descripcionTrabajo: true,
          fechaContratacion: true,
          percepcionSalarial: true,
        },
      },

      datosAcademicos: {
        select: {
          lugarEstudio: true,
          carreraEstudio: true,
        },
      },

      datosMatrimoniales: {
        select: {
          conyugeNombreCompleto: true,
        },
      },

      datosPatrocinador: {
        select: {
          nombrePatrocinador: true,
          trabajoPatrocinador: true,
          percepcionSalarialPatrocinador: true,
        },
      },

      datosViaje: true,
      
      datosMigratorios: true,
      
      gruposFamiliares: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!cliente) {
    return NextResponse.json(
      { error: "Cliente not found" },
      { status: 404 }
    );
  }

  // Fetch tramites relacionados (no eliminado)
  const tramites = await db.tramite.findMany({
    where: {
      clienteId,
      deletedAt: null,
    },
    include: {
      estadoActual: {
        select: {
          id: true,
          nombre: true,
          codigo: true,
          orden: true,
        },
      },
      usuarioAsignado: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Provisional: seleccionar tramite por updatedAt DESC
  const tramiteSeleccionado =
  tramites.length > 0
    ? [...tramites].sort((a, b) => {
        const ordenA = a.estadoActual?.orden ?? 0;
        const ordenB = b.estadoActual?.orden ?? 0;

        if (ordenA !== ordenB) {
          return ordenB - ordenA;
        }

        return (
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
        );
      })[0]
    : null;

  // Servicios del cliente
  const servicios =
    await db.clienteServicio.findMany({
      where: {
        clienteId,
        deletedAt: null,
      },
      include: {
        estadoPago: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

 // Citas próximas
const now = new Date();

const citas = tramiteSeleccionado
  ? await db.cita.findMany({
      where: {
        tramiteId: tramiteSeleccionado.id,
        fechaHora: {
          gt: now,
        },
        deletedAt: null,
      },
      include: {
        tipoCita: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
      },
      orderBy: {
        fechaHora: "asc",
      },
    })
  : [];

  // Identificar próxima entrevista y simulacro
  let proximaEntrevista = null;
  let simulacro = null;

  for (const c of citas) {
    const codigo =
      c.tipoCita?.codigo ??
      c.tipoCita?.nombre ??
      null;

    if (
      !proximaEntrevista &&
      codigo &&
      /ENTREVISTA/i.test(codigo)
    ) {
      proximaEntrevista = c;
    }

    if (
      !simulacro &&
      codigo &&
      /(SIMULACRO|CAPACITACION)/i.test(codigo)
    ) {
      simulacro = c;
    }
  }

  // Historial del trámite
  let historial = [];

  if (tramiteSeleccionado) {
    historial =
      await db.tramiteHistorial.findMany({
        where: {
          tramiteId:
            tramiteSeleccionado.id,
        },
       include: {
  usuario: {
    select: {
      id: true,
      name: true,
    },
  },
  estado: {
    select: {
      id: true,
      nombre: true,
    },
  },
},
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
      });
  }

  // ============================================
  // GO USA NEXUS — RULE ENGINE V1
  // ============================================

  const salario =
    cliente.datosLaborales
      ?.percepcionSalarial != null
      ? Number(
          cliente.datosLaborales
            .percepcionSalarial
            .toString()
        )
      : null;

  const salarioPatrocinador =
    cliente.datosPatrocinador
      ?.percepcionSalarialPatrocinador != null
      ? Number(
          cliente.datosPatrocinador
            .percepcionSalarialPatrocinador
            .toString()
        )
      : null;

  const nexusScore =
    evaluateNexusScore({
      laboral: cliente.datosLaborales
        ? {
            lugarTrabajo:
              cliente.datosLaborales
                .lugarTrabajo,
            cargoTrabajo:
              cliente.datosLaborales
                .cargoTrabajo,
            descripcionTrabajo:
              cliente.datosLaborales
                .descripcionTrabajo,
            fechaContratacion:
              cliente.datosLaborales
                .fechaContratacion,
            percepcionSalarial: salario,
          }
        : null,

      academico: cliente.datosAcademicos
        ? {
            lugarEstudio:
              cliente.datosAcademicos
                .lugarEstudio,
            carreraEstudio:
              cliente.datosAcademicos
                .carreraEstudio,
          }
        : null,

      matrimonial:
        cliente.datosMatrimoniales
          ? {
              conyugeNombreCompleto:
                cliente
                  .datosMatrimoniales
                  .conyugeNombreCompleto,
            }
          : null,

      patrocinador:
        cliente.datosPatrocinador
          ? {
              nombrePatrocinador:
                cliente
                  .datosPatrocinador
                  .nombrePatrocinador,
              trabajoPatrocinador:
                cliente
                  .datosPatrocinador
                  .trabajoPatrocinador,
              percepcionSalarialPatrocinador:
                salarioPatrocinador,
            }
          : null,

      viaje: cliente.datosViaje
  ? {
      motivo:
        cliente.datosViaje.motivo,
      lugar:
        cliente.datosViaje.lugar,
      fechaTentativa:
        cliente.datosViaje
          .fechaTentativa,
      tiempoEstadia:
        cliente.datosViaje
          .tiempoEstadia,
      paisesVisitados:
        cliente.datosViaje
          .paisesVisitados,
    }
  : null,
           migratorio: cliente.datosMigratorios
        ? {
            tuvoVisaUsaAntes:
              cliente.datosMigratorios.tuvoVisaUsaAntes,

            tipoVisaUsaAnterior:
              cliente.datosMigratorios.tipoVisaUsaAnterior,

            viajoUsaAntes:
              cliente.datosMigratorios.viajoUsaAntes,

            cantidadViajesUsa:
              cliente.datosMigratorios.cantidadViajesUsa,

            cumplioSiempreTiempoAutorizado:
              cliente.datosMigratorios
                .cumplioSiempreTiempoAutorizado,

            tuvoSobreestadia:
              cliente.datosMigratorios.tuvoSobreestadia,

            diasSobreestadia:
              cliente.datosMigratorios.diasSobreestadia,

            trabajoNoAutorizadoUsa:
              cliente.datosMigratorios
                .trabajoNoAutorizadoUsa,

            tuvoRechazoVisaUsa:
              cliente.datosMigratorios
                .tuvoRechazoVisaUsa,

            cantidadRechazosVisaUsa:
              cliente.datosMigratorios
                .cantidadRechazosVisaUsa,

            tuvoEntradaRechazadaUsa:
              cliente.datosMigratorios
                .tuvoEntradaRechazadaUsa,

            tuvoProblemaCbP:
              cliente.datosMigratorios.tuvoProblemaCbP,

            tuvoDeportacionRemocion:
              cliente.datosMigratorios
                .tuvoDeportacionRemocion,

            tuvoPeticionMigratoriaUsa:
              cliente.datosMigratorios
                .tuvoPeticionMigratoriaUsa,

            solicitoResidenciaUsa:
              cliente.datosMigratorios
                .solicitoResidenciaUsa,

            solicitoAsiloUsa:
              cliente.datosMigratorios.solicitoAsiloUsa,

            solicitoCambioEstatusUsa:
              cliente.datosMigratorios
                .solicitoCambioEstatusUsa,

            tuvoOtroAntecedenteMigratorio:
              cliente.datosMigratorios
                .tuvoOtroAntecedenteMigratorio,
          }
        : null,
      grupoFamiliarCount:
        cliente.gruposFamiliares.length,
    });

  const response: NexusResponse = {
    meta: {
      clienteId,
      generadoEn:
        new Date().toISOString(),
      versionNexus: "1.0",
    },

    cliente: {
      id: cliente.id,
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      nombreCompleto:
        `${cliente.nombres} ${cliente.apellidos}`,
      tipoCliente:
        cliente.tipoCliente,
    },

    asesor: {
      id:
        tramiteSeleccionado
          ?.usuarioAsignado?.id ??
        null,
      nombre:
        tramiteSeleccionado
          ?.usuarioAsignado?.name ??
        null,
    },

    tramite: {
  id:
    tramiteSeleccionado?.id ??
    null,
  estado:
    tramiteSeleccionado
      ?.estadoActual?.nombre ??
    null,
  codigoConfirmacionDs160:
    tramiteSeleccionado
      ?.codigoConfirmacionDs160 ??
    null,
      estadoDs160: null,
      estadoDs160_provisional: false,
    },

    viaje: {
      motivo:
        cliente.datosViaje?.motivo ??
        null,
      destino:
        cliente.datosViaje?.lugar ??
        null,
      fechaTentativa:
        cliente.datosViaje
          ?.fechaTentativa
          ?.toISOString() ??
        null,
      tiempoEstadia:
        cliente.datosViaje
          ?.tiempoEstadia ??
        null,
    },

    score: {
      // El total seguirá null mientras
      // la cobertura ponderada sea < 60%.
      total: nexusScore.total,

      motores: {
        ARRAIGO:
          nexusScore.motores
            .ARRAIGO.score,

        CREDIBILIDAD_COHERENCIA: {
  score:
    nexusScore.motores
      .CREDIBILIDAD_COHERENCIA
      .score,

  coverage:
    nexusScore.motores
      .CREDIBILIDAD_COHERENCIA
      .coverage,

  strengths:
    nexusScore.motores
      .CREDIBILIDAD_COHERENCIA
      .strengths,

  observations:
    nexusScore.motores
      .CREDIBILIDAD_COHERENCIA
      .observations,

  missingData:
    nexusScore.motores
      .CREDIBILIDAD_COHERENCIA
      .missingData,
},
        MOTIVO_VIAJE:
          nexusScore.motores
            .MOTIVO_VIAJE.score,

        PERFIL_LABORAL_ECONOMICO:
          nexusScore.motores
            .PERFIL_LABORAL_ECONOMICO
            .score,

        ENTORNO_FAMILIAR_RIESGO_MIGRATORIO:
          nexusScore.motores
            .ENTORNO_FAMILIAR_RIESGO_MIGRATORIO
            .score,

        HISTORIAL_MIGRATORIO:
          nexusScore.motores
            .HISTORIAL_MIGRATORIO
            .score,
      },
    },

    citas: {
      proximaEntrevista:
        proximaEntrevista
          ? {
              id:
                proximaEntrevista.id,
              fechaHora:
                proximaEntrevista
                  .fechaHora
                  .toISOString(),
              tipo:
                proximaEntrevista
                  .tipoCita?.nombre ??
                null,
              lugar:
                proximaEntrevista
                  .lugar ??
                null,
              estado:
                proximaEntrevista
                  .estado ??
                null,
            }
          : null,

      simulacro: simulacro
        ? {
            id: simulacro.id,
            fechaHora:
              simulacro.fechaHora
                .toISOString(),
            tipo:
              simulacro
                .tipoCita?.nombre ??
              null,
            lugar:
              simulacro.lugar ??
              null,
            estado:
              simulacro.estado ??
              null,
          }
        : null,
    },

    pago: {
      services: servicios.map(
        (s) => ({
          id: s.id,
          servicioId:
            s.servicioId,
          precioAcordado:
            s.precioAcordado
              .toString(),
          descuentoAplicado:
            s.descuentoAplicado
              ?.toString() ??
            null,
          precioFinal:
            s.precioFinal
              .toString(),
          estadoPago:
            s.estadoPago?.nombre ??
            null,
        })
      ),

      aggregatedEstado:
        servicios.length === 1
          ? servicios[0]
              .estadoPago?.nombre ??
            null
          : null,

      aggregatedNota:
        servicios.length > 1
          ? "MULTIPLES_SERVICIOS_NO_AGREGADOS"
          : null,
    },

    actividadPendiente: null,

    documentos: [],

    historial: historial.map(
      (h) => ({
        id: h.id,
        fechaHora:
          h.createdAt.toISOString(),
        usuario: h.usuario
          ? {
              id: h.usuario.id,
              nombre:
                h.usuario.name,
            }
          : null,
        estado:
          h.estado?.nombre ??
          null,
        observacion:
          h.observacion ??
          null,
      })
    ),
  };

  return NextResponse.json(response);
}
