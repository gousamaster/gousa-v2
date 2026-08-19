import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type OrdenVueloRow = {
  id: string;
  numeroOrden: string;
  prospectoId: string;
  prospectoNombre: string;
  prospectoTelefono: string;
  origen: string;
  destino: string;
  fechaIda: Date;
  fechaRetorno: Date;
  flexibilidad: boolean;
  equipaje: boolean;
  observaciones: string | null;
  estado: "PENDIENTE" | "DESPACHADA";
  creadoPorId: string;
  creadoPorNombre: string;
  createdAt: Date;
  despachadoAt: Date | null;
};

function normalizarIata(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado")?.toUpperCase();

    const filtroEstado =
      estado === "PENDIENTE" || estado === "DESPACHADA" ? estado : null;

    const ordenes = filtroEstado
      ? await db.$queryRaw<OrdenVueloRow[]>`
          SELECT
            o."id",
            o."numeroOrden",
            o."prospectoId",
            CONCAT(p."nombres", CASE WHEN p."apellidos" IS NOT NULL AND p."apellidos" <> '' THEN CONCAT(' ', p."apellidos") ELSE '' END) AS "prospectoNombre",
            p."telefono" AS "prospectoTelefono",
            o."origen",
            o."destino",
            o."fechaIda",
            o."fechaRetorno",
            o."flexibilidad",
            o."equipaje",
            o."observaciones",
            o."estado",
            o."creadoPorId",
            u."name" AS "creadoPorNombre",
            o."createdAt",
            o."despachadoAt"
          FROM "orden_cotizacion_vuelo" o
          INNER JOIN "prospecto" p ON p."id" = o."prospectoId"
          INNER JOIN "user" u ON u."id" = o."creadoPorId"
          WHERE p."deletedAt" IS NULL AND o."estado" = ${filtroEstado}
          ORDER BY o."createdAt" DESC
        `
      : await db.$queryRaw<OrdenVueloRow[]>`
          SELECT
            o."id",
            o."numeroOrden",
            o."prospectoId",
            CONCAT(p."nombres", CASE WHEN p."apellidos" IS NOT NULL AND p."apellidos" <> '' THEN CONCAT(' ', p."apellidos") ELSE '' END) AS "prospectoNombre",
            p."telefono" AS "prospectoTelefono",
            o."origen",
            o."destino",
            o."fechaIda",
            o."fechaRetorno",
            o."flexibilidad",
            o."equipaje",
            o."observaciones",
            o."estado",
            o."creadoPorId",
            u."name" AS "creadoPorNombre",
            o."createdAt",
            o."despachadoAt"
          FROM "orden_cotizacion_vuelo" o
          INNER JOIN "prospecto" p ON p."id" = o."prospectoId"
          INNER JOIN "user" u ON u."id" = o."creadoPorId"
          WHERE p."deletedAt" IS NULL
          ORDER BY o."createdAt" DESC
        `;

    return NextResponse.json({ ordenes });
  } catch (error) {
    console.error("Error al obtener ordenes de vuelos:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener las órdenes de cotización" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const prospectoId =
      typeof body.prospectoId === "string" ? body.prospectoId.trim() : "";
    const origen = normalizarIata(body.origen);
    const destino = normalizarIata(body.destino);
    const fechaIda = new Date(body.fechaIda);
    const fechaRetorno = new Date(body.fechaRetorno);
    const flexibilidad = body.flexibilidad === true;
    const equipaje = body.equipaje === true;
    const observaciones =
      typeof body.observaciones === "string" && body.observaciones.trim()
        ? body.observaciones.trim()
        : null;

    if (!prospectoId) {
      return NextResponse.json(
        { error: "Primero debes seleccionar un prospecto registrado" },
        { status: 400 },
      );
    }

    if (!/^[A-Z]{3}$/.test(origen) || !/^[A-Z]{3}$/.test(destino)) {
      return NextResponse.json(
        { error: "Origen y destino deben tener un código IATA de 3 letras" },
        { status: 400 },
      );
    }

    if (origen === destino) {
      return NextResponse.json(
        { error: "Origen y destino no pueden ser iguales" },
        { status: 400 },
      );
    }

    if (Number.isNaN(fechaIda.getTime()) || Number.isNaN(fechaRetorno.getTime())) {
      return NextResponse.json(
        { error: "Las fechas de ida y retorno son obligatorias" },
        { status: 400 },
      );
    }

    if (fechaRetorno < fechaIda) {
      return NextResponse.json(
        { error: "La fecha de retorno no puede ser anterior a la ida" },
        { status: 400 },
      );
    }

    const prospecto = await db.prospecto.findFirst({
      where: { id: prospectoId, deletedAt: null },
      select: { id: true, nombres: true, apellidos: true, telefono: true },
    });

    if (!prospecto) {
      return NextResponse.json(
        { error: "El prospecto seleccionado no existe o fue eliminado" },
        { status: 404 },
      );
    }

    const anio = new Date().getFullYear();
    const id = crypto.randomUUID();

    const orden = await db.$transaction(async (tx) => {
      const contador = await tx.$queryRaw<Array<{ ultimo: number }>>`
        INSERT INTO "orden_cotizacion_vuelo_contador" ("anio", "ultimo")
        VALUES (${anio}, 1)
        ON CONFLICT ("anio")
        DO UPDATE SET "ultimo" = "orden_cotizacion_vuelo_contador"."ultimo" + 1
        RETURNING "ultimo"
      `;

      const correlativo = Number(contador[0]?.ultimo ?? 1);
      const numeroOrden = `VUE-${anio}-${String(correlativo).padStart(4, "0")}`;

      const creada = await tx.$queryRaw<OrdenVueloRow[]>`
        INSERT INTO "orden_cotizacion_vuelo" (
          "id", "numeroOrden", "prospectoId", "origen", "destino",
          "fechaIda", "fechaRetorno", "flexibilidad", "equipaje",
          "observaciones", "estado", "creadoPorId", "createdAt", "updatedAt"
        )
        VALUES (
          ${id}, ${numeroOrden}, ${prospectoId}, ${origen}, ${destino},
          ${fechaIda}, ${fechaRetorno}, ${flexibilidad}, ${equipaje},
          ${observaciones}, 'PENDIENTE', ${session.user.id}, NOW(), NOW()
        )
        RETURNING
          "id", "numeroOrden", "prospectoId", '' AS "prospectoNombre",
          '' AS "prospectoTelefono", "origen", "destino", "fechaIda",
          "fechaRetorno", "flexibilidad", "equipaje", "observaciones",
          "estado", "creadoPorId", '' AS "creadoPorNombre", "createdAt",
          "despachadoAt"
      `;

      return creada[0];
    });

    return NextResponse.json(
      {
        orden: {
          ...orden,
          prospectoNombre: `${prospecto.nombres}${prospecto.apellidos ? ` ${prospecto.apellidos}` : ""}`,
          prospectoTelefono: prospecto.telefono,
          creadoPorNombre: session.user.name ?? "—",
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error al crear orden de vuelo:", error);
    return NextResponse.json(
      { error: "No se pudo crear la orden de cotización" },
      { status: 500 },
    );
  }
}
