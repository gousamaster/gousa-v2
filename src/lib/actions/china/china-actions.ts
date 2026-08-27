"use server";

import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";
import { ETAPAS_CHINA, type ChinaOperativo, type ChinaTimeItem, type EtapaChina, type SedeChina } from "@/lib/actions/china/china-types";

type ChinaRow = {
  tramite_id: string;
  etapa: EtapaChina;
  hijos: unknown;
  correo_base_cliente: string | null;
  correo_cuenta: string | null;
  contrasena_cuenta: string | null;
  formulario_iniciado: boolean;
  documentos_subidos: boolean;
  sede_embajada: SedeChina | null;
  cliente_notificado: boolean;
  fecha_notificacion: Date | null;
  fecha_presentacion: Date | null;
  guia_recojo_recibida: boolean;
  guia_recojo_referencia: string | null;
  guia_recojo_url: string | null;
  fecha_recojo: Date | null;
  pasaporte_recogido: boolean;
  fecha_pasaporte_recogido: Date | null;
  observaciones: string | null;
};

function dateOnly(v: Date | null) {
  return v ? v.toISOString().slice(0, 10) : null;
}

function mapRow(row: ChinaRow): ChinaOperativo {
  return {
    tramiteId: row.tramite_id,
    etapa: row.etapa,
    hijos: Array.isArray(row.hijos) ? row.hijos.filter((x): x is string => typeof x === "string") : [],
    correoBaseCliente: row.correo_base_cliente,
    correoCuenta: row.correo_cuenta,
    contrasenaCuenta: row.contrasena_cuenta,
    formularioIniciado: row.formulario_iniciado,
    documentosSubidos: row.documentos_subidos,
    sedeEmbajada: row.sede_embajada,
    clienteNotificado: row.cliente_notificado,
    fechaNotificacion: row.fecha_notificacion,
    fechaPresentacion: dateOnly(row.fecha_presentacion),
    guiaRecojoRecibida: row.guia_recojo_recibida,
    guiaRecojoReferencia: row.guia_recojo_referencia,
    guiaRecojoUrl: row.guia_recojo_url,
    fechaRecojo: dateOnly(row.fecha_recojo),
    pasaporteRecogido: row.pasaporte_recogido,
    fechaPasaporteRecogido: dateOnly(row.fecha_pasaporte_recogido),
    observaciones: row.observaciones,
  };
}

async function asegurarRegistro(tramiteId: string) {
  await db.$executeRaw`
    insert into china_tramite_operativo (tramite_id, etapa)
    values (${tramiteId}, 'RECOLECCION_DOCUMENTOS')
    on conflict (tramite_id) do nothing
  `;
}

export async function obtenerChinaOperativo(tramiteId: string): Promise<ActionResult<ChinaOperativo>> {
  try {
    await asegurarRegistro(tramiteId);
    const rows = await db.$queryRaw<ChinaRow[]>`
      select cto.tramite_id, cto.etapa, cto.hijos,
             c.email as correo_base_cliente,
             cto.correo_cuenta, cto.contrasena_cuenta,
             cto.formulario_iniciado, cto.documentos_subidos,
             cto.sede_embajada, cto.cliente_notificado, cto.fecha_notificacion, cto.fecha_presentacion,
             cto.guia_recojo_recibida, cto.guia_recojo_referencia, cto.guia_recojo_url,
             cto.fecha_recojo, cto.pasaporte_recogido, cto.fecha_pasaporte_recogido, cto.observaciones
      from china_tramite_operativo cto
      join tramite t on t.id = cto.tramite_id and t."deletedAt" is null
      join cliente c on c.id = t."clienteId" and c."deletedAt" is null
      where cto.tramite_id = ${tramiteId}
      limit 1
    `;
    if (!rows[0]) return { success: false, error: "No se pudo iniciar el flujo China" };
    return { success: true, data: mapRow(rows[0]) };
  } catch (error) {
    console.error("Error obteniendo flujo China", error);
    return { success: false, error: "Error al obtener el flujo de Visa China" };
  }
}

