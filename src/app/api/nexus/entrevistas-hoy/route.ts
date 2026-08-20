import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureCitaResultadoConsularSchema } from "@/lib/cita-resultado-consular-schema";

export async function GET() {
  try {
    await ensureCitaResultadoConsularSchema();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const rows = await db.$queryRaw<Array<{
      id:string; fechaHora:Date; lugar:string|null; tipoCita:string; cliente:string|null; grupoFamiliar:string|null;
      participantes:number; resultado:string|null; registradoAt:Date|null; horasDesdeCita:number;
    }>>`
      SELECT c."id", c."fechaHora", c."lugar", tc."nombre" AS "tipoCita",
        CASE WHEN cl."id" IS NOT NULL THEN TRIM(cl."nombres" || ' ' || cl."apellidos") ELSE NULL END AS "cliente",
        gf."nombre" AS "grupoFamiliar",
        (SELECT COUNT(*)::int FROM "cita_participante" cp WHERE cp."citaId" = c."id") AS "participantes",
        rc."resultado", rc."registradoAt",
        EXTRACT(EPOCH FROM (NOW() - c."fechaHora"))/3600.0 AS "horasDesdeCita"
      FROM "cita" c
      INNER JOIN "catalogo_tipo_cita" tc ON tc."id" = c."tipoCitaId"
      LEFT JOIN "tramite" t ON t."id" = c."tramiteId"
      LEFT JOIN "cliente" cl ON cl."id" = t."clienteId"
      LEFT JOIN "grupo_familiar" gf ON gf."id" = c."grupoFamiliarId"
      LEFT JOIN "cita_resultado_consular" rc ON rc."citaId" = c."id"
      WHERE c."deletedAt" IS NULL
        AND (LOWER(tc."nombre") LIKE '%entrevista%' OR LOWER(tc."codigo") LIKE '%entrevista%' OR LOWER(tc."nombre") LIKE '%consular%' OR LOWER(tc."nombre") LIKE '%embajada%')
        AND (c."fechaHora" - INTERVAL '4 hours')::date = (NOW() AT TIME ZONE 'America/La_Paz')::date
      ORDER BY c."fechaHora" ASC`;

    const entrevistas = rows.map((r) => ({
      ...r,
      horasDesdeCita: Number(r.horasDesdeCita),
      estadoResultado: r.resultado ? r.resultado : Number(r.horasDesdeCita) >= 6 ? "ATRASADO" : Number(r.horasDesdeCita) >= 0 ? "PENDIENTE" : "PROXIMA",
    }));

    return NextResponse.json({ entrevistas });
  } catch (error) {
    console.error("entrevistas-hoy GET", error);
    return NextResponse.json({ error: "No se pudieron cargar las entrevistas de hoy" }, { status: 500 });
  }
}
