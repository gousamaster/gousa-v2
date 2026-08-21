import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { puedeAccederProspecto } from "@/lib/prospectos/permisos";
import { registrarAuditoriaProspecto } from "@/lib/prospectos/auditoria";

type ProspectoBloqueado = {
  id: string;
  nombres: string;
  apellidos: string | null;
  telefono: string;
  email: string | null;
  pais: string | null;
  estado: string;
  convertido: boolean;
  clienteId: string | null;
  responsableComercialId: string | null;
};

export async function POST(request: Request, { params }: { params: Promise<{ prospectoId: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { prospectoId } = await params;
    if (!(await puedeAccederProspecto(session.user.id, prospectoId))) return NextResponse.json({ error: "Sin permiso para convertir este prospecto" }, { status: 403 });

    const body = await request.json();
    const regionId = typeof body.regionId === "string" ? body.regionId.trim() : "";
    if (!regionId) return NextResponse.json({ error: "La región es obligatoria para convertir el prospecto" }, { status: 400 });

    const region = await db.region.findFirst({ where: { id: regionId, activo: true }, select: { id: true } });
    if (!region) return NextResponse.json({ error: "Región no válida" }, { status: 400 });

    const resultado = await db.$transaction(async (tx) => {
      const bloqueados = await tx.$queryRaw<ProspectoBloqueado[]>`
        SELECT
          p."id", p."nombres", p."apellidos", p."telefono", p."email", p."pais", p."estado",
          p."convertido", p."clienteId", p."responsable_comercial_id" AS "responsableComercialId"
        FROM "prospecto" p
        WHERE p."id"=${prospectoId} AND p."deletedAt" IS NULL
        FOR UPDATE
      `;
      const prospecto = bloqueados[0];
      if (!prospecto) throw new Error("PROSPECTO_NO_ENCONTRADO");
      if (prospecto.convertido || prospecto.clienteId) throw new Error("PROSPECTO_YA_CONVERTIDO");

      let propietarioComercialId = prospecto.responsableComercialId;
      if (propietarioComercialId) {
        const responsableActivo = await tx.user.findFirst({ where: { id: propietarioComercialId, status: "ACTIVE", banned: { not: true } }, select: { id: true } });
        if (!responsableActivo) propietarioComercialId = null;
      }
      const registradoPorId = propietarioComercialId ?? session.user.id;

      const cliente = await tx.cliente.create({
        data: {
          nombres: prospecto.nombres,
          apellidos: prospecto.apellidos ?? "",
          email: prospecto.email,
          telefonoCelular: prospecto.telefono,
          nacionalidad: prospecto.pais,
          regionId,
          registradoPorId,
        },
        select: { id: true, nombres: true, apellidos: true },
      });

      const prospectoActualizado = await tx.prospecto.update({
        where: { id: prospecto.id },
        data: { convertido: true, estado: "CONVERTIDO", clienteId: cliente.id, convertidoPorId: session.user.id, convertidoAt: new Date() },
        include: {
          creadoPor: { select: { id: true, name: true, email: true } },
          convertidoPor: { select: { id: true, name: true, email: true } },
          cliente: { select: { id: true, nombres: true, apellidos: true } },
        },
      });

      await tx.$executeRaw`UPDATE "prospecto" SET "primer_contacto_at" = COALESCE("primer_contacto_at", CURRENT_TIMESTAMP) WHERE "id" = ${prospecto.id}`;
      await tx.$executeRaw`INSERT INTO "prospecto_historial" ("id", "prospecto_id", "estado_anterior", "estado_nuevo", "motivo_perdida", "cambiado_por_id", "created_at") VALUES (${randomUUID()}, ${prospecto.id}, ${prospecto.estado}, 'CONVERTIDO', NULL, ${session.user.id}, CURRENT_TIMESTAMP)`;
      await tx.$executeRaw`
        UPDATE "prospecto_seguimiento"
        SET "estado"='CANCELADO',
            "notas"=CASE WHEN COALESCE(TRIM("notas"),'')='' THEN 'Cerrado automáticamente por conversión a cliente.' ELSE "notas" || E'\nCerrado automáticamente por conversión a cliente.' END,
            "updated_at"=CURRENT_TIMESTAMP
        WHERE "prospecto_id"=${prospecto.id} AND "estado"='PENDIENTE'
      `;
      await registrarAuditoriaProspecto(tx, {
        prospectoId: prospecto.id,
        usuarioId: session.user.id,
        accion: "CONVERSION",
        detalle: {
          estadoAnterior: prospecto.estado,
          clienteId: cliente.id,
          regionId,
          responsableComercialId: propietarioComercialId,
          clienteRegistradoPorId: registradoPorId,
          convertidoPorId: session.user.id,
        },
      });

      return { cliente, prospecto: prospectoActualizado };
    });

    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "PROSPECTO_NO_ENCONTRADO") return NextResponse.json({ error: "Prospecto no encontrado" }, { status: 404 });
    if (error instanceof Error && error.message === "PROSPECTO_YA_CONVERTIDO") return NextResponse.json({ error: "Este prospecto ya fue convertido en cliente" }, { status: 409 });
    console.error("Error al convertir prospecto:", error);
    return NextResponse.json({ error: "No se pudo convertir el prospecto en cliente" }, { status: 500 });
  }
}