export async function guardarChinaOperativo(input: ChinaOperativo): Promise<ActionResult<void>> {
  try {
    if (!ETAPAS_CHINA.includes(input.etapa)) return { success: false, error: "Etapa China inválida" };
    if (input.sedeEmbajada && !["LA_PAZ", "SANTA_CRUZ"].includes(input.sedeEmbajada)) return { success: false, error: "Sede inválida" };
    await asegurarRegistro(input.tramiteId);
    const hijos = JSON.stringify(input.hijos.map((h) => h.trim()).filter(Boolean));
    const correoCuenta = input.correoCuenta?.trim() || null;
    const contrasenaCuenta = input.contrasenaCuenta?.trim() || null;
    await db.$executeRaw`
      update china_tramite_operativo set
        etapa = ${input.etapa},
        hijos = ${hijos}::jsonb,
        correo_cuenta = ${correoCuenta},
        contrasena_cuenta = ${contrasenaCuenta},
        formulario_iniciado = ${input.formularioIniciado},
        documentos_subidos = ${input.documentosSubidos},
        sede_embajada = ${input.sedeEmbajada},
        cliente_notificado = ${input.clienteNotificado},
        fecha_notificacion = case when ${input.clienteNotificado} and fecha_notificacion is null then now() else fecha_notificacion end,
        fecha_presentacion = ${input.fechaPresentacion ? new Date(`${input.fechaPresentacion}T12:00:00Z`) : null},
        guia_recojo_recibida = ${input.guiaRecojoRecibida},
        guia_recojo_referencia = ${input.guiaRecojoReferencia || null},
        guia_recojo_url = ${input.guiaRecojoUrl || null},
        fecha_recojo = ${input.fechaRecojo ? new Date(`${input.fechaRecojo}T12:00:00Z`) : null},
        pasaporte_recogido = ${input.pasaporteRecogido},
        fecha_pasaporte_recogido = ${input.fechaPasaporteRecogido ? new Date(`${input.fechaPasaporteRecogido}T12:00:00Z`) : null},
        observaciones = ${input.observaciones || null},
        updated_at = now()
      where tramite_id = ${input.tramiteId}
    `;
    return { success: true };
  } catch (error) {
    console.error("Error guardando flujo China", error);
    return { success: false, error: "Error al guardar el flujo de Visa China" };
  }
}

type ChinaTimeRow = {
  tramite_id: string;
  cliente_id: string;
  cliente: string;
  servicio: string;
  sede_embajada: SedeChina | null;
  cliente_notificado: boolean;
  fecha_notificacion: Date | null;
  fecha_recojo: Date | null;
  fecha_presentacion: Date | null;
};

export async function obtenerChinaDashboardTime(): Promise<ActionResult<ChinaTimeItem[]>> {
  try {
    const rows = await db.$queryRaw<ChinaTimeRow[]>`
      select cto.tramite_id, c.id as cliente_id,
             concat(c.nombres, ' ', c.apellidos) as cliente,
             cs.nombre as servicio, cto.sede_embajada, cto.cliente_notificado,
             cto.fecha_notificacion, cto.fecha_recojo, cto.fecha_presentacion
      from china_tramite_operativo cto
      join tramite t on t.id = cto.tramite_id and t."deletedAt" is null
      join cliente c on c.id = t."clienteId" and c."deletedAt" is null
      join cliente_servicio clis on clis.id = t."clienteServicioId" and clis."deletedAt" is null
      join catalogo_servicio cs on cs.id = clis."servicioId"
      where cto.pasaporte_recogido = false
        and (
          (cto.cliente_notificado = true and cto.fecha_presentacion is null)
          or cto.fecha_recojo is not null
        )
      order by cto.fecha_recojo nulls last, cto.fecha_notificacion asc
    `;
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const data = rows.map((r): ChinaTimeItem => {
      const recojo = r.fecha_recojo ? new Date(r.fecha_recojo) : null;
      const estado = recojo ? (recojo < hoy ? "RECOJO_VENCIDO" : "POR_RECOGER") : "NOTIFICADO";
      return { tramiteId:r.tramite_id, clienteId:r.cliente_id, cliente:r.cliente, servicio:r.servicio, sede:r.sede_embajada, estado, fechaNotificacion:r.fecha_notificacion, fechaRecojo:dateOnly(recojo) };
    });
    return { success:true, data };
  } catch (error) {
    console.error("Error Dashboard Time China", error);
    return { success:false, error:"Error al cargar pendientes de Visa China" };
  }
}
