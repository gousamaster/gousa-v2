import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type MigratorioPayload = {
  tuvoVisaUsaAntes?: boolean | null;
  tipoVisaUsaAnterior?: string | null;
  numeroVisaAnterior?: string | null;
  fechaEmisionVisaUsa?: string | null;
  fechaVencimientoVisaUsa?: string | null;
  visaRevocadaCancelada?: boolean | null;
  detalleRevocacionCancelacion?: string | null;

  viajoUsaAntes?: boolean | null;
  cantidadViajesUsa?: number | null;
  ultimoIngresoUsa?: string | null;
  ultimaSalidaUsa?: string | null;
  duracionUltimaEstadiaDias?: number | null;
  cumplioSiempreTiempoAutorizado?: boolean | null;

  tuvoSobreestadia?: boolean | null;
  diasSobreestadia?: number | null;
  detalleSobreestadia?: string | null;

  trabajoNoAutorizadoUsa?: boolean | null;
  detalleTrabajoNoAutorizado?: string | null;

  tuvoRechazoVisaUsa?: boolean | null;
  cantidadRechazosVisaUsa?: number | null;
  fechaUltimoRechazoVisa?: string | null;
  tipoVisaUltimoRechazo?: string | null;
  motivoRechazoConocido?: string | null;

  tuvoEntradaRechazadaUsa?: boolean | null;
  fechaEntradaRechazada?: string | null;
  detalleEntradaRechazada?: string | null;

  tuvoProblemaCbP?: boolean | null;
  detalleProblemaCbP?: string | null;

  tuvoDeportacionRemocion?: boolean | null;
  fechaDeportacionRemocion?: string | null;
  detalleDeportacionRemocion?: string | null;

  tuvoPeticionMigratoriaUsa?: boolean | null;
  tipoPeticionMigratoria?: string | null;
  estadoPeticionMigratoria?: string | null;
  detallePeticionMigratoria?: string | null;

  solicitoResidenciaUsa?: boolean | null;
  solicitoAsiloUsa?: boolean | null;
  solicitoCambioEstatusUsa?: boolean | null;

  tuvoOtroAntecedenteMigratorio?: boolean | null;
  detalleOtroAntecedenteMigratorio?: string | null;
  observacionesMigratorias?: string | null;
};

function parseDate(
  value: string | null | undefined,
): Date | null {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ clienteId: string }>;
  },
) {
  try {
    const { clienteId } = await params;

    const cliente = await db.cliente.findUnique({
      where: {
        id: clienteId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!cliente) {
      return NextResponse.json(
        {
          error: "Cliente no encontrado",
        },
        {
          status: 404,
        },
      );
    }

    const body =
      (await request.json()) as MigratorioPayload;

    const data = {
      tuvoVisaUsaAntes:
        body.tuvoVisaUsaAntes ?? null,
      tipoVisaUsaAnterior:
        body.tipoVisaUsaAnterior ?? null,
      numeroVisaAnterior:
        body.numeroVisaAnterior ?? null,
      fechaEmisionVisaUsa:
        parseDate(body.fechaEmisionVisaUsa),
      fechaVencimientoVisaUsa:
        parseDate(body.fechaVencimientoVisaUsa),
      visaRevocadaCancelada:
        body.visaRevocadaCancelada ?? null,
      detalleRevocacionCancelacion:
        body.detalleRevocacionCancelacion ?? null,

      viajoUsaAntes:
        body.viajoUsaAntes ?? null,
      cantidadViajesUsa:
        body.cantidadViajesUsa ?? null,
      ultimoIngresoUsa:
        parseDate(body.ultimoIngresoUsa),
      ultimaSalidaUsa:
        parseDate(body.ultimaSalidaUsa),
      duracionUltimaEstadiaDias:
        body.duracionUltimaEstadiaDias ?? null,
      cumplioSiempreTiempoAutorizado:
        body.cumplioSiempreTiempoAutorizado ??
        null,

      tuvoSobreestadia:
        body.tuvoSobreestadia ?? null,
      diasSobreestadia:
        body.diasSobreestadia ?? null,
      detalleSobreestadia:
        body.detalleSobreestadia ?? null,

      trabajoNoAutorizadoUsa:
        body.trabajoNoAutorizadoUsa ?? null,
      detalleTrabajoNoAutorizado:
        body.detalleTrabajoNoAutorizado ?? null,

      tuvoRechazoVisaUsa:
        body.tuvoRechazoVisaUsa ?? null,
      cantidadRechazosVisaUsa:
        body.cantidadRechazosVisaUsa ?? null,
      fechaUltimoRechazoVisa:
        parseDate(body.fechaUltimoRechazoVisa),
      tipoVisaUltimoRechazo:
        body.tipoVisaUltimoRechazo ?? null,
      motivoRechazoConocido:
        body.motivoRechazoConocido ?? null,

      tuvoEntradaRechazadaUsa:
        body.tuvoEntradaRechazadaUsa ?? null,
      fechaEntradaRechazada:
        parseDate(body.fechaEntradaRechazada),
      detalleEntradaRechazada:
        body.detalleEntradaRechazada ?? null,

      tuvoProblemaCbP:
        body.tuvoProblemaCbP ?? null,
      detalleProblemaCbP:
        body.detalleProblemaCbP ?? null,

      tuvoDeportacionRemocion:
        body.tuvoDeportacionRemocion ?? null,
      fechaDeportacionRemocion:
        parseDate(
          body.fechaDeportacionRemocion,
        ),
      detalleDeportacionRemocion:
        body.detalleDeportacionRemocion ?? null,

      tuvoPeticionMigratoriaUsa:
        body.tuvoPeticionMigratoriaUsa ?? null,
      tipoPeticionMigratoria:
        body.tipoPeticionMigratoria ?? null,
      estadoPeticionMigratoria:
        body.estadoPeticionMigratoria ?? null,
      detallePeticionMigratoria:
        body.detallePeticionMigratoria ?? null,

      solicitoResidenciaUsa:
        body.solicitoResidenciaUsa ?? null,
      solicitoAsiloUsa:
        body.solicitoAsiloUsa ?? null,
      solicitoCambioEstatusUsa:
        body.solicitoCambioEstatusUsa ?? null,

      tuvoOtroAntecedenteMigratorio:
        body.tuvoOtroAntecedenteMigratorio ??
        null,
      detalleOtroAntecedenteMigratorio:
        body.detalleOtroAntecedenteMigratorio ??
        null,
      observacionesMigratorias:
        body.observacionesMigratorias ?? null,
    };

    const datosMigratorios =
      await db.clienteDatosMigratorios.upsert({
        where: {
          clienteId,
        },
        create: {
          clienteId,
          ...data,
        },
        update: data,
      });

    return NextResponse.json({
      success: true,
      data: datosMigratorios,
    });
  } catch (error) {
    console.error(
      "Error guardando datos migratorios:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "No se pudieron guardar los datos migratorios",
      },
      {
        status: 500,
      },
    );
  }
}
