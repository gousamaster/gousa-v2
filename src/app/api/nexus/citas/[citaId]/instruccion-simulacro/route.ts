import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureSimulacroInstruccionSchema } from "@/lib/simulacro-instruccion-schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ citaId: string }> },
) {
  try {
    await ensureSimulacroInstruccionSchema();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { citaId } = await params;
    const body = await request.json().catch(() => ({}));
    const enviada = body?.enviada === true;

    const cita = await db.cita.findFirst({
      where: { id: citaId, deletedAt: null },
      select: { id: true, tipoCita: { select: { nombre: true, codigo: true } } },
    });
    if (!cita) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });

    const descriptor = `${cita.tipoCita.nombre} ${cita.tipoCita.codigo ?? ""}`.toLowerCase();
    if (!descriptor.includes("simulacr")) {
      return NextResponse.json({ error: "La cita no corresponde a un simulacro" }, { status: 400 });
    }

    await db.$executeRaw`
      INSERT INTO "simulacro_instruccion" ("citaId", "enviada", "marcadaPorId", "marcadaAt", "updatedAt")
      VALUES (${citaId}, ${enviada}, ${session.user.id}, ${enviada ? new Date() : null}, CURRENT_TIMESTAMP)
      ON CONFLICT ("citaId") DO UPDATE SET
        "enviada" = EXCLUDED."enviada",
        "marcadaPorId" = EXCLUDED."marcadaPorId",
        "marcadaAt" = EXCLUDED."marcadaAt",
        "updatedAt" = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true, enviada });
  } catch (error) {
    console.error("instruccion-simulacro POST", error);
    return NextResponse.json({ error: "No se pudo actualizar la instrucción del simulacro" }, { status: 500 });
  }
}
