import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureClienteAfiliadoSchema } from "@/lib/cliente-afiliado-schema";
import { registrarAuditoriaNexus } from "@/lib/auditoria-nexus";

export async function GET(){
 try{
  await ensureClienteAfiliadoSchema();
  const session=await auth.api.getSession({headers:await headers()});
  if(!session?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
  const rows=await db.$queryRaw<Array<{clienteId:string;afiliado:boolean;afiliadoAt:Date;afiliadoPorNombre:string|null;updatedAt:Date}>>`
   SELECT a."clienteId",a."afiliado",a."afiliadoAt",u."name" AS "afiliadoPorNombre",a."updatedAt"
   FROM "cliente_afiliado" a LEFT JOIN "user" u ON u."id"=a."afiliadoPorId"
   ORDER BY a."updatedAt" DESC`;
  return NextResponse.json({afiliados:rows});
 }catch(error){console.error("afiliados GET",error);return NextResponse.json({error:"No se pudieron cargar los afiliados"},{status:500});}
}

export async function POST(request:Request){
 try{
  await ensureClienteAfiliadoSchema();
  const session=await auth.api.getSession({headers:await headers()});
  if(!session?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
  const body=await request.json();const clienteId=String(body?.clienteId??"");const afiliado=body?.afiliado!==false;
  if(!clienteId)return NextResponse.json({error:"clienteId es obligatorio"},{status:400});
  const cliente=await db.cliente.findFirst({where:{id:clienteId,deletedAt:null},select:{id:true,activo:true,nombres:true,apellidos:true}});
  if(!cliente)return NextResponse.json({error:"Cliente no encontrado"},{status:404});
  if(afiliado&&!cliente.activo)return NextResponse.json({error:"Solo un cliente activo puede convertirse en afiliado"},{status:400});
  await db.$executeRaw`
   INSERT INTO "cliente_afiliado" ("clienteId","afiliado","afiliadoAt","afiliadoPorId","updatedAt")
   VALUES (${clienteId},${afiliado},CURRENT_TIMESTAMP,${session.user.id},CURRENT_TIMESTAMP)
   ON CONFLICT ("clienteId") DO UPDATE SET "afiliado"=${afiliado},"afiliadoAt"=CASE WHEN ${afiliado} THEN CURRENT_TIMESTAMP ELSE "cliente_afiliado"."afiliadoAt" END,"afiliadoPorId"=${session.user.id},"updatedAt"=CURRENT_TIMESTAMP`;
  await registrarAuditoriaNexus({accion:afiliado?"CLIENTE CONVERTIDO A AFILIADO":"AFILIACION RETIRADA",entidad:"Conversión comercial",entidadId:clienteId,clienteId,usuarioId:session.user.id,detalle:afiliado?`Cliente ${cliente.nombres} ${cliente.apellidos} pasó a condición AFILIADO`:`Se retiró la condición AFILIADO de ${cliente.nombres} ${cliente.apellidos}`});
  return NextResponse.json({ok:true,clienteId,afiliado});
 }catch(error){console.error("afiliados POST",error);return NextResponse.json({error:"No se pudo actualizar el afiliado"},{status:500});}
}
