import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureVuelosSchema } from "@/lib/vuelos-schema";

type TipoViaje = "SOLO_IDA" | "IDA_VUELTA" | "MULTIPLE";
type TipoPersona = "PROSPECTO" | "CLIENTE";
type Tramo = { origen: string; destino: string; fecha: string };

type OrdenVueloRow = {
  id: string;
  numeroOrden: string;
  prospectoId: string | null;
  clienteId: string | null;
  tipoPersona: TipoPersona;
  personaNombre: string;
  personaTelefono: string;
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
function tipoViajeValido(value: unknown): TipoViaje {
  return value === "SOLO_IDA" || value === "MULTIPLE" ? value : "IDA_VUELTA";
}
function tipoPersonaValido(value: unknown): TipoPersona {
  return value === "CLIENTE" ? "CLIENTE" : "PROSPECTO";
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

    const baseQuery = `
      SELECT
        o."id", o."numeroOrden", o."prospectoId", o."clienteId",
        CASE WHEN o."clienteId" IS NOT NULL THEN 'CLIENTE' ELSE 'PROSPECTO' END AS "tipoPersona",
        CASE
          WHEN o."clienteId" IS NOT NULL THEN CONCAT(c."nombres", ' ', c."apellidos")
          ELSE CONCAT(p."nombres", CASE WHEN p."apellidos" IS NOT NULL AND p."apellidos" <> '' THEN CONCAT(' ', p."apellidos") ELSE '' END)
        END AS "personaNombre",
        COALESCE(c."telefonoCelular", p."telefono", '') AS "personaTelefono",
        o."tipoViaje", o."origen", o."destino", o."fechaIda", o."fechaRetorno", o."tramos",
        o."flexibilidad", o."equipaje", o."observaciones", o."estado", o."creadoPorId",
        u."name" AS "creadoPorNombre", o."createdAt", o."despachadoAt"
      FROM "orden_cotizacion_vuelo" o
      LEFT JOIN "prospecto" p ON p."id" = o."prospectoId"
      LEFT JOIN "cliente" c ON c."id" = o."clienteId"
      INNER JOIN "user" u ON u."id" = o."creadoPorId"
      WHERE (o."prospectoId" IS NULL OR p."deletedAt" IS NULL)
        AND (o."clienteId" IS NULL OR (c."deletedAt" IS NULL AND c."activo" = true))
    `;

    const ordenes = filtroEstado
      ? await db.$queryRawUnsafe<OrdenVueloRow[]>(`${baseQuery} AND o."estado" = $1 ORDER BY o."createdAt" DESC`, filtroEstado)
      : await db.$queryRawUnsafe<OrdenVueloRow[]>(`${baseQuery} ORDER BY o."createdAt" DESC`);

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
    const tipoPersona = tipoPersonaValido(body.tipoPersona);
    const personaId = typeof body.personaId === "string" ? body.personaId.trim() : "";
    const tipoViaje = tipoViajeValido(body.tipoViaje);
    const flexibilidad = body.flexibilidad === true;
    const equipaje = body.equipaje === true;
    const observaciones = typeof body.observaciones === "string" && body.observaciones.trim() ? body.observaciones.trim() : null;

    if (!personaId) return NextResponse.json({ error: `Primero debes seleccionar un ${tipoPersona === "CLIENTE" ? "cliente" : "prospecto"}` }, { status: 400 });

    let personaNombre = "";
    let personaTelefono = "";
    let prospectoId: string | null = null;
    let clienteId: string | null = null;

    if (tipoPersona === "CLIENTE") {
      const cliente = await db.cliente.findFirst({ where: { id: personaId, deletedAt: null, activo: true }, select: { id: true, nombres: true, apellidos: true, telefonoCelular: true } });
      if (!cliente) return NextResponse.json({ error: "El cliente seleccionado no existe o está inactivo" }, { status: 404 });
      clienteId = cliente.id;
      personaNombre = `${cliente.nombres} ${cliente.apellidos}`.trim();
      personaTelefono = cliente.telefonoCelular ?? "";
    } else {
      const prospecto = await db.prospecto.findFirst({ where: { id: personaId, deletedAt: null }, select: { id: true, nombres: true, apellidos: true, telefono: true } });
      if (!prospecto) return NextResponse.json({ error: "El prospecto seleccionado no existe o fue eliminado" }, { status: 404 });
      prospectoId = prospecto.id;
      personaNombre = `${prospecto.nombres}${prospecto.apellidos ? ` ${prospecto.apellidos}` : ""}`;
      personaTelefono = prospecto.telefono;
    }

    let origen = normalizarIata(body.origen);
    let destino = normalizarIata(body.destino);
    let fechaIda = new Date(body.fechaIda);
    let fechaRetorno: Date | null = body.fechaRetorno ? new Date(body.fechaRetorno) : null;
    let tramos: Tramo[] | null = null;

    if (tipoViaje === "MULTIPLE") {
      tramos = Array.isArray(body.tramos) ? body.tramos.map((t: Tramo) => ({ origen: normalizarIata(t.origen), destino: normalizarIata(t.destino), fecha: t.fecha })) : [];
      if (tramos.length < 2 || !tramos.every(tramoValido)) return NextResponse.json({ error: "El viaje múltiple requiere al menos 2 tramos completos y válidos" }, { status: 400 });
      for (let i = 1; i < tramos.length; i += 1) {
        if (new Date(tramos[i].fecha) < new Date(tramos[i - 1].fecha)) return NextResponse.json({ error: "Las fechas de los tramos deben estar en orden cronológico" }, { status: 400 });
      }
      origen = tramos[0].origen;
      destino = tramos[tramos.length - 1].destino;
      fechaIda = new Date(tramos[0].fecha);
      fechaRetorno = null;
    } else {
      if (!/^[A-Z]{3}$/.test(origen) || !/^[A-Z]{3}$/.test(destino) || origen === destino) return NextResponse.json({ error: "Selecciona aeropuertos de origen y destino válidos" }, { status: 400 });
      if (Number.isNaN(fechaIda.getTime())) return NextResponse.json({ error: "La fecha de ida es obligatoria" }, { status: 400 });
      if (tipoViaje === "IDA_VUELTA") {
        if (!fechaRetorno || Number.isNaN(fechaRetorno.getTime())) return NextResponse.json({ error: "La fecha de retorno es obligatoria para ida y vuelta" }, { status: 400 });
        if (fechaRetorno < fechaIda) return NextResponse.json({ error: "La fecha de retorno no puede ser anterior a la ida" }, { status: 400 });
      } else fechaRetorno = null;
    }

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
          "id", "numeroOrden", "prospectoId", "clienteId", "tipoViaje", "origen", "destino", "fechaIda", "fechaRetorno", "tramos",
          "flexibilidad", "equipaje", "observaciones", "estado", "creadoPorId", "createdAt", "updatedAt"
        ) VALUES (
          ${id}, ${numeroOrden}, ${prospectoId}, ${clienteId}, ${tipoViaje}, ${origen}, ${destino}, ${fechaIda}, ${fechaRetorno},
          CASE WHEN ${tramosJson}::text IS NULL THEN NULL ELSE ${tramosJson}::jsonb END,
          ${flexibilidad}, ${equipaje}, ${observaciones}, 'PENDIENTE', ${session.user.id}, NOW(), NOW()
        )
        RETURNING "id", "numeroOrden", "prospectoId", "clienteId", ${tipoPersona} AS "tipoPersona", ${personaNombre} AS "personaNombre", ${personaTelefono} AS "personaTelefono", "tipoViaje", "origen", "destino", "fechaIda", "fechaRetorno", "tramos", "flexibilidad", "equipaje", "observaciones", "estado", "creadoPorId", ${session.user.name ?? "—"} AS "creadoPorNombre", "createdAt", "despachadoAt"
      `;
      return creada[0];
    });

    return NextResponse.json({ orden }, { status: 201 });
  } catch (error) {
    console.error("Error al crear orden de vuelo:", error);
    return NextResponse.json({ error: "No se pudo crear la orden de cotización" }, { status: 500 });
  }
}
