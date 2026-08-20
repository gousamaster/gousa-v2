import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { puedeAccederProspecto } from "@/lib/prospectos/permisos";

type AuditoriaRow = {
  id: string;
  accion: string;
  detalle: unknown;
  usuarioNombre: string | null;
  createdAt: Date;
};

export async function GET(_request: Request, { params }: { params: Promise<{ prospectoId: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { prospectoId } = await params;
    if (!(await puedeAccederProspecto(session.user.id, prospectoId))) return NextResponse.json({ error: "Sin permiso para ver la auditoría" }, { status: 403 });

    const auditoria = await db.$queryRaw<AuditoriaRow[]>`
      SELECT a."id", a."accion", a."detalle", u."name" AS "usuarioNombre", a."created_at" AS "createdAt"
      FROM "prospecto_auditoria" a
      LEFT JOIN "user" u ON u."id" = a."usuario_id"
      WHERE a."prospecto_id" = ${prospectoId}
      ORDER BY a."created_at" DESC
      LIMIT 100
    `;
    return NextResponse.json({ auditoria });
  } catch (error) {
    console.error("Error al cargar auditoría del prospecto:", error);
    return NextResponse.json({ error: "No se pudo cargar la auditoría" }, { status: 500 });
  }
}
