"use server";

import { headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { registrarAuditoriaProspecto } from "@/lib/prospectos/auditoria";
import { detectarProspectoDuplicado } from "@/lib/prospectos/deduplicacion";
import type { ActionResult } from "@/types/action-result-types";
import type { ClienteListItem } from "@/types/cliente-types";
import {
  createClienteCompletoSchema,
  type CreateClienteCompletoFormData,
} from "@/validations/cliente-validations";

export type ClienteGestionComercial = ClienteListItem & {
  serviciosContratados: number;
  tramitesTotal: number;
  sinServicio: boolean;
};

export async function obtenerClientesParaGestionComercial(): Promise<ActionResult<ClienteGestionComercial[]>> {
  try {
    const clientes = await db.cliente.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        tipoCliente: true,
        email: true,
        telefonoCelular: true,
        activo: true,
        createdAt: true,
        region: { select: { nombre: true } },
        registradoPor: { select: { name: true } },
        _count: { select: { servicios: true, tramites: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: clientes.map((cliente) => ({
        id: cliente.id,
        nombres: cliente.nombres,
        apellidos: cliente.apellidos,
        nombreCompleto: `${cliente.nombres} ${cliente.apellidos}`.trim(),
        tipoCliente: cliente.tipoCliente,
        email: cliente.email,
        telefonoCelular: cliente.telefonoCelular,
        regionNombre: cliente.region.nombre,
        registradoPorNombre: cliente.registradoPor.name,
        activo: cliente.activo,
        createdAt: cliente.createdAt,
        serviciosContratados: cliente._count.servicios,
        tramitesTotal: cliente._count.tramites,
        sinServicio: cliente._count.servicios === 0 && cliente._count.tramites === 0,
      })),
    };
  } catch (error) {
    console.error("Error al obtener estado comercial de clientes:", error);
    return { success: false, error: "No se pudieron cargar los clientes" };
  }
}

export async function convertirProspectoAClienteCompleto(
  prospectoId: string,
  input: CreateClienteCompletoFormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "No autorizado" };

    const validated = createClienteCompletoSchema.parse(input);

    const resultado = await db.$transaction(async (tx) => {
      const bloqueado = await tx.$queryRaw<{
        id: string;
        estado: string;
        convertido: boolean;
        clienteId: string | null;
        responsableId: string | null;
      }[]>`
        SELECT "id", "estado", "convertido", "clienteId", "responsable_comercial_id" AS "responsableId"
        FROM "prospecto"
        WHERE "id"=${prospectoId} AND "deletedAt" IS NULL
        FOR UPDATE
      `;

      const prospecto = bloqueado[0];
      if (!prospecto) throw new Error("PROSPECTO_NO_ENCONTRADO");
      if (prospecto.convertido || prospecto.clienteId) throw new Error("PROSPECTO_YA_CONVERTIDO");

      const region = await tx.region.findFirst({ where: { id: validated.cliente.regionId, activo: true }, select: { id: true } });
      if (!region) throw new Error("REGION_INVALIDA");

      const registradoPorId = prospecto.responsableId || session.user.id;
      const usuario = await tx.user.findFirst({ where: { id: registradoPorId, status: "ACTIVE", banned: { not: true } }, select: { id: true } });
      if (!usuario) throw new Error("RESPONSABLE_INVALIDO");

      const nuevoCliente = await tx.cliente.create({
        data: {
          ...validated.cliente,
          registradoPorId,
        },
      });

      const operations = [];
      if (validated.datosPersonales && Object.keys(validated.datosPersonales).length > 0) operations.push(tx.clienteDatosPersonales.create({ data: { clienteId: nuevoCliente.id, ...validated.datosPersonales } }));
      if (validated.datosLaborales && Object.keys(validated.datosLaborales).length > 0) operations.push(tx.clienteDatosLaborales.create({ data: { clienteId: nuevoCliente.id, ...validated.datosLaborales } }));
      if (validated.datosAcademicos && Object.keys(validated.datosAcademicos).length > 0) operations.push(tx.clienteDatosAcademicos.create({ data: { clienteId: nuevoCliente.id, ...validated.datosAcademicos } }));
      if (validated.datosMatrimoniales && Object.keys(validated.datosMatrimoniales).length > 0) operations.push(tx.clienteDatosMatrimoniales.create({ data: { clienteId: nuevoCliente.id, ...validated.datosMatrimoniales } }));
      if (validated.datosPatrocinador && Object.keys(validated.datosPatrocinador).length > 0) operations.push(tx.clienteDatosPatrocinador.create({ data: { clienteId: nuevoCliente.id, ...validated.datosPatrocinador } }));
      if (validated.datosViaje && Object.keys(validated.datosViaje).length > 0) operations.push(tx.clienteDatosViaje.create({ data: { clienteId: nuevoCliente.id, ...validated.datosViaje } }));
      if (operations.length) await Promise.all(operations);

      await tx.prospecto.update({
        where: { id: prospectoId },
        data: {
          convertido: true,
          estado: "CONVERTIDO",
          clienteId: nuevoCliente.id,
          convertidoPorId: session.user.id,
          convertidoAt: new Date(),
        },
      });

      await tx.$executeRaw`UPDATE "prospecto" SET "primer_contacto_at"=COALESCE("primer_contacto_at",CURRENT_TIMESTAMP) WHERE "id"=${prospectoId}`;
      await tx.$executeRaw`UPDATE "prospecto_seguimiento" SET "estado"='CANCELADO', "completado_at"=CURRENT_TIMESTAMP, "notas_resultado"=COALESCE("notas_resultado",'') || CASE WHEN COALESCE("notas_resultado",'')='' THEN '' ELSE E'\n' END || 'Cancelado automáticamente: prospecto convertido en cliente.' WHERE "prospecto_id"=${prospectoId} AND "estado"='PENDIENTE'`;
      await tx.$executeRaw`INSERT INTO "prospecto_historial" ("id","prospecto_id","estado_anterior","estado_nuevo","motivo_perdida","cambiado_por_id","created_at") VALUES (${randomUUID()},${prospectoId},${prospecto.estado},'CONVERTIDO',NULL,${session.user.id},CURRENT_TIMESTAMP)`;
      await registrarAuditoriaProspecto(tx, {
        prospectoId,
        usuarioId: session.user.id,
        accion: "CONVERSION_COMPLETA",
        detalle: { clienteId: nuevoCliente.id, estadoAnterior: prospecto.estado, responsableComercialId: prospecto.responsableId, ejecutadoPorId: session.user.id },
      });

      return nuevoCliente.id;
    });

    return { success: true, data: { id: resultado } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "PROSPECTO_NO_ENCONTRADO") return { success: false, error: "Prospecto no encontrado" };
    if (message === "PROSPECTO_YA_CONVERTIDO") return { success: false, error: "Este prospecto ya fue convertido en cliente" };
    if (message === "REGION_INVALIDA") return { success: false, error: "Región no válida" };
    if (message === "RESPONSABLE_INVALIDO") return { success: false, error: "Responsable comercial no válido" };
    console.error("Error al convertir prospecto con ficha completa:", error);
    return { success: false, error: "No se pudo convertir el prospecto en cliente" };
  }
}

