import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureAtraccionesSchema } from "@/lib/atracciones-schema";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    await ensureAtraccionesSchema();
    const s=await auth.api.getSession({headers:await headers()});
    if(!s?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
    const {id}=await params;const b=await request.json();
    const estado=b.estado==="DESPACHADA"?"DESPACHADA":b.estado==="PENDIENTE"?"PENDIENTE":null;
    if(!estado)return NextResponse.json({error:"Estado no válido"},{status:400});
    const rows=await db.$queryRaw<Array<{id:string}>>`UPDATE "orden_cotizacion_atracciones" SET "estado"=${estado},"despachadoAt"=${estado==="DESPACHADA"?new Date():null},"updatedAt"=NOW() WHERE "id"=${id} RETURNING "id"`;
    if(!rows.length)return NextResponse.json({error:"Orden no encontrada"},{status:404});
    return NextResponse.json({ok:true});
  }catch(e){console.error(e);return NextResponse.json({error:"No se pudo actualizar la orden"},{status:500})}
}
