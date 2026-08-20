import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { esOrigenProspecto } from "@/lib/prospectos/origenes";
import { detectarProspectoDuplicado } from "@/lib/prospectos/deduplicacion";
import { alcanceProspectos, idsProspectosAsignados } from "@/lib/prospectos/permisos";
import { registrarAuditoriaProspecto } from "@/lib/prospectos/auditoria";

type ResponsableActualRow = {
  prospectoId: string;
  responsableId: string | null;
  responsableNombre: string | null;
};

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const alcance = await alcanceProspectos(session.user.id);
    const asignados = alcance.accesoTotal ? [] : await idsProspectosAsignados(session.user.id);
    const where = alcance.accesoTotal
      ? { deletedAt: null }
      : {
          deletedAt: null,
          OR: [
            { creadoPorId: { in: alcance.userIds } },
            ...(asignados.length ? [{ id: { in: asignados } }] : []),
          ],
        };

    const responsablesWhere = alcance.accesoTotal
      ? { status: "ACTIVE", banned: { not: true } }
      : { id: { in: alcance.userIds }, status: "ACTIVE", banned: { not: true } };

    const [prospectosBase, responsables, responsablesActuales] = await Promise.all([
      db.prospecto.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          creadoPor: { select: { id: true, name: true, email: true } },
          convertidoPor: { select: { id: true, name: true, email: true } },
          cliente: { select: { id: true, nombres: true, apellidos: true } },
        },
      }),
      db.user.findMany({
        where: responsablesWhere,
        orderBy: { name: "asc" },
        select: { id: true, name: true, email: true },
      }),
      db.$queryRaw<ResponsableActualRow[]>`
        SELECT p."id" AS "prospectoId", p."responsable_comercial_id" AS "responsableId", u."name" AS "responsableNombre"
        FROM "prospecto" p
        LEFT JOIN "user" u ON u."id"=p."responsable_comercial_id"
        WHERE p."deletedAt" IS NULL
      `,
    ]);

    const idsVisibles = new Set(prospectosBase.map((prospecto) => prospecto.id));
    const responsablePorProspecto = new Map(
      responsablesActuales
        .filter((item) => idsVisibles.has(item.prospectoId))
        .map((item) => [
          item.prospectoId,
          { id: item.responsableId, name: item.responsableNombre },
        ]),
    );

    const prospectos = prospectosBase.map((prospecto) => ({
      ...prospecto,
      responsableActual: responsablePorProspecto.get(prospecto.id) ?? null,
    }));

    return NextResponse.json({ prospectos, responsables });
  } catch (error) {
    console.error("Error al obtener prospectos:", error);
    return NextResponse.json({ error: "No se pudieron obtener los prospectos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const nombres = typeof body.nombres === "string" ? body.nombres.trim() : "";
    const apellidos = typeof body.apellidos === "string" ? body.apellidos.trim() : null;
    const telefono = typeof body.telefono === "string" ? body.telefono.trim() : "";
    const email = typeof body.email === "string" && body.email.trim() ? body.email.trim() : null;
    const origen = typeof body.origen === "string" ? body.origen.trim().toUpperCase() : "";
    const origenDetalle = typeof body.origenDetalle === "string" ? body.origenDetalle.trim() || null : null;

    if (!nombres || !telefono) return NextResponse.json({ error: "Nombre y teléfono son obligatorios" }, { status: 400 });
    if (origen && !esOrigenProspecto(origen)) return NextResponse.json({ error: "Origen del prospecto no válido" }, { status: 400 });

    const identidades = await db.prospecto.findMany({
      where: { deletedAt: null },
      select: { id: true, nombres: true, apellidos: true, telefono: true, email: true, convertido: true },
    });
    const duplicado = detectarProspectoDuplicado(identidades, telefono, email);
    if (duplicado) {
      const nombre = `${duplicado.prospecto.nombres} ${duplicado.prospecto.apellidos ?? ""}`.trim();
      return NextResponse.json({
        error: `Ya existe un prospecto con ${duplicado.coincidencia === "EMAIL" ? "ese email" : duplicado.coincidencia === "TELEFONO" ? "ese teléfono" : "ese teléfono y email"}: ${nombre}.`,
        code: "PROSPECTO_DUPLICADO",
        duplicado: { id: duplicado.prospecto.id, nombre, coincidencia: duplicado.coincidencia, convertido: Boolean(duplicado.prospecto.convertido) },
      }, { status: 409 });
    }

    const prospecto = await db.$transaction(async (tx) => {
      const creado = await tx.prospecto.create({
        data: {
          nombres, apellidos, telefono, email,
          ciudad: typeof body.ciudad === "string" ? body.ciudad.trim() || null : null,
          pais: typeof body.pais === "string" ? body.pais.trim() || "Bolivia" : "Bolivia",
          origen: origen || null,
          interes: typeof body.interes === "string" ? body.interes.trim() || null : null,
          observaciones: typeof body.observaciones === "string" ? body.observaciones.trim() || null : null,
          estado: "NUEVO",
          creadoPorId: session.user.id,
        },
        include: { creadoPor: { select: { id: true, name: true, email: true } } },
      });

      await tx.$executeRaw`UPDATE "prospecto" SET "origen_detalle" = ${origenDetalle} WHERE "id" = ${creado.id}`;
      await registrarAuditoriaProspecto(tx, {
        prospectoId: creado.id,
        usuarioId: session.user.id,
        accion: "CREACION",
        detalle: { origen: origen || null, estado: "NUEVO" },
      });
      return creado;
    });

    return NextResponse.json({ prospecto }, { status: 201 });
  } catch (error) {
    console.error("Error al crear prospecto:", error);
    return NextResponse.json({ error: "No se pudo crear el prospecto" }, { status: 500 });
  }
}
