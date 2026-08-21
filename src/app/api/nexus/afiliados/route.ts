import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureClienteAfiliadoSchema } from "@/lib/cliente-afiliado-schema";

export async function GET(){
 try{
  await ensureClienteAfiliadoSchema();
  const session=await auth.api.getSession({headers:await headers()});
  if(!session?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
  const rows=await db.$queryRaw<Array<{clienteId:string;afiliado:boolean;afiliadoAt:Date}>>`SELECT "clienteId","afiliado","afiliadoAt" FROM "cliente_afiliado" WHERE "afiliado"=TRUE`;
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
  const existe=await db.cliente.findFirst({where:{id:clienteId,deletedAt:null},select:{id:true}});
  if(!existe)return NextResponse.json({error:"Cliente no encontrado"},{status:404});
  await db.$executeRaw`
   INSERT INTO "cliente_afiliado" ("clienteId","afiliado","afiliadoAt","afiliadoPorId","updatedAt")
   VALUES (${clienteId},${afiliado},CURRENT_TIMESTAMP,${session.user.id},CURRENT_TIMESTAMP)
   ON CONFLICT ("clienteId") DO UPDATE SET "afiliado"=${afiliado},"afiliadoAt"=CASE WHEN ${afiliado} THEN CURRENT_TIMESTAMP ELSE "cliente_afiliado"."afiliadoAt" END,"afiliadoPorId"=${session.user.id},"updatedAt"=CURRENT_TIMESTAMP`;
  return NextResponse.json({ok:true,clienteId,afiliado});
 }catch(error){console.error("afiliados POST",error);return NextResponse.json({error:"No se pudo actualizar el afiliado"},{status:500});}
}
