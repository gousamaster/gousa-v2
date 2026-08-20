import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prospectoId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { prospectoId } = await params;
    const body = await request.json();
    const regionId = typeof body.regionId === "string" ? body.regionId.trim() : "";
    if (!regionId) return NextResponse.json({ error: "La región es obligatoria para convertir el prospecto" }, { status: 400 });

    const [prospecto, region] = await Promise.all([
      db.prospecto.findFirst({ where: { id: prospectoId, deletedAt: null } }),
      db.region.findFirst({ where: { id: regionId, activo: true }, select: { id: true } }),
    ]);
    if (!prospecto) return NextResponse.json({ error: "Prospecto no encontrado" }, { status: 404 });
    if (!region) return NextResponse.json({ error: "Región no válida" }, { status: 400 });
    if (prospecto.convertido || prospecto.clienteId) return NextResponse.json({ error: "Este prospecto ya fue convertido en cliente" }, { status: 409 });

    const resultado = await db.$transaction(async (tx) => {
      const cliente = await tx.cliente.create({
        data: {
          nombres: prospecto.nombres,
          apellidos: prospecto.apellidos ?? "",
          email: prospecto.email,
          telefonoCelular: prospecto.telefono,
          nacionalidad: prospecto.pais,
          regionId,
          registradoPorId: session.user.id,
        },
        select: { id: true, nombres: true, apellidos: true },
      });

      const prospectoActualizado = await tx.prospecto.update({
        where: { id: prospecto.id },
        data: {
          convertido: true,
          estado: "CONVERTIDO",
          clienteId: cliente.id,
          convertidoPorId: session.user.id,
          convertidoAt: new Date(),
        },
        include: {
          creadoPor: { select: { id: true, name: true, email: true } },
          convertidoPor: { select: { id: true, name: true, email: true } },
          cliente: { select: { id: true, nombres: true, apellidos: true } },
        },
      });

      await tx.$executeRaw`
        UPDATE "prospecto"
        SET "primer_contacto_at" = COALESCE("primer_contacto_at", CURRENT_TIMESTAMP)
        WHERE "id" = ${prospecto.id}
      `;

      const historialId = randomUUID();
      await tx.$executeRaw`
        INSERT INTO "prospecto_historial"
          ("id", "prospecto_id", "estado_anterior", "estado_nuevo", "motivo_perdida", "cambiado_por_id", "created_at")
        VALUES
          (${historialId}, ${prospecto.id}, ${prospecto.estado}, 'CONVERTIDO', NULL, ${session.user.id}, CURRENT_TIMESTAMP)
      `;

      return { cliente, prospecto: prospectoActualizado };
    });

    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    console.error("Error al convertir prospecto:", error);
    return NextResponse.json({ error: "No se pudo convertir el prospecto en cliente" }, { status: 500 });
  }
}
