import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { puedeAccederProspecto } from "@/lib/prospectos/permisos";
import { registrarAuditoriaProspecto } from "@/lib/prospectos/auditoria";

const ROLES_ASIGNACION = new Set(["SUPER_ADMIN", "MANAGER"]);

type ResponsableRow = {
  responsableId: string | null;
  responsableNombre: string | null;
  responsableEmail: string | null;
};

async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function GET(_request: Request, { params }: { params: Promise<{ prospectoId: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { prospectoId } = await params;
    if (!(await puedeAccederProspecto(session.user.id, prospectoId))) return NextResponse.json({ error: "Sin permiso para ver este prospecto" }, { status: 403 });

    const rows = await db.$queryRaw<ResponsableRow[]>`
      SELECT p."responsable_comercial_id" AS "responsableId", u."name" AS "responsableNombre", u."email" AS "responsableEmail"
      FROM "prospecto" p
      LEFT JOIN "user" u ON u."id"=p."responsable_comercial_id"
      WHERE p."id"=${prospectoId} AND p."deletedAt" IS NULL
      LIMIT 1
    `;
    if (!rows[0]) return NextResponse.json({ error: "Prospecto no encontrado" }, { status: 404 });

    const puedeReasignar = ROLES_ASIGNACION.has(session.user.role ?? "USER");
    const responsables = puedeReasignar
      ? await db.user.findMany({
          where: { status: "ACTIVE", banned: { not: true } },
          orderBy: { name: "asc" },
          select: { id: true, name: true, email: true },
        })
      : [];

    return NextResponse.json({ responsable: rows[0], responsables, puedeReasignar });
  } catch (error) {
    console.error("Error al cargar responsable comercial:", error);
    return NextResponse.json({ error: "No se pudo cargar el responsable comercial" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ prospectoId: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (!ROLES_ASIGNACION.has(session.user.role ?? "USER")) return NextResponse.json({ error: "Solo Manager o Super Admin pueden reasignar prospectos" }, { status: 403 });

    const { prospectoId } = await params;
    const body = await request.json();
    const responsableId = typeof body.responsableId === "string" ? body.responsableId.trim() : "";
    if (!responsableId) return NextResponse.json({ error: "Selecciona un responsable comercial" }, { status: 400 });

    const [prospectoRows, responsable] = await Promise.all([
      db.$queryRaw<{ responsableId: string | null }[]>`
        SELECT "responsable_comercial_id" AS "responsableId" FROM "prospecto"
        WHERE "id"=${prospectoId} AND "deletedAt" IS NULL AND "convertido"=false LIMIT 1
      `,
      db.user.findFirst({ where: { id: responsableId, status: "ACTIVE", banned: { not: true } }, select: { id: true, name: true, email: true } }),
    ]);
    if (!prospectoRows[0]) return NextResponse.json({ error: "Prospecto no encontrado o ya convertido" }, { status: 404 });
    if (!responsable) return NextResponse.json({ error: "Responsable no válido" }, { status: 400 });

    const anterior = prospectoRows[0].responsableId;
    if (anterior === responsableId) return NextResponse.json({ ok: true, responsable, sinCambios: true });

    await db.$transaction(async (tx) => {
      await tx.$executeRaw`UPDATE "prospecto" SET "responsable_comercial_id"=${responsableId}, "updatedAt"=CURRENT_TIMESTAMP WHERE "id"=${prospectoId}`;
      await registrarAuditoriaProspecto(tx, {
        prospectoId,
        usuarioId: session.user.id,
        accion: "RESPONSABLE_COMERCIAL_REASIGNADO",
        detalle: { responsableAnteriorId: anterior, responsableNuevoId: responsableId },
      });
    });

    return NextResponse.json({ ok: true, responsable });
  } catch (error) {
    console.error("Error al reasignar responsable comercial:", error);
    return NextResponse.json({ error: "No se pudo reasignar el responsable comercial" }, { status: 500 });
  }
}
