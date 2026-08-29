"use server";

import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";

export type ContextoCitaFamiliar = {
  grupoFamiliarId: string | null;
  grupoNombre: string | null;
  tramitesDisponibles: Array<{
    id: string;
    cliente: { nombres: string; apellidos: string };
    servicio: { nombre: string };
  }>;
};

export async function obtenerContextoCitaFamiliar(tramiteId: string): Promise<ActionResult<ContextoCitaFamiliar>> {
  try {
    const base = await db.tramite.findUnique({
      where: { id: tramiteId },
      select: { clienteId: true, clienteServicio: { select: { servicio: { select: { nombre: true } } } } },
    });
    if (!base) return { success: false, error: "Trámite no encontrado" };

    const grupoRows = await db.$queryRaw<Array<{ grupoFamiliarId: string; nombre: string }>>`
      SELECT gf."id" AS "grupoFamiliarId", gf."nombre"
      FROM "grupo_familiar_miembro" gfm
      JOIN "grupo_familiar" gf ON gf."id" = gfm."grupoFamiliarId"
      WHERE gfm."clienteId" = ${base.clienteId}
        AND gf."activo" = TRUE
        AND gf."deletedAt" IS NULL
      ORDER BY gf."createdAt" DESC
      LIMIT 1
    `;

    const grupo = grupoRows[0];
    if (!grupo) return { success: true, data: { grupoFamiliarId: null, grupoNombre: null, tramitesDisponibles: [] } };

    const esRenovacion = /renovaci/i.test(base.clienteServicio.servicio.nombre);

    const rows = await db.$queryRaw<Array<{ id: string; nombres: string; apellidos: string; servicioNombre: string }>>`
      SELECT DISTINCT ON (t."clienteId")
        t."id", c."nombres", c."apellidos", s."nombre" AS "servicioNombre"
      FROM "grupo_familiar_miembro" gfm
      JOIN "cliente" c ON c."id" = gfm."clienteId"
      JOIN "tramite" t ON t."clienteId" = c."id" AND t."deletedAt" IS NULL
      JOIN "cliente_servicio" cs ON cs."id" = t."clienteServicioId"
      JOIN "catalogo_servicio" s ON s."id" = cs."servicioId"
      LEFT JOIN "cliente_afiliado" ca ON ca."clienteId" = c."id" AND ca."afiliado" = TRUE
      WHERE gfm."grupoFamiliarId" = ${grupo.grupoFamiliarId}
        AND c."activo" = TRUE
        AND c."deletedAt" IS NULL
        AND ca."clienteId" IS NULL
        AND s."nombre" !~* 'visa\\s*china'
        AND (${esRenovacion} = (s."nombre" ~* 'renovaci'))
      ORDER BY t."clienteId", t."createdAt" DESC
    `;

    return {
      success: true,
      data: {
        grupoFamiliarId: grupo.grupoFamiliarId,
        grupoNombre: grupo.nombre,
        tramitesDisponibles: rows.map((r) => ({
          id: r.id,
          cliente: { nombres: r.nombres, apellidos: r.apellidos },
          servicio: { nombre: r.servicioNombre },
        })),
      },
    };
  } catch (error) {
    console.error("Error obteniendo contexto familiar para cita:", error);
    return { success: false, error: "No se pudo cargar el grupo familiar para la cita" };
  }
}
