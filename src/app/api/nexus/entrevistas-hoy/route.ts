import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureCitaResultadoConsularSchema } from "@/lib/cita-resultado-consular-schema";
import { ensureEntrevistaRecordatorioSchema } from "@/lib/entrevista-recordatorio-schema";

async function ensurePagos(){await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "cliente_servicio_pago_nexus" ("id" TEXT PRIMARY KEY,"clienteServicioId" TEXT NOT NULL REFERENCES "cliente_servicio"("id") ON DELETE CASCADE,"monto" DECIMAL(12,2) NOT NULL,"modalidad" TEXT NOT NULL,"confirmado" BOOLEAN NOT NULL DEFAULT false,"notificado" BOOLEAN NOT NULL DEFAULT false,"observacion" TEXT,"usuarioId" TEXT REFERENCES "user"("id") ON DELETE SET NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`)}

export async function GET(){
  try{
    await Promise.all([ensureCitaResultadoConsularSchema(),ensureEntrevistaRecordatorioSchema(),ensurePagos()]);
    const session=await auth.api.getSession({headers:await headers()});
    if(!session?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
    const rows=await db.$queryRaw<Array<any>>`
      SELECT c."id",c."fechaHora",c."lugar",tc."nombre" AS "tipoCita",
        cl."id" AS "clienteId",
        CASE WHEN cl."id" IS NOT NULL THEN TRIM(cl."nombres" || ' ' || cl."apellidos") ELSE NULL END AS "cliente",
        gf."nombre" AS "grupoFamiliar",
        (SELECT COUNT(*)::int FROM "cita_participante" cp WHERE cp."citaId"=c."id") AS "participantes",
        rc."resultado",rc."registradoAt",
        EXTRACT(EPOCH FROM (NOW()-c."fechaHora"))/3600.0 AS "horasDesdeCita",
        ((c."fechaHora" - INTERVAL '4 hours')::date - (NOW() AT TIME ZONE 'America/La_Paz')::date)::int AS "diaOffset",
        er."enviado" AS "recordatorioEnviado",
        r."nombre" AS "regionNombre",
        cs."precioFinal" AS "totalServicio",
        COALESCE(pg."abonado",0) AS "abonado",
        GREATEST(0,COALESCE(cs."precioFinal",0)-COALESCE(pg."abonado",0)) AS "saldoPendiente",
        COALESCE(pg."efectivoNoConfirmado",false) AS "efectivoNoConfirmado"
      FROM "cita" c
      INNER JOIN "catalogo_tipo_cita" tc ON tc."id"=c."tipoCitaId"
      LEFT JOIN "tramite" t ON t."id"=c."tramiteId"
      LEFT JOIN "cliente_servicio" cs ON cs."id"=t."clienteServicioId"
      LEFT JOIN LATERAL (SELECT COALESCE(SUM(p."monto"),0) AS "abonado",BOOL_OR(p."modalidad"='EFECTIVO' AND p."confirmado"=false) AS "efectivoNoConfirmado" FROM "cliente_servicio_pago_nexus" p WHERE p."clienteServicioId"=cs."id") pg ON true
      LEFT JOIN "cliente" cl ON cl."id"=t."clienteId"
      LEFT JOIN "region" r ON r."id"=cl."regionId"
      LEFT JOIN "grupo_familiar" gf ON gf."id"=c."grupoFamiliarId"
      LEFT JOIN "cita_resultado_consular" rc ON rc."citaId"=c."id"
      LEFT JOIN "entrevista_recordatorio" er ON er."citaId"=c."id"
      WHERE c."deletedAt" IS NULL AND c."estado" <> 'CANCELADA'
        AND (LOWER(tc."nombre") LIKE '%entrevista%' OR LOWER(COALESCE(tc."codigo",'')) LIKE '%entrevista%' OR LOWER(tc."nombre") LIKE '%consular%' OR LOWER(tc."nombre") LIKE '%embajada%')
        AND (c."fechaHora" - INTERVAL '4 hours')::date BETWEEN (NOW() AT TIME ZONE 'America/La_Paz')::date AND ((NOW() AT TIME ZONE 'America/La_Paz')::date + 6)
      ORDER BY c."fechaHora" ASC`;
    const regionAgenda=(regionNombre:string|null,lugar:string|null)=>{const base=`${regionNombre??""} ${lugar??""}`.toLowerCase();if(base.includes("cochabamba"))return "COCHABAMBA";if(base.includes("la paz")||base.includes("embajada"))return "LA_PAZ";return "INTERIOR"};
    const entrevistas=rows.map(r=>({...r,participantes:Number(r.participantes),horasDesdeCita:Number(r.horasDesdeCita),diaOffset:Number(r.diaOffset),recordatorioEnviado:r.recordatorioEnviado===true,region:regionAgenda(r.regionNombre,r.lugar),totalServicio:Number(r.totalServicio??0),abonado:Number(r.abonado??0),saldoPendiente:Number(r.saldoPendiente??0),efectivoNoConfirmado:r.efectivoNoConfirmado===true,cobroPendiente:Number(r.saldoPendiente??0)>0||r.efectivoNoConfirmado===true,estadoResultado:r.resultado?r.resultado:Number(r.diaOffset)>0?"PROXIMA":Number(r.horasDesdeCita)>=6?"ATRASADO":Number(r.horasDesdeCita)>=0?"PENDIENTE":"PROXIMA"}));
    return NextResponse.json({entrevistas});
  }catch(error){console.error("entrevistas-hoy GET",error);return NextResponse.json({error:"No se pudieron cargar las entrevistas próximas"},{status:500});}
}
