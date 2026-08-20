import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureCitaResultadoConsularSchema, RESULTADOS_CONSULARES } from "@/lib/cita-resultado-consular-schema";

export async function GET(_request: Request, { params }: { params: Promise<{ citaId: string }> }) {
  try {
    await ensureCitaResultadoConsularSchema();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { citaId } = await params;
    const rows = await db.$queryRaw<Array<{ resultado:string; observaciones:string|null; registradoAt:Date; registradoPorNombre:string }>>`
      SELECT r."resultado", r."observaciones", r."registradoAt", u."name" AS "registradoPorNombre"
      FROM "cita_resultado_consular" r
      INNER JOIN "user" u ON u."id" = r."registradoPorId"
      WHERE r."citaId" = ${citaId}
      LIMIT 1`;
    return NextResponse.json({ resultado: rows[0] ?? null });
  } catch (error) {
    console.error("resultado consular GET", error);
    return NextResponse.json({ error: "No se pudo cargar el resultado consular" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ citaId: string }> }) {
  try {
    await ensureCitaResultadoConsularSchema();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { citaId } = await params;
    const cita = await db.cita.findFirst({
      where: { id: citaId, deletedAt: null },
      select: { id:true, fechaHora:true, tipoCita:{ select:{ nombre:true, codigo:true } } },
    });
    if (!cita) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    const esEntrevista = /entrevista/i.test(cita.tipoCita.nombre) || /entrevista/i.test(cita.tipoCita.codigo) || /consular|embajada/i.test(cita.tipoCita.nombre);
    if (!esEntrevista) return NextResponse.json({ error: "Esta cita no es una entrevista consular" }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const resultado = String(body.resultado ?? "").toUpperCase();
    const observaciones = typeof body.observaciones === "string" ? body.observaciones.trim().slice(0, 1000) : null;
    if (!(RESULTADOS_CONSULARES as readonly string[]).includes(resultado)) {
      return NextResponse.json({ error: "Resultado no válido" }, { status: 400 });
    }

    await db.$executeRaw`
      INSERT INTO "cita_resultado_consular" ("id","citaId","resultado","observaciones","registradoPorId","registradoAt","createdAt","updatedAt")
      VALUES (${crypto.randomUUID()},${citaId},${resultado},${observaciones || null},${session.user.id},NOW(),NOW(),NOW())
      ON CONFLICT ("citaId") DO UPDATE SET
        "resultado"=EXCLUDED."resultado",
        "observaciones"=EXCLUDED."observaciones",
        "registradoPorId"=EXCLUDED."registradoPorId",
        "registradoAt"=NOW(),
        "updatedAt"=NOW()`;

    if (resultado === "REPROGRAMADA") {
      await db.cita.update({ where:{ id:citaId }, data:{ estado:"REPROGRAMADA" } });
    }

    return NextResponse.json({ ok:true });
  } catch (error) {
    console.error("resultado consular POST", error);
    return NextResponse.json({ error: "No se pudo guardar el resultado consular" }, { status: 500 });
  }
}
