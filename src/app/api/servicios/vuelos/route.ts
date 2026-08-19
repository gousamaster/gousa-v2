import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureVuelosSchema } from "@/lib/vuelos-schema";

type TipoViaje = "SOLO_IDA" | "IDA_VUELTA" | "MULTIPLE";
type Tramo = { origen: string; destino: string; fecha: string };

type OrdenVueloRow = {
  id: string;
  numeroOrden: string;
  prospectoId: string;
  prospectoNombre: string;
  prospectoTelefono: string;
  tipoViaje: TipoViaje;
  origen: string;
  destino: string;
  fechaIda: Date;
  fechaRetorno: Date | null;
  tramos: Tramo[] | null;
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

function tipoValido(value: unknown): TipoViaje {
  return value === "SOLO_IDA" || value === "MULTIPLE" ? value : "IDA_VUELTA";
}

function tramoValido(tramo: Tramo) {
  return /^[A-Z]{3}$/.test(tramo.origen) && /^[A-Z]{3}$/.test(tramo.destino) && tramo.origen !== tramo.destino && !Number.isNaN(new Date(tramo.fecha).getTime());
}

export async function GET(request: Request) {
  try {
    await ensureVuelosSchema();
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado")?.toUpperCase();
    const filtroEstado = estado === "PENDIENTE" || estado === "DESPACHADA" ? estado : null;

    const ordenes = await db.$queryRaw<OrdenVueloRow[]>`
      SELECT
        o."id", o."numeroOrden", o."prospectoId",
        CONCAT(p."nombres", CASE WHEN p."apellidos" IS NOT NULL AND p."apellidos" <> '' THEN CONCAT(' ', p."apellidos") ELSE '' END) AS "prospectoNombre",
        p."telefono" AS "prospectoTelefono", o."tipoViaje", o."origen", o."destino",
        o."fechaIda", o."fechaRetorno", o."tramos", o."flexibilidad", o."equipaje",
        o."observaciones", o."estado", o."creadoPorId", u."name" AS "creadoPorNombre",
        o."createdAt", o."despachadoAt"
      FROM "orden_cotizacion_vuelo" o
      INNER JOIN "prospecto" p ON p."id" = o."prospectoId"
      INNER JOIN "user" u ON u."id" = o."creadoPorId"
      WHERE p."deletedAt" IS NULL
        AND (${filtroEstado}::text IS NULL OR o."estado" = ${filtroEstado})
      ORDER BY o."createdAt" DESC
    `;

    return NextResponse.json({ ordenes });
  } catch (error) {
    console.error("Error al obtener ordenes de vuelos:", error);
    return NextResponse.json({ error: "No se pudieron obtener las órdenes de cotización" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureVuelosSchema();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const prospectoId = typeof body.prospectoId === "string" ? body.prospectoId.trim() : "";
    const tipoViaje = tipoValido(body.tipoViaje);
    const flexibilidad = body.flexibilidad === true;
    const equipaje = body.equipaje === true;
    const observaciones = typeof body.observaciones === "string" && body.observaciones.trim() ? body.observaciones.trim() : null;

    if (!prospectoId) return NextResponse.json({ error: "Primero debes seleccionar un prospecto registrado" }, { status: 400 });

    let origen = normalizarIata(body.origen);
    let destino = normalizarIata(body.destino);
    let fechaIda = new Date(body.fechaIda);
    let fechaRetorno: Date | null = body.fechaRetorno ? new Date(body.fechaRetorno) : null;
    let tramos: Tramo[] | null = null;

    if (tipoViaje === "MULTIPLE") {
      tramos = Array.isArray(body.tramos)
        ? body.tramos.map((t: Tramo) => ({ origen: normalizarIata(t.origen), destino: normalizarIata(t.destino), fecha: t.fecha }))
        : [];
      if (tramos.length < 2 || !tramos.every(tramoValido)) {
        return NextResponse.json({ error: "El viaje múltiple requiere al menos 2 tramos completos y válidos" }, { status: 400 });
      }
      for (let i = 1; i < tramos.length; i += 1) {
        if (new Date(tramos[i].fecha) < new Date(tramos[i - 1].fecha)) {
          return NextResponse.json({ error: "Las fechas de los tramos deben estar en orden cronológico" }, { status: 400 });
        }
      }
      origen = tramos[0].origen;
      destino = tramos[tramos.length - 1].destino;
      fechaIda = new Date(tramos[0].fecha);
      fechaRetorno = null;
    } else {
      if (!/^[A-Z]{3}$/.test(origen) || !/^[A-Z]{3}$/.test(destino) || origen === destino) {
        return NextResponse.json({ error: "Selecciona aeropuertos de origen y destino válidos" }, { status: 400 });
      }
      if (Number.isNaN(fechaIda.getTime())) return NextResponse.json({ error: "La fecha de ida es obligatoria" }, { status: 400 });
      if (tipoViaje === "IDA_VUELTA") {
        if (!fechaRetorno || Number.isNaN(fechaRetorno.getTime())) return NextResponse.json({ error: "La fecha de retorno es obligatoria para ida y vuelta" }, { status: 400 });
        if (fechaRetorno < fechaIda) return NextResponse.json({ error: "La fecha de retorno no puede ser anterior a la ida" }, { status: 400 });
      } else {
        fechaRetorno = null;
      }
    }

    const prospecto = await db.prospecto.findFirst({ where: { id: prospectoId, deletedAt: null }, select: { id: true, nombres: true, apellidos: true, telefono: true } });
    if (!prospecto) return NextResponse.json({ error: "El prospecto seleccionado no existe o fue eliminado" }, { status: 404 });

    const anio = new Date().getFullYear();
    const id = crypto.randomUUID();
    const tramosJson = tramos ? JSON.stringify(tramos) : null;

    const orden = await db.$transaction(async (tx) => {
      const contador = await tx.$queryRaw<Array<{ ultimo: number }>>`
        INSERT INTO "orden_cotizacion_vuelo_contador" ("anio", "ultimo") VALUES (${anio}, 1)
        ON CONFLICT ("anio") DO UPDATE SET "ultimo" = "orden_cotizacion_vuelo_contador"."ultimo" + 1 RETURNING "ultimo"
      `;
      const numeroOrden = `VUE-${anio}-${String(Number(contador[0]?.ultimo ?? 1)).padStart(4, "0")}`;
      const creada = await tx.$queryRaw<OrdenVueloRow[]>`
        INSERT INTO "orden_cotizacion_vuelo" (
          "id", "numeroOrden", "prospectoId", "tipoViaje", "origen", "destino", "fechaIda", "fechaRetorno", "tramos",
          "flexibilidad", "equipaje", "observaciones", "estado", "creadoPorId", "createdAt", "updatedAt"
        ) VALUES (
          ${id}, ${numeroOrden}, ${prospectoId}, ${tipoViaje}, ${origen}, ${destino}, ${fechaIda}, ${fechaRetorno},
          CASE WHEN ${tramosJson}::text IS NULL THEN NULL ELSE ${tramosJson}::jsonb END,
          ${flexibilidad}, ${equipaje}, ${observaciones}, 'PENDIENTE', ${session.user.id}, NOW(), NOW()
        )
        RETURNING "id", "numeroOrden", "prospectoId", '' AS "prospectoNombre", '' AS "prospectoTelefono", "tipoViaje", "origen", "destino", "fechaIda", "fechaRetorno", "tramos", "flexibilidad", "equipaje", "observaciones", "estado", "creadoPorId", '' AS "creadoPorNombre", "createdAt", "despachadoAt"
      `;
      return creada[0];
    });

    return NextResponse.json({ orden: { ...orden, prospectoNombre: `${prospecto.nombres}${prospecto.apellidos ? ` ${prospecto.apellidos}` : ""}`, prospectoTelefono: prospecto.telefono, creadoPorNombre: session.user.name ?? "—" } }, { status: 201 });
  } catch (error) {
    console.error("Error al crear orden de vuelo:", error);
    return NextResponse.json({ error: "No se pudo crear la orden de cotización" }, { status: 500 });
  }
}
