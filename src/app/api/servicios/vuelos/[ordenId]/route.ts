import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ ordenId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { ordenId } = await params;
    const body = await request.json();
    const estado =
      typeof body.estado === "string" ? body.estado.trim().toUpperCase() : "";

    if (estado !== "DESPACHADA" && estado !== "PENDIENTE") {
      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 },
      );
    }

    const existente = await db.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "orden_cotizacion_vuelo"
      WHERE "id" = ${ordenId}
      LIMIT 1
    `;

    if (!existente[0]) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 },
      );
    }

    const actualizado =
      estado === "DESPACHADA"
        ? await db.$queryRaw<Array<{ id: string; estado: string; despachadoAt: Date | null }>>`
            UPDATE "orden_cotizacion_vuelo"
            SET
              "estado" = 'DESPACHADA',
              "despachadoAt" = NOW(),
              "updatedAt" = NOW()
            WHERE "id" = ${ordenId}
            RETURNING "id", "estado", "despachadoAt"
          `
        : await db.$queryRaw<Array<{ id: string; estado: string; despachadoAt: Date | null }>>`
            UPDATE "orden_cotizacion_vuelo"
            SET
              "estado" = 'PENDIENTE',
              "despachadoAt" = NULL,
              "updatedAt" = NOW()
            WHERE "id" = ${ordenId}
            RETURNING "id", "estado", "despachadoAt"
          `;

    return NextResponse.json({ orden: actualizado[0] });
  } catch (error) {
    console.error("Error al actualizar orden de vuelo:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la orden" },
      { status: 500 },
    );
  }
}
