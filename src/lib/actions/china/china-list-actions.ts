"use server";

import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";

export type ChinaCaseItem = {
  tramiteId: string;
  clienteId: string;
  cliente: string;
  servicio: string;
  region: string;
  createdAt: Date;
};

export async function obtenerCasosVisaChina(): Promise<ActionResult<ChinaCaseItem[]>> {
  try {
    const tramites = await db.tramite.findMany({
      where: {
        deletedAt: null,
        clienteServicio: {
          deletedAt: null,
          servicio: { nombre: { contains: "Visa China", mode: "insensitive" } },
        },
      },
      select: {
        id: true,
        createdAt: true,
        cliente: { select: { id: true, nombres: true, apellidos: true, region: { select: { nombre: true } } } },
        clienteServicio: { select: { servicio: { select: { nombre: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return {
      success: true,
      data: tramites.map((t) => ({
        tramiteId: t.id,
        clienteId: t.cliente.id,
        cliente: `${t.cliente.nombres} ${t.cliente.apellidos}`,
        servicio: t.clienteServicio.servicio.nombre,
        region: t.cliente.region.nombre,
        createdAt: t.createdAt,
      })),
    };
  } catch (error) {
    console.error("Error listando casos Visa China", error);
    return { success: false, error: "No se pudieron cargar los casos de Visa China" };
  }
}
