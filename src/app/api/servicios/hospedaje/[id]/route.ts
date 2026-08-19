import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureHospedajeSchema } from "@/lib/hospedaje-schema";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){try{await ensureHospedajeSchema();const s=await auth.api.getSession({headers:await headers()});if(!s?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});const{id}=await params;const b=await request.json();const estado=b.estado==="DESPACHADA"?"DESPACHADA":b.estado==="PENDIENTE"?"PENDIENTE":null;if(!estado)return NextResponse.json({error:"Estado inválido"},{status:400});await db.$executeRaw`UPDATE "orden_cotizacion_hospedaje" SET "estado"=${estado},"despachadoAt"=CASE WHEN ${estado}='DESPACHADA' THEN NOW() ELSE NULL END,"updatedAt"=NOW() WHERE "id"=${id}`;return NextResponse.json({ok:true})}catch(e){console.error(e);return NextResponse.json({error:"No se pudo actualizar la orden"},{status:500})}}
