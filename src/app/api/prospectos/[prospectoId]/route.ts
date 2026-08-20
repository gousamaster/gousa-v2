import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";
import { esOrigenProspecto } from "@/lib/prospectos/origenes";

const ESTADOS = ["NUEVO", "CONTACTADO", "CALIFICADO", "SEGUIMIENTO", "PERDIDO"] as const;
const ESTADOS_CONTACTO = ["CONTACTADO", "CALIFICADO", "SEGUIMIENTO"] as const;

type ExtraRow = {
  motivoPerdida: string | null;
  perdidoAt: Date | null;
  origenDetalle: string | null;
  primerContactoAt: Date | null;
};

async function datosExtra(prospectoId: string) {
  const rows = await db.$queryRaw<ExtraRow[]>`
    SELECT
      "motivo_perdida" AS "motivoPerdida",
      "perdido_at" AS "perdidoAt",
      "origen_detalle" AS "origenDetalle",
      "primer_contacto_at" AS "primerContactoAt"
    FROM "prospecto" WHERE "id" = ${prospectoId} LIMIT 1
  `;
  return rows[0] ?? { motivoPerdida: null, perdidoAt: null, origenDetalle: null, primerContactoAt: null };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ prospectoId: string }> },
) {
  try {
    const { prospectoId } = await params;
    const prospecto = await db.prospecto.findFirst({
      where: { id: prospectoId, deletedAt: null },
      include: {
        creadoPor: { select: { id: true, name: true, email: true } },
        convertidoPor: { select: { id: true, name: true, email: true } },
        cliente: { select: { id: true, nombres: true, apellidos: true } },
      },
    });
    if (!prospecto) return NextResponse.json({ error: "Prospecto no encontrado" }, { status: 404 });
    const extra = await datosExtra(prospectoId);
    return NextResponse.json({ prospecto: { ...prospecto, ...extra } });
  } catch (error) {
    console.error("Error al obtener prospecto:", error);
    return NextResponse.json({ error: "No se pudo obtener el prospecto" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ prospectoId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { prospectoId } = await params;
    const body = await request.json();
    const prospectoActual = await db.prospecto.findFirst({ where: { id: prospectoId, deletedAt: null } });
    if (!prospectoActual) return NextResponse.json({ error: "Prospecto no encontrado" }, { status: 404 });
    if (prospectoActual.convertido) return NextResponse.json({ error: "Un prospecto convertido ya no puede cambiar de etapa comercial" }, { status: 400 });

    const estado = typeof body.estado === "string" ? body.estado.trim().toUpperCase() : prospectoActual.estado;
    if (!ESTADOS.includes(estado as (typeof ESTADOS)[number])) {
      return NextResponse.json({ error: "Etapa comercial no válida" }, { status: 400 });
    }
    const motivoPerdida = typeof body.motivoPerdida === "string" ? body.motivoPerdida.trim() : "";
    if (estado === "PERDIDO" && !motivoPerdida) {
      return NextResponse.json({ error: "El motivo de pérdida es obligatorio" }, { status: 400 });
    }

    const origenSolicitado = typeof body.origen === "string" ? body.origen.trim().toUpperCase() : prospectoActual.origen;
    if (origenSolicitado && origenSolicitado !== prospectoActual.origen && !esOrigenProspecto(origenSolicitado)) {
      return NextResponse.json({ error: "Origen del prospecto no válido" }, { status: 400 });
    }
    const origenDetalle = typeof body.origenDetalle === "string" ? body.origenDetalle.trim() || null : null;
    const cambioEstado = estado !== prospectoActual.estado;
    const registrarPrimerContacto = ESTADOS_CONTACTO.includes(estado as (typeof ESTADOS_CONTACTO)[number]);

    const prospecto = await db.$transaction(async (tx) => {
      const actualizado = await tx.prospecto.update({
        where: { id: prospectoId },
        data: {
          nombres: typeof body.nombres === "string" ? body.nombres.trim() : undefined,
          apellidos: typeof body.apellidos === "string" ? body.apellidos.trim() || null : undefined,
          telefono: typeof body.telefono === "string" ? body.telefono.trim() : undefined,
          email: typeof body.email === "string" ? body.email.trim() || null : undefined,
          ciudad: typeof body.ciudad === "string" ? body.ciudad.trim() || null : undefined,
          pais: typeof body.pais === "string" ? body.pais.trim() || null : undefined,
          origen: typeof origenSolicitado === "string" ? origenSolicitado || null : undefined,
          interes: typeof body.interes === "string" ? body.interes.trim() || null : undefined,
          observaciones: typeof body.observaciones === "string" ? body.observaciones.trim() || null : undefined,
          estado,
          scorePreliminar: typeof body.scorePreliminar === "number"
            ? Math.max(0, Math.min(100, body.scorePreliminar))
            : body.scorePreliminar === null ? null : undefined,
        },
        include: {
          creadoPor: { select: { id: true, name: true, email: true } },
          convertidoPor: { select: { id: true, name: true, email: true } },
          cliente: { select: { id: true, nombres: true, apellidos: true } },
        },
      });

      if (estado === "PERDIDO") {
        await tx.$executeRaw`
          UPDATE "prospecto" SET "motivo_perdida" = ${motivoPerdida}, "perdido_at" = CURRENT_TIMESTAMP
          WHERE "id" = ${prospectoId}
        `;
      } else {
        await tx.$executeRaw`
          UPDATE "prospecto" SET "motivo_perdida" = NULL, "perdido_at" = NULL
          WHERE "id" = ${prospectoId}
        `;
      }

      await tx.$executeRaw`
        UPDATE "prospecto"
        SET "origen_detalle" = ${origenDetalle}
        WHERE "id" = ${prospectoId}
      `;

      if (registrarPrimerContacto) {
        await tx.$executeRaw`
          UPDATE "prospecto"
          SET "primer_contacto_at" = COALESCE("primer_contacto_at", CURRENT_TIMESTAMP)
          WHERE "id" = ${prospectoId}
        `;
      }

      if (cambioEstado) {
        const historialId = randomUUID();
        const motivoHistorial = estado === "PERDIDO" ? motivoPerdida : null;
        await tx.$executeRaw`
          INSERT INTO "prospecto_historial"
            ("id", "prospecto_id", "estado_anterior", "estado_nuevo", "motivo_perdida", "cambiado_por_id", "created_at")
          VALUES
            (${historialId}, ${prospectoId}, ${prospectoActual.estado}, ${estado}, ${motivoHistorial}, ${session.user.id}, CURRENT_TIMESTAMP)
        `;
      }

      return actualizado;
    });

    const extra = await datosExtra(prospectoId);
    return NextResponse.json({ prospecto: { ...prospecto, ...extra } });
  } catch (error) {
    console.error("Error al actualizar prospecto:", error);
    return NextResponse.json({ error: "No se pudo actualizar el prospecto" }, { status: 500 });
  }
}
