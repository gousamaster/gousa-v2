"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type HijoCliente = {
  id: string;
  nombreCompleto: string;
  fechaNacimiento: string | null;
  ocupacion: string | null;
};

export type VisaChinaAnterior = {
  id: string;
  numeroVisa: string | null;
  tipoVisa: string | null;
  fechaEmision: string | null;
  fechaVencimiento: string | null;
};

type HijoRow = {
  id: string;
  nombre_completo: string;
  fecha_nacimiento: Date | null;
  ocupacion: string | null;
};

type VisaRow = {
  id: string;
  numero_visa: string | null;
  tipo_visa: string | null;
  fecha_emision: Date | null;
  fecha_vencimiento: Date | null;
};

const fecha = (value: Date | null) => value ? value.toISOString().slice(0, 10) : null;
const nullable = (value?: string | null) => value?.trim() || null;

export async function obtenerHijosCliente(clienteId: string) {
  try {
    const rows = await db.$queryRaw<HijoRow[]>`
      SELECT id, nombre_completo, fecha_nacimiento, ocupacion
      FROM cliente_hijo
      WHERE cliente_id = ${clienteId}
      ORDER BY created_at ASC
    `;
    return { success: true as const, data: rows.map((r) => ({ id: r.id, nombreCompleto: r.nombre_completo, fechaNacimiento: fecha(r.fecha_nacimiento), ocupacion: r.ocupacion })) };
  } catch (error) {
    console.error("Error al obtener hijos:", error);
    return { success: false as const, error: "No se pudieron cargar los hijos" };
  }
}

export async function agregarHijoCliente(clienteId: string, input: { nombreCompleto: string; fechaNacimiento?: string | null; ocupacion?: string | null }) {
  const nombre = input.nombreCompleto.trim();
  if (!nombre) return { success: false as const, error: "El nombre del hijo es requerido" };
  try {
    await db.$executeRaw`
      INSERT INTO cliente_hijo (cliente_id, nombre_completo, fecha_nacimiento, ocupacion)
      VALUES (${clienteId}, ${nombre}, ${nullable(input.fechaNacimiento)}::date, ${nullable(input.ocupacion)})
    `;
    revalidatePath(`/clients/${clienteId}`);
    return { success: true as const };
  } catch (error) {
    console.error("Error al agregar hijo:", error);
    return { success: false as const, error: "No se pudo guardar el hijo" };
  }
}

export async function eliminarHijoCliente(clienteId: string, hijoId: string) {
  try {
    await db.$executeRaw`DELETE FROM cliente_hijo WHERE id = ${hijoId} AND cliente_id = ${clienteId}`;
    revalidatePath(`/clients/${clienteId}`);
    return { success: true as const };
  } catch (error) {
    console.error("Error al eliminar hijo:", error);
    return { success: false as const, error: "No se pudo eliminar el hijo" };
  }
}

export async function obtenerVisasChinaAnteriores(clienteId: string) {
  try {
    const rows = await db.$queryRaw<VisaRow[]>`
      SELECT id, numero_visa, tipo_visa, fecha_emision, fecha_vencimiento
      FROM cliente_visa_china_anterior
      WHERE cliente_id = ${clienteId}
      ORDER BY fecha_emision DESC NULLS LAST, created_at DESC
    `;
    return { success: true as const, data: rows.map((r) => ({ id: r.id, numeroVisa: r.numero_visa, tipoVisa: r.tipo_visa, fechaEmision: fecha(r.fecha_emision), fechaVencimiento: fecha(r.fecha_vencimiento) })) };
  } catch (error) {
    console.error("Error al obtener visas China anteriores:", error);
    return { success: false as const, error: "No se pudieron cargar las visas China anteriores" };
  }
}

export async function agregarVisaChinaAnterior(clienteId: string, input: { numeroVisa?: string | null; tipoVisa?: string | null; fechaEmision?: string | null; fechaVencimiento?: string | null }) {
  if (!nullable(input.numeroVisa) && !nullable(input.tipoVisa) && !nullable(input.fechaEmision) && !nullable(input.fechaVencimiento)) {
    return { success: false as const, error: "Registra al menos un dato de la visa anterior" };
  }
  try {
    await db.$executeRaw`
      INSERT INTO cliente_visa_china_anterior (cliente_id, numero_visa, tipo_visa, fecha_emision, fecha_vencimiento)
      VALUES (${clienteId}, ${nullable(input.numeroVisa)}, ${nullable(input.tipoVisa)}, ${nullable(input.fechaEmision)}::date, ${nullable(input.fechaVencimiento)}::date)
    `;
    revalidatePath(`/clients/${clienteId}`);
    return { success: true as const };
  } catch (error) {
    console.error("Error al agregar visa China anterior:", error);
    return { success: false as const, error: "No se pudo guardar la visa China anterior" };
  }
}

export async function eliminarVisaChinaAnterior(clienteId: string, visaId: string) {
  try {
    await db.$executeRaw`DELETE FROM cliente_visa_china_anterior WHERE id = ${visaId} AND cliente_id = ${clienteId}`;
    revalidatePath(`/clients/${clienteId}`);
    return { success: true as const };
  } catch (error) {
    console.error("Error al eliminar visa China anterior:", error);
    return { success: false as const, error: "No se pudo eliminar la visa China anterior" };
  }
}
