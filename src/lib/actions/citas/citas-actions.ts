// src/lib/actions/citas/citas-actions.ts

"use server";

import { db } from "@/lib/db";
import { parseLocalDateTime } from "@/lib/utils/date-timezone";
import type { ActionResult } from "@/types/action-result-types";
import {
  type CreateCitaFormData,
  createCitaSchema,
  type RegistrarAsistenciaFormData,
  registrarAsistenciaSchema,
  type UpdateCitaFormData,
  updateCitaSchema,
} from "@/validations/cita-validations";

export type CitaListItem = {
  id: string;
  fechaHora: Date;
  lugar: string | null;
  precioFinal: number;
  estado: string;
  notas: string | null;
  tipoCita: { nombre: string };
  estadoPago: { nombre: string; color: string | null };
  tramite: {
    id: string;
    cliente: { nombres: string; apellidos: string };
    servicio: { nombre: string };
  } | null;
  grupoFamiliar: { id: string; nombre: string } | null;
  _count: { participantes: number };
};

export type CitaDetalle = CitaListItem & {
  participantes: Array<{
    id: string;
    asistio: boolean;
    notas: string | null;
    tramite: {
      id: string;
      cliente: { id: string; nombres: string; apellidos: string };
      servicio: { nombre: string };
    };
  }>;
};

const citaSelect = {
  id: true,
  fechaHora: true,
  lugar: true,
  precioFinal: true,
  estado: true,
  notas: true,
  tipoCita: { select: { nombre: true } },
  estadoPago: { select: { nombre: true, color: true } },
  tramite: {
    select: {
      id: true,
      cliente: { select: { nombres: true, apellidos: true } },
      clienteServicio: { select: { servicio: { select: { nombre: true } } } },
    },
  },
  grupoFamiliar: { select: { id: true, nombre: true } },
  _count: { select: { participantes: true } },
} as const;

function mapCita(raw: any): CitaListItem {
  return {
    ...raw,
    precioFinal: Number(raw.precioFinal),
    tramite: raw.tramite
      ? {
          id: raw.tramite.id,
          cliente: raw.tramite.cliente,
          servicio: raw.tramite.clienteServicio.servicio,
        }
      : null,
  };
}

export async function obtenerCitasPorTramite(
  tramiteId: string,
): Promise<ActionResult<CitaListItem[]>> {
  try {
    const citas = await db.cita.findMany({
      where: { tramiteId, deletedAt: null },
      select: citaSelect,
      orderBy: { fechaHora: "desc" },
    });
    return { success: true, data: citas.map(mapCita) };
  } catch (error) {
    console.error("Error al obtener citas del trámite:", error);
    return { success: false, error: "Error al obtener las citas" };
  }
}

export async function obtenerCitasPorGrupoFamiliar(
  grupoFamiliarId: string,
): Promise<ActionResult<CitaListItem[]>> {
  try {
    const citas = await db.cita.findMany({
      where: { grupoFamiliarId, deletedAt: null },
      select: citaSelect,
      orderBy: { fechaHora: "desc" },
    });
    return { success: true, data: citas.map(mapCita) };
  } catch (error) {
    console.error("Error al obtener citas del grupo:", error);
    return { success: false, error: "Error al obtener las citas" };
  }
}

export async function obtenerTodasLasCitas(filtros?: {
  tipoCitaId?: string;
  estado?: string;
  query?: string;
}): Promise<ActionResult<CitaListItem[]>> {
  try {
    const where: any = { deletedAt: null };
    if (filtros?.tipoCitaId) where.tipoCitaId = filtros.tipoCitaId;
    if (filtros?.estado) where.estado = filtros.estado;
    if (filtros?.query) {
      where.OR = [
        {
          tramite: {
            cliente: {
              nombres: { contains: filtros.query, mode: "insensitive" },
            },
          },
        },
        {
          tramite: {
            cliente: {
              apellidos: { contains: filtros.query, mode: "insensitive" },
            },
          },
        },
        {
          grupoFamiliar: {
            nombre: { contains: filtros.query, mode: "insensitive" },
          },
        },
      ];
    }
    const citas = await db.cita.findMany({
      where,
      select: citaSelect,
      orderBy: { fechaHora: "desc" },
    });
    return { success: true, data: citas.map(mapCita) };
  } catch (error) {
    console.error("Error al obtener citas:", error);
    return { success: false, error: "Error al obtener las citas" };
  }
}