export async function convertirClienteSinServicioAProspecto(
  clienteId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "No autorizado" };

    const cliente = await db.cliente.findFirst({
      where: { id: clienteId, deletedAt: null },
      include: {
        _count: { select: { servicios: true, tramites: true } },
      },
    });
    if (!cliente) return { success: false, error: "Cliente no encontrado" };
    if (cliente._count.servicios > 0 || cliente._count.tramites > 0) {
      return { success: false, error: "Este cliente ya tiene servicio o trámite y no puede volver a Prospectos" };
    }

    // Si este cliente nació de un Prospecto NEXUS, no debemos crear otro.
    // Reactivamos exactamente el mismo registro para conservar Score, fuente,
    // responsable comercial, seguimientos e historial de conversión.
    const prospectoOrigen = await db.prospecto.findFirst({
      where: { clienteId, deletedAt: null },
      select: { id: true, convertido: true, estado: true },
    });

    if (prospectoOrigen) {
      const prospectoId = await db.$transaction(async (tx) => {
        const bloqueado = await tx.$queryRaw<{
          id: string;
          estado: string;
          convertido: boolean;
          clienteId: string | null;
        }[]>`
          SELECT "id", "estado", "convertido", "clienteId"
          FROM "prospecto"
          WHERE "id"=${prospectoOrigen.id} AND "deletedAt" IS NULL
          FOR UPDATE
        `;
        const actual = bloqueado[0];
        if (!actual || actual.clienteId !== clienteId) throw new Error("VINCULO_PROSPECTO_INVALIDO");

        const historialPrevio = await tx.$queryRaw<{ estadoAnterior: string | null }[]>`
          SELECT "estado_anterior" AS "estadoAnterior"
          FROM "prospecto_historial"
          WHERE "prospecto_id"=${actual.id} AND "estado_nuevo"='CONVERTIDO'
          ORDER BY "created_at" DESC
          LIMIT 1
        `;
        const candidato = historialPrevio[0]?.estadoAnterior;
        const etapasActivas = ["NUEVO", "CONTACTADO", "CALIFICADO", "SEGUIMIENTO"];
        const estadoReactivado = candidato && etapasActivas.includes(candidato) ? candidato : "SEGUIMIENTO";

        await tx.prospecto.update({
          where: { id: actual.id },
          data: {
            convertido: false,
            estado: estadoReactivado,
            clienteId: null,
            convertidoPorId: null,
            convertidoAt: null,
          },
        });

        await tx.cliente.update({ where: { id: clienteId }, data: { activo: false } });

        await tx.$executeRaw`
          INSERT INTO "prospecto_historial"
            ("id","prospecto_id","estado_anterior","estado_nuevo","motivo_perdida","cambiado_por_id","created_at")
          VALUES
            (${randomUUID()},${actual.id},'CONVERTIDO',${estadoReactivado},NULL,${session.user.id},CURRENT_TIMESTAMP)
        `;

        await registrarAuditoriaProspecto(tx, {
          prospectoId: actual.id,
          usuarioId: session.user.id,
          accion: "CLIENTE_RETORNADO_A_PROSPECTO",
          detalle: {
            clienteOrigenId: clienteId,
            estadoReactivado,
            reutilizoProspectoOriginal: true,
          },
        });

        return actual.id;
      });

      return { success: true, data: { id: prospectoId } };
    }

    // Cliente histórico sin Prospecto de origen: aquí sí corresponde crear uno nuevo.
    const identidades = await db.prospecto.findMany({
      where: { deletedAt: null },
      select: { id: true, nombres: true, apellidos: true, telefono: true, email: true, convertido: true },
    });
    const duplicado = detectarProspectoDuplicado(
      identidades,
      cliente.telefonoCelular ?? "",
      cliente.email,
      undefined,
    );
    if (duplicado) {
      return {
        success: false,
        error: "Ya existe otro prospecto con el teléfono o email de este cliente. Revisa ese prospecto antes de continuar.",
      };
    }

    const prospectoId = await db.$transaction(async (tx) => {
      const prospecto = await tx.prospecto.create({
        data: {
          nombres: cliente.nombres,
          apellidos: cliente.apellidos,
          telefono: cliente.telefonoCelular || "SIN TELEFONO",
          email: cliente.email,
          pais: cliente.nacionalidad || "Bolivia",
          origen: "OTRO",
          interes: null,
          observaciones: "Retomado desde Cliente registrado que no contrató servicio.",
          estado: "NUEVO",
          creadoPorId: session.user.id,
        },
      });
      await tx.$executeRaw`UPDATE "prospecto" SET "responsable_comercial_id"=${cliente.registradoPorId}, "origen_detalle"='Cliente registrado sin servicio' WHERE "id"=${prospecto.id}`;
      await tx.cliente.update({ where: { id: clienteId }, data: { activo: false } });
      await registrarAuditoriaProspecto(tx, {
        prospectoId: prospecto.id,
        usuarioId: session.user.id,
        accion: "CLIENTE_SIN_SERVICIO_A_PROSPECTO",
        detalle: {
          clienteOrigenId: clienteId,
          responsableComercialId: cliente.registradoPorId,
          reutilizoProspectoOriginal: false,
        },
      });
      return prospecto.id;
    });

    return { success: true, data: { id: prospectoId } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "VINCULO_PROSPECTO_INVALIDO") {
      return { success: false, error: "No se pudo validar el vínculo entre Cliente y Prospecto" };
    }
    console.error("Error al convertir cliente sin servicio en prospecto:", error);
    return { success: false, error: "No se pudo enviar el cliente a Prospectos" };
  }
}
