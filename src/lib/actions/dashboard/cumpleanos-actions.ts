"use server";

import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";

export type CumpleanosHoy = {
  id: string;
  nombreCompleto: string;
  edad: number;
  telefono: string | null;
  email: string | null;
};

export async function obtenerCumpleanosHoy(): Promise<ActionResult<CumpleanosHoy[]>> {
  try {
    const partes = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/La_Paz",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const valor = (tipo: Intl.DateTimeFormatPartTypes) => Number(partes.find((p) => p.type === tipo)?.value ?? 0);
    const anio = valor("year");
    const mes = valor("month");
    const dia = valor("day");

    const clientes = await db.$queryRaw<
      Array<{
        id: string;
        nombres: string;
        apellidos: string;
        fechaNacimiento: Date;
        telefonoCelular: string | null;
        email: string | null;
      }>
    >`
      SELECT "id", "nombres", "apellidos", "fechaNacimiento", "telefonoCelular", "email"
      FROM "cliente"
      WHERE "deletedAt" IS NULL
        AND "activo" = TRUE
        AND "fechaNacimiento" IS NOT NULL
        AND EXTRACT(MONTH FROM "fechaNacimiento") = ${mes}
        AND EXTRACT(DAY FROM "fechaNacimiento") = ${dia}
      ORDER BY "apellidos" ASC, "nombres" ASC
    `;

    return {
      success: true,
      data: clientes.map((c) => ({
        id: c.id,
        nombreCompleto: `${c.nombres} ${c.apellidos}`,
        edad: anio - new Date(c.fechaNacimiento).getUTCFullYear(),
        telefono: c.telefonoCelular,
        email: c.email,
      })),
    };
  } catch (error) {
    console.error("Error cumpleaños NEXUS:", error);
    return { success: false, error: "Error al obtener cumpleaños" };
  }
}