export async function obtenerCitaPorId(
  id: string,
): Promise<ActionResult<CitaDetalle>> {
  try {
    const cita = await db.cita.findUnique({
      where: { id },
      select: {
        ...citaSelect,
        participantes: {
          select: {
            id: true,
            asistio: true,
            notas: true,
            tramite: {
              select: {
                id: true,
                cliente: {
                  select: { id: true, nombres: true, apellidos: true },
                },
                clienteServicio: {
                  select: { servicio: { select: { nombre: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!cita) return { success: false, error: "Cita no encontrada" };

    return {
      success: true,
      data: {
        ...mapCita(cita),
        participantes: cita.participantes.map((p) => ({
          id: p.id,
          asistio: p.asistio,
          notas: p.notas,
          tramite: {
            id: p.tramite.id,
            cliente: p.tramite.cliente,
            servicio: p.tramite.clienteServicio.servicio,
          },
        })),
      },
    };
  } catch (error) {
    console.error("Error al obtener cita:", error);
    return { success: false, error: "Error al obtener la cita" };
  }
}

export async function crearCita(
  input: CreateCitaFormData,
  creadaPorId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = createCitaSchema.parse(input);

    const [tipoCita, estadoPago] = await Promise.all([
      db.catalogoTipoCita.findUnique({ where: { id: validated.tipoCitaId } }),
      db.catalogoEstadoPago.findUnique({
        where: { id: validated.estadoPagoId },
      }),
    ]);

    if (!tipoCita)
      return { success: false, error: "Tipo de cita no encontrado" };
    if (!estadoPago)
      return { success: false, error: "Estado de pago no encontrado" };

    const citaId = await db.$transaction(async (tx) => {
      const cita = await tx.cita.create({
        data: {
          tramiteId: validated.tramiteId ?? null,
          grupoFamiliarId: validated.grupoFamiliarId ?? null,
          tipoCitaId: validated.tipoCitaId,
          fechaHora: parseLocalDateTime(validated.fechaHora),
          lugar: validated.lugar ?? null,
          precioAcordado: validated.precioAcordado,
          descuentoAplicado: validated.descuentoAplicado ?? null,
          precioFinal: validated.precioFinal,
          estadoPagoId: validated.estadoPagoId,
          notas: validated.notas ?? null,
          creadaPorId,
        },
      });

      const tramiteIds = [
        ...(validated.tramiteId ? [validated.tramiteId] : []),
        ...(validated.participanteTramiteIds ?? []),
      ];

      if (tramiteIds.length > 0) {
        await tx.citaParticipante.createMany({
          data: tramiteIds.map((tramiteId) => ({
            citaId: cita.id,
            tramiteId,
          })),
          skipDuplicates: true,
        });
      }

      return cita.id;
    });

    return { success: true, data: { id: citaId } };
  } catch (error) {
    console.error("Error al crear cita:", error);
    return { success: false, error: "Error al crear la cita" };
  }
}

export async function actualizarCita(
  id: string,
  input: UpdateCitaFormData,
): Promise<ActionResult<void>> {
  try {
    const validated = updateCitaSchema.parse(input);

    const existe = await db.cita.findUnique({ where: { id } });
    if (!existe) return { success: false, error: "Cita no encontrada" };

    await db.cita.update({
      where: { id },
      data: {
        ...validated,
        fechaHora: validated.fechaHora
          ? parseLocalDateTime(validated.fechaHora)
          : undefined,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar cita:", error);
    return { success: false, error: "Error al actualizar la cita" };
  }
}

export async function registrarAsistencia(
  citaId: string,
  input: RegistrarAsistenciaFormData,
): Promise<ActionResult<void>> {
  try {
    const validated = registrarAsistenciaSchema.parse(input);

    const participante = await db.citaParticipante.findUnique({
      where: {
        citaId_tramiteId: { citaId, tramiteId: validated.tramiteId },
      },
    });

    if (!participante)
      return { success: false, error: "Participante no encontrado" };

    await db.citaParticipante.update({
      where: { citaId_tramiteId: { citaId, tramiteId: validated.tramiteId } },
      data: { asistio: validated.asistio, notas: validated.notas ?? null },
    });

    return { success: true };
  } catch (error) {
    console.error("Error al registrar asistencia:", error);
    return { success: false, error: "Error al registrar la asistencia" };
  }
}

export async function obtenerTiposCita(): Promise<
  ActionResult<
    Array<{ id: string; nombre: string; precioRegion: number | null }>
  >
> {
  try {
    const tipos = await db.catalogoTipoCita.findMany({
      where: { activo: true },
      select: { id: true, nombre: true },
      orderBy: { orden: "asc" },
    });
    return {
      success: true,
      data: tipos.map((t) => ({ ...t, precioRegion: null })),
    };
  } catch (error) {
    console.error("Error al obtener tipos de cita:", error);
    return { success: false, error: "Error al obtener los tipos de cita" };
  }
}

export async function obtenerTiposCitaConPrecio(
  regionId: string,
): Promise<
  ActionResult<
    Array<{ id: string; nombre: string; precioRegion: number | null }>
  >
> {
  try {
    const tipos = await db.catalogoTipoCita.findMany({
      where: { activo: true },
      include: {
        preciosPorRegion: {
          where: { regionId, activo: true },
          take: 1,
        },
      },
      orderBy: { orden: "asc" },
    });

    return {
      success: true,
      data: tipos.map((t) => ({
        id: t.id,
        nombre: t.nombre,
        precioRegion: t.preciosPorRegion[0]
          ? Number(t.preciosPorRegion[0].precio)
          : null,
      })),
    };
  } catch (error) {
    console.error("Error al obtener tipos de cita con precio:", error);
    return { success: false, error: "Error al obtener los tipos de cita" };
  }
}
