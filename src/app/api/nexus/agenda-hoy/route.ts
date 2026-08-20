import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureSimulacroInstruccionSchema } from "@/lib/simulacro-instruccion-schema";

export async function GET(){
  try{
    await ensureSimulacroInstruccionSchema();
    const session=await auth.api.getSession({headers:await headers()});
    if(!session?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
    const rows=await db.$queryRaw<Array<{
      id:string;fechaHora:Date;lugar:string|null;tipoCita:string;codigo:string|null;cliente:string|null;grupoFamiliar:string|null;participantes:number;instruccionEnviada:boolean|null;diaOffset:number;
    }>>`
      SELECT c."id",c."fechaHora",c."lugar",tc."nombre" AS "tipoCita",tc."codigo",
        CASE WHEN cl."id" IS NOT NULL THEN TRIM(cl."nombres" || ' ' || cl."apellidos") ELSE NULL END AS "cliente",
        gf."nombre" AS "grupoFamiliar",
        (SELECT COUNT(*)::int FROM "cita_participante" cp WHERE cp."citaId"=c."id") AS "participantes",
        si."enviada" AS "instruccionEnviada",
        ((c."fechaHora" - INTERVAL '4 hours')::date - (NOW() AT TIME ZONE 'America/La_Paz')::date)::int AS "diaOffset"
      FROM "cita" c
      INNER JOIN "catalogo_tipo_cita" tc ON tc."id"=c."tipoCitaId"
      LEFT JOIN "tramite" t ON t."id"=c."tramiteId"
      LEFT JOIN "cliente" cl ON cl."id"=t."clienteId"
      LEFT JOIN "grupo_familiar" gf ON gf."id"=c."grupoFamiliarId"
      LEFT JOIN "simulacro_instruccion" si ON si."citaId"=c."id"
      WHERE c."deletedAt" IS NULL
        AND c."estado" <> 'CANCELADA'
        AND (c."fechaHora" - INTERVAL '4 hours')::date BETWEEN (NOW() AT TIME ZONE 'America/La_Paz')::date AND ((NOW() AT TIME ZONE 'America/La_Paz')::date + 2)
        AND (
          LOWER(tc."nombre") LIKE '%simulacr%' OR LOWER(COALESCE(tc."codigo",'')) LIKE '%simulacr%'
          OR LOWER(tc."nombre") LIKE '%asesor%' OR LOWER(COALESCE(tc."codigo",'')) LIKE '%asesor%'
          OR LOWER(tc."nombre") LIKE '%consulta%' OR LOWER(COALESCE(tc."codigo",'')) LIKE '%consulta%'
        )
      ORDER BY c."fechaHora" ASC`;
    const clasificar=(nombre:string,codigo:string|null)=>`${nombre} ${codigo??""}`.toLowerCase().includes("simulacr")?"SIMULACRO":"ASESORIA";
    const agenda=rows.map(r=>({id:r.id,fechaHora:r.fechaHora,lugar:r.lugar,tipoCita:r.tipoCita,cliente:r.cliente,grupoFamiliar:r.grupoFamiliar,participantes:Number(r.participantes),categoria:clasificar(r.tipoCita,r.codigo),instruccionEnviada:r.instruccionEnviada===true,diaOffset:Number(r.diaOffset)}));
    return NextResponse.json({simulacros:agenda.filter(a=>a.categoria==="SIMULACRO"),asesorias:agenda.filter(a=>a.categoria==="ASESORIA")});
  }catch(error){console.error("agenda-hoy GET",error);return NextResponse.json({error:"No se pudo cargar la agenda próxima"},{status:500})}
}
