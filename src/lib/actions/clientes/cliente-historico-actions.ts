"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type ClienteHistoricoInput = {
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  telefonoCelular: string;
  email?: string;
  numeroPasaporte?: string;
  regionId: string;
  servicioTomado: string;
  servicioOtro?: string;
  fechaAprobacion?: string;
  fechaVencimiento?: string;
  aplicacion: "INDIVIDUAL" | "FAMILIAR" | "GRUPAL";
};

async function ensureClienteHistorico() {
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "cliente_historico" (
      "id" TEXT PRIMARY KEY,
      "clienteId" TEXT NOT NULL UNIQUE REFERENCES "cliente"("id") ON DELETE CASCADE,
      "servicioTomado" TEXT NOT NULL,
      "servicioOtro" TEXT,
      "fechaAprobacion" TIMESTAMP(3),
      "fechaVencimiento" TIMESTAMP(3),
      "aplicacion" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK ("aplicacion" IN ('INDIVIDUAL','FAMILIAR','GRUPAL'))
    )
  `);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "cliente_historico_vencimiento_idx" ON "cliente_historico"("fechaVencimiento")`);
}

export async function registrarClienteHistorico(input: ClienteHistoricoInput) {
  try {
    await ensureClienteHistorico();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Sesión no válida" };

    const nombres = input.nombres.trim();
    const apellidos = input.apellidos.trim();
    const telefono = input.telefonoCelular.trim();
    if (!nombres || !apellidos || !input.fechaNacimiento || !telefono || !input.regionId || !input.servicioTomado || !input.aplicacion) {
      return { success: false, error: "Completa todos los campos obligatorios" };
    }
    if (input.servicioTomado === "OTRO" && !input.servicioOtro?.trim()) {
      return { success: false, error: "Detalla el otro servicio realizado" };
    }

    const region = await db.region.findUnique({ where: { id: input.regionId }, select: { id: true } });
    if (!region) return { success: false, error: "Región no encontrada" };

    const pasaporte = input.numeroPasaporte?.trim() || null;
    if (pasaporte) {
      const existente = await db.cliente.findUnique({ where: { numeroPasaporte: pasaporte }, select: { id: true } });
      if (existente) return { success: false, error: "Ya existe un cliente con ese número de pasaporte" };
    }

    const clienteId = await db.$transaction(async (tx) => {
      const cliente = await tx.cliente.create({
        data: {
          nombres,
          apellidos,
          fechaNacimiento: new Date(`${input.fechaNacimiento}T12:00:00`),
          telefonoCelular: telefono,
          email: input.email?.trim() || null,
          numeroPasaporte: pasaporte,
          regionId: input.regionId,
          registradoPorId: session.user.id,
          activo: true,
        },
        select: { id: true },
      });

      await tx.$executeRaw`
        INSERT INTO "cliente_historico"
          ("id", "clienteId", "servicioTomado", "servicioOtro", "fechaAprobacion", "fechaVencimiento", "aplicacion", "createdAt", "updatedAt")
        VALUES
          (${randomUUID()}, ${cliente.id}, ${input.servicioTomado}, ${input.servicioOtro?.trim() || null},
           ${input.fechaAprobacion ? new Date(`${input.fechaAprobacion}T12:00:00`) : null},
           ${input.fechaVencimiento ? new Date(`${input.fechaVencimiento}T12:00:00`) : null},
           ${input.aplicacion}, NOW(), NOW())
      `;
      return cliente.id;
    });

    return { success: true, data: { id: clienteId } };
  } catch (error) {
    console.error("Error al registrar cliente histórico:", error);
    return { success: false, error: "No se pudo registrar el cliente histórico" };
  }
}
