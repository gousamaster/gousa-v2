import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { puedeAccederProspecto } from "@/lib/prospectos/permisos";

type HistorialRow = {
  id: string;
  estadoAnterior: string | null;
  estadoNuevo: string;
  motivoPerdida: string | null;
  cambiadoPorNombre: string | null;
  createdAt: Date;
};

export async function GET(_request: Request, { params }: { params: Promise<{ prospectoId: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { prospectoId } = await params;
    if (!(await puedeAccederProspecto(session.user.id, prospectoId))) return NextResponse.json({ error: "Sin permiso para ver este historial" }, { status: 403 });

    const historial = await db.$queryRaw<HistorialRow[]>`
      SELECT h."id", h."estado_anterior" AS "estadoAnterior", h."estado_nuevo" AS "estadoNuevo",
        h."motivo_perdida" AS "motivoPerdida", u."name" AS "cambiadoPorNombre", h."created_at" AS "createdAt"
      FROM "prospecto_historial" h
      LEFT JOIN "user" u ON u."id" = h."cambiado_por_id"
      WHERE h."prospecto_id" = ${prospectoId}
      ORDER BY h."created_at" DESC
      LIMIT 100
    `;
    return NextResponse.json({ historial });
  } catch (error) {
    console.error("Error al cargar historial del prospecto:", error);
    return NextResponse.json({ error: "No se pudo cargar el historial del prospecto" }, { status: 500 });
  }
}
