import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type SeguimientoRow = {
  id: string; prospectoId: string; responsableId: string | null; responsableNombre: string | null;
  creadoPorNombre: string | null; tipo: string; accion: string; programadoAt: Date; estado: string;
  notas: string | null; completadoAt: Date | null; createdAt: Date;
};

async function requireSession() { return auth.api.getSession({ headers: await headers() }); }

export async function GET(_request: Request, { params }: { params: Promise<{ prospectoId: string }> }) {
  try {
    const session = await requireSession();
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { prospectoId } = await params;
    const prospecto = await db.prospecto.findFirst({ where: { id: prospectoId, deletedAt: null }, select: { id: true } });
    if (!prospecto) return NextResponse.json({ error: "Prospecto no encontrado" }, { status: 404 });

    const [seguimientos, responsables] = await Promise.all([
      db.$queryRaw<SeguimientoRow[]>`
        SELECT s."id" AS "id", s."prospecto_id" AS "prospectoId", s."responsable_id" AS "responsableId",
          responsable."name" AS "responsableNombre", creador."name" AS "creadoPorNombre", s."tipo" AS "tipo",
          s."accion" AS "accion", s."programado_at" AS "programadoAt", s."estado" AS "estado", s."notas" AS "notas",
          s."completado_at" AS "completadoAt", s."created_at" AS "createdAt"
        FROM "prospecto_seguimiento" s
        LEFT JOIN "user" responsable ON responsable."id" = s."responsable_id"
        LEFT JOIN "user" creador ON creador."id" = s."creado_por_id"
        WHERE s."prospecto_id" = ${prospectoId}
        ORDER BY CASE WHEN s."estado" = 'PENDIENTE' THEN 0 ELSE 1 END,
          CASE WHEN s."estado" = 'PENDIENTE' THEN s."programado_at" END ASC, s."created_at" DESC
        LIMIT 30
      `,
      db.user.findMany({ where: { status: "ACTIVE", banned: { not: true } }, orderBy: { name: "asc" }, select: { id: true, name: true, email: true } }),
    ]);
    return NextResponse.json({ seguimientos, responsables });
  } catch (error) {
    console.error("Error al cargar seguimiento comercial:", error);
    return NextResponse.json({ error: "No se pudo cargar el seguimiento comercial" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ prospectoId: string }> }) {
  try {
    const session = await requireSession();
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { prospectoId } = await params;
    const body = await request.json();
    const accion = typeof body.accion === "string" ? body.accion.trim() : "";
    const tipo = typeof body.tipo === "string" ? body.tipo.trim().toUpperCase() : "LLAMADA";
    const responsableId = typeof body.responsableId === "string" && body.responsableId.trim() ? body.responsableId.trim() : session.user.id;
    const notas = typeof body.notas === "string" && body.notas.trim() ? body.notas.trim() : null;
    const programadoAt = new Date(body.programadoAt);

    if (!accion || Number.isNaN(programadoAt.getTime())) return NextResponse.json({ error: "Acción y fecha/hora de seguimiento son obligatorias" }, { status: 400 });
    if (programadoAt.getTime() <= Date.now()) return NextResponse.json({ error: "La fecha y hora del seguimiento deben ser posteriores al momento actual" }, { status: 400 });

    const [prospecto, responsable] = await Promise.all([
      db.prospecto.findFirst({ where: { id: prospectoId, deletedAt: null, convertido: false }, select: { id: true, estado: true } }),
      db.user.findFirst({ where: { id: responsableId, status: "ACTIVE" }, select: { id: true } }),
    ]);
    if (!prospecto) return NextResponse.json({ error: "El prospecto no existe o ya fue convertido" }, { status: 400 });
    if (!responsable) return NextResponse.json({ error: "Responsable no válido" }, { status: 400 });

    const id = randomUUID();
    await db.$transaction(async (tx) => {
      await tx.$executeRaw`
        INSERT INTO "prospecto_seguimiento" ("id","prospecto_id","responsable_id","creado_por_id","tipo","accion","programado_at","estado","notas")
        VALUES (${id},${prospectoId},${responsableId},${session.user.id},${tipo},${accion},${programadoAt},'PENDIENTE',${notas})
      `;
      if (body.actualizarEstado !== false && prospecto.estado !== "SEGUIMIENTO") {
        await tx.prospecto.update({ where: { id: prospectoId }, data: { estado: "SEGUIMIENTO" } });
        const historialId = randomUUID();
        await tx.$executeRaw`
          INSERT INTO "prospecto_historial" ("id","prospecto_id","estado_anterior","estado_nuevo","motivo_perdida","cambiado_por_id","created_at")
          VALUES (${historialId},${prospectoId},${prospecto.estado},'SEGUIMIENTO',NULL,${session.user.id},CURRENT_TIMESTAMP)
        `;
        await tx.$executeRaw`
          UPDATE "prospecto" SET "motivo_perdida" = NULL, "perdido_at" = NULL WHERE "id" = ${prospectoId}
        `;
      }
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Error al programar seguimiento:", error);
    return NextResponse.json({ error: "No se pudo programar el seguimiento" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ prospectoId: string }> }) {
  try {
    const session = await requireSession();
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { prospectoId } = await params;
    const body = await request.json();
    const seguimientoId = typeof body.seguimientoId === "string" ? body.seguimientoId.trim() : "";
    const estado = typeof body.estado === "string" ? body.estado.trim().toUpperCase() : "";
    const notas = typeof body.notas === "string" ? body.notas.trim() || null : null;
    if (!seguimientoId || !["COMPLETADO", "CANCELADO"].includes(estado)) return NextResponse.json({ error: "Actualización de seguimiento no válida" }, { status: 400 });

    const updated = await db.$transaction(async (tx) => {
      const count = await tx.$executeRaw`
        UPDATE "prospecto_seguimiento"
        SET "estado"=${estado}, "notas"=COALESCE(${notas},"notas"),
          "completado_at"=CASE WHEN ${estado}='COMPLETADO' THEN CURRENT_TIMESTAMP ELSE NULL END,
          "updated_at"=CURRENT_TIMESTAMP
        WHERE "id"=${seguimientoId} AND "prospecto_id"=${prospectoId} AND "estado"='PENDIENTE'
      `;
      if (count > 0 && estado === "COMPLETADO") {
        await tx.$executeRaw`
          UPDATE "prospecto"
          SET "primer_contacto_at" = COALESCE("primer_contacto_at", CURRENT_TIMESTAMP)
          WHERE "id" = ${prospectoId}
        `;
      }
      return count;
    });

    if (updated === 0) return NextResponse.json({ error: "Seguimiento no encontrado o ya cerrado" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al actualizar seguimiento:", error);
    return NextResponse.json({ error: "No se pudo actualizar el seguimiento" }, { status: 500 });
  }
}
