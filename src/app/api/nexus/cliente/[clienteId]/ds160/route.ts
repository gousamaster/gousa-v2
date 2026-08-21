import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { encryptCredential } from "@/lib/cliente-centro-visas";
import { ensureDs160OperativoSchema } from "@/lib/ds160-operativo-schema";
import { ensureNexusPendientesSchema } from "@/lib/nexus-pendientes-schema";

const ESTADOS=["INICIADO","EN_PROCESO","PARA_CERRAR","CERRADO"] as const;

export async function GET(_request:Request,{params}:{params:Promise<{clienteId:string}>}){
 try{
  await ensureDs160OperativoSchema();
  const session=await auth.api.getSession({headers:await headers()});
  if(!session?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
  const {clienteId}=await params;
  const rows=await db.$queryRaw<Array<Record<string,unknown>>>`
   SELECT "clienteId","applicationId","estado","motivoViaje","lugarViaje","tiempoEstadia","contactoUsa",
   "ocupacionDetalleEs","ocupacionDetalleEn","negacionAnteriorEs","negacionAnteriorEn",
   "revisadoDirector","revisadoAt","cerradoAt","updatedAt",
   CASE WHEN "respuestaSeguridadEncrypted" IS NULL THEN FALSE ELSE TRUE END AS "tieneRespuestaSeguridad"
   FROM "nexus_ds160" WHERE "clienteId"=${clienteId} LIMIT 1`;
  return NextResponse.json({ds160:rows[0]??null});
 }catch(error){console.error("ds160 GET",error);return NextResponse.json({error:"No se pudo cargar DS-160"},{status:500});}
}

export async function POST(request:Request,{params}:{params:Promise<{clienteId:string}>}){
 try{
  await ensureDs160OperativoSchema();await ensureNexusPendientesSchema();
  const session=await auth.api.getSession({headers:await headers()});
  if(!session?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
  const {clienteId}=await params;const body=await request.json();
  const cliente=await db.cliente.findFirst({where:{id:clienteId,deletedAt:null},select:{id:true,nombres:true,apellidos:true}});
  if(!cliente)return NextResponse.json({error:"Cliente no encontrado"},{status:404});
  const applicationId=String(body.applicationId??"").trim().toUpperCase();
  const estado=String(body.estado??"INICIADO");
  if(!/^AA[0-9A-Z]{6,}$/.test(applicationId))return NextResponse.json({error:"Registra un código DS-160 válido que inicie con AA"},{status:400});
  if(!ESTADOS.includes(estado as typeof ESTADOS[number]))return NextResponse.json({error:"Estado DS-160 inválido"},{status:400});
  const actual=await db.$queryRaw<Array<{respuestaSeguridadEncrypted:string|null}>>`SELECT "respuestaSeguridadEncrypted" FROM "nexus_ds160" WHERE "clienteId"=${clienteId} LIMIT 1`;
  const respuesta=String(body.respuestaSeguridad??"").trim();
  const encrypted=respuesta?encryptCredential(respuesta):actual[0]?.respuestaSeguridadEncrypted;
  if(!encrypted)return NextResponse.json({error:"La respuesta de seguridad es obligatoria"},{status:400});
  const revisado=body.revisadoDirector===true;
  const cerrado=estado==="CERRADO";
  await db.$executeRaw`
   INSERT INTO "nexus_ds160" ("clienteId","applicationId","respuestaSeguridadEncrypted","estado","motivoViaje","lugarViaje","tiempoEstadia","contactoUsa","ocupacionDetalleEs","ocupacionDetalleEn","negacionAnteriorEs","negacionAnteriorEn","revisadoDirector","revisadoAt","revisadoPorId","cerradoAt","cerradoPorId","updatedAt")
   VALUES (${clienteId},${applicationId},${encrypted},${estado},${body.motivoViaje??null},${body.lugarViaje??null},${body.tiempoEstadia??null},${body.contactoUsa??null},${body.ocupacionDetalleEs??null},${body.ocupacionDetalleEn??null},${body.negacionAnteriorEs??null},${body.negacionAnteriorEn??null},${revisado},${revisado?new Date():null},${revisado?session.user.id:null},${cerrado?new Date():null},${cerrado?session.user.id:null},CURRENT_TIMESTAMP)
   ON CONFLICT ("clienteId") DO UPDATE SET
   "applicationId"=EXCLUDED."applicationId","respuestaSeguridadEncrypted"=EXCLUDED."respuestaSeguridadEncrypted","estado"=EXCLUDED."estado",
   "motivoViaje"=EXCLUDED."motivoViaje","lugarViaje"=EXCLUDED."lugarViaje","tiempoEstadia"=EXCLUDED."tiempoEstadia","contactoUsa"=EXCLUDED."contactoUsa",
   "ocupacionDetalleEs"=EXCLUDED."ocupacionDetalleEs","ocupacionDetalleEn"=EXCLUDED."ocupacionDetalleEn","negacionAnteriorEs"=EXCLUDED."negacionAnteriorEs","negacionAnteriorEn"=EXCLUDED."negacionAnteriorEn",
   "revisadoDirector"=EXCLUDED."revisadoDirector","revisadoAt"=EXCLUDED."revisadoAt","revisadoPorId"=EXCLUDED."revisadoPorId",
   "cerradoAt"=EXCLUDED."cerradoAt","cerradoPorId"=EXCLUDED."cerradoPorId","updatedAt"=CURRENT_TIMESTAMP`;
  const titulo=`DS-160 PARA CERRAR — ${cliente.nombres} ${cliente.apellidos}`;
  if(estado==="PARA_CERRAR"){
    const existente=await db.$queryRaw<Array<{id:string}>>`SELECT "id" FROM "nexus_pendiente" WHERE "clienteId"=${clienteId} AND "titulo"=${titulo} AND "completado"=FALSE LIMIT 1`;
    if(!existente[0])await db.$executeRaw`INSERT INTO "nexus_pendiente" ("id","titulo","detalle","categoria","fechaObjetivo","clienteId","asignadoAId","creadoPorId") VALUES (${randomUUID()},${titulo},${"Revisar motivo/lugar de viaje, estadía, contacto USA y ocupación antes del cierre."},${"DS160"},${new Date()},${clienteId},${session.user.id},${session.user.id})`;
  }else{
    await db.$executeRaw`UPDATE "nexus_pendiente" SET "completado"=TRUE,"completadoAt"=CURRENT_TIMESTAMP,"completadoPorId"=${session.user.id},"updatedAt"=CURRENT_TIMESTAMP WHERE "clienteId"=${clienteId} AND "titulo"=${titulo} AND "completado"=FALSE`;
  }
  return NextResponse.json({ok:true,estado});
 }catch(error){console.error("ds160 POST",error);return NextResponse.json({error:"No se pudo guardar DS-160"},{status:500});}
}
