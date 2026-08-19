import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureRentACarSchema } from "@/lib/rentacar-schema";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){try{await ensureRentACarSchema();const{id}=await params;const body=await request.json();const estado=body.estado==="DESPACHADA"?"DESPACHADA":"PENDIENTE";const rows=await db.$queryRaw<Array<{id:string}>>`UPDATE "orden_cotizacion_rentacar" SET "estado"=${estado},"despachadoAt"=CASE WHEN ${estado}='DESPACHADA' THEN NOW() ELSE NULL END,"updatedAt"=NOW() WHERE "id"=${id} RETURNING "id"`;if(!rows.length)return NextResponse.json({error:"Orden no encontrada"},{status:404});return NextResponse.json({ok:true})}catch(e){console.error(e);return NextResponse.json({error:"No se pudo actualizar la orden"},{status:500})}}
