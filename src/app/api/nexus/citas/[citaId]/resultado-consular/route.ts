import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureCitaResultadoConsularSchema, RESULTADOS_CONSULARES } from "@/lib/cita-resultado-consular-schema";
import { ensureNexusPendientesSchema } from "@/lib/nexus-pendientes-schema";

async function ensurePostConsular(){
  await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "post_consular_nexus" ("tramiteId" TEXT PRIMARY KEY REFERENCES "tramite"("id") ON DELETE CASCADE,"resultado" TEXT NOT NULL DEFAULT 'PENDIENTE',"fechaResultado" DATE,"testimonio" TEXT NOT NULL DEFAULT 'PENDIENTE',"aisRevisado" BOOLEAN NOT NULL DEFAULT false,"proveedor" TEXT,"codigoOp" TEXT,"fechaDespacho" DATE,"fechaRetorno" DATE,"fechaEntrega" DATE,"observaciones" TEXT,"usuarioId" TEXT REFERENCES "user"("id") ON DELETE SET NULL,"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CHECK ("resultado" IN ('PENDIENTE','APROBADA','NEGADA')))`);
}

export async function GET(_request:Request,{params}:{params:Promise<{citaId:string}>}){
 try{
  await ensureCitaResultadoConsularSchema();
  const s=await auth.api.getSession({headers:await headers()});
  if(!s?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
  const {citaId}=await params;
  const rows=await db.$queryRaw<any[]>`SELECT r."resultado",r."observaciones",r."registradoAt",u."name" AS "registradoPorNombre" FROM "cita_resultado_consular" r INNER JOIN "user" u ON u."id"=r."registradoPorId" WHERE r."citaId"=${citaId} LIMIT 1`;
  return NextResponse.json({resultado:rows[0]??null});
 }catch(e){console.error(e);return NextResponse.json({error:"No se pudo cargar el resultado consular"},{status:500})}
}

export async function POST(request:Request,{params}:{params:Promise<{citaId:string}>}){
 try{
  await Promise.all([ensureCitaResultadoConsularSchema(),ensureNexusPendientesSchema(),ensurePostConsular()]);
  const s=await auth.api.getSession({headers:await headers()});
  if(!s?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
  const {citaId}=await params;
  const cita=await db.cita.findFirst({where:{id:citaId,deletedAt:null},select:{id:true,fechaHora:true,tramiteId:true,tramite:{select:{clienteId:true}},tipoCita:{select:{nombre:true,codigo:true}}}});
  if(!cita)return NextResponse.json({error:"Cita no encontrada"},{status:404});
  const d=`${cita.tipoCita.nombre} ${cita.tipoCita.codigo??""}`;
  if(!/entrevista|consular|embajada/i.test(d))return NextResponse.json({error:"Esta cita no es una entrevista consular"},{status:400});
  const b=await request.json().catch(()=>({}));
  const resultado=String(b.resultado??"").toUpperCase();
  const asistencia=String(b.asistencia??"").toUpperCase();
  const observaciones=typeof b.observaciones==="string"?b.observaciones.trim().slice(0,1000):null;
  if(!(RESULTADOS_CONSULARES as readonly string[]).includes(resultado))return NextResponse.json({error:"Resultado no válido"},{status:400});
  if((resultado==="APROBADA"||resultado==="NEGADA")&&asistencia!=="ASISTIO")return NextResponse.json({error:"Para cerrar la entrevista debes confirmar que el cliente asistió"},{status:400});
  if(resultado==="REPROGRAMADA"&&asistencia!=="REPROGRAMADA")return NextResponse.json({error:"Confirma que la cita fue reprogramada"},{status:400});

  await db.$transaction(async tx=>{
    await tx.$executeRaw`INSERT INTO "cita_resultado_consular" ("id","citaId","resultado","observaciones","registradoPorId","registradoAt","createdAt","updatedAt") VALUES (${crypto.randomUUID()},${citaId},${resultado},${observaciones||null},${s.user.id},NOW(),NOW(),NOW()) ON CONFLICT ("citaId") DO UPDATE SET "resultado"=EXCLUDED."resultado","observaciones"=EXCLUDED."observaciones","registradoPorId"=EXCLUDED."registradoPorId","registradoAt"=NOW(),"updatedAt"=NOW()`;
    if(resultado==="REPROGRAMADA")await tx.cita.update({where:{id:citaId},data:{estado:"REPROGRAMADA"}});
    if((resultado==="APROBADA"||resultado==="NEGADA")&&cita.tramiteId){
      await tx.$executeRaw`INSERT INTO "post_consular_nexus" ("tramiteId","resultado","fechaResultado","testimonio","aisRevisado","observaciones","usuarioId","updatedAt") VALUES (${cita.tramiteId},${resultado},CURRENT_DATE,'PENDIENTE',false,${observaciones||null},${s.user.id},NOW()) ON CONFLICT ("tramiteId") DO UPDATE SET "resultado"=EXCLUDED."resultado","fechaResultado"=EXCLUDED."fechaResultado","observaciones"=COALESCE(EXCLUDED."observaciones","post_consular_nexus"."observaciones"),"usuarioId"=EXCLUDED."usuarioId","updatedAt"=NOW()`;
    }
  });

  if(cita.tramite?.clienteId){
    const pid=`ais-${citaId}`;
    if(resultado==="APROBADA"){
      await db.$executeRaw`INSERT INTO "nexus_pendiente" ("id","titulo","detalle","categoria","fechaObjetivo","clienteId","asignadoAId","creadoPorId","createdAt","updatedAt") VALUES (${pid},'Revisar documento aprobado / FedEx','Visa aprobada. Desde este momento revisar el estado del documento y coordinar recojo/seguimiento en FedEx o Centro de Visas.','DOCUMENTO',NOW()+INTERVAL '24 hours',${cita.tramite.clienteId},${s.user.id},${s.user.id},NOW(),NOW()) ON CONFLICT ("id") DO UPDATE SET "titulo"=EXCLUDED."titulo","detalle"=EXCLUDED."detalle","fechaObjetivo"=EXCLUDED."fechaObjetivo","completado"=FALSE,"updatedAt"=NOW()`;
    }else{
      await db.$executeRaw`DELETE FROM "nexus_pendiente" WHERE "id"=${pid}`;
    }
  }
  return NextResponse.json({ok:true,resultado,seguimiento24h:resultado==="APROBADA"});
 }catch(e){console.error(e);return NextResponse.json({error:"No se pudo guardar el resultado consular"},{status:500})}
}
