import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 const s=await auth.api.getSession({headers:await headers()});if(!s?.user)return NextResponse.json({error:"No autorizado"},{status:401});
 const {id}=await params,b=await req.json(),estado=String(b.estado??"");
 const permitidos=['CONTACTADO','EN_EVALUACION','NO_INTERESADO','SIN_RESPUESTA','ARCHIVADO'];
 if(!permitidos.includes(estado))return NextResponse.json({error:"Estado inválido"},{status:400});
 await db.$executeRawUnsafe(`UPDATE contacto_activacion SET estado=$1,contactado_at=CASE WHEN $1='CONTACTADO' THEN COALESCE(contactado_at,CURRENT_TIMESTAMP) ELSE contactado_at END,archivado_at=CASE WHEN $1 IN ('NO_INTERESADO','SIN_RESPUESTA','ARCHIVADO') THEN CURRENT_TIMESTAMP ELSE archivado_at END,updated_at=CURRENT_TIMESTAMP WHERE id=$2`,estado,id);
 return NextResponse.json({ok:true});
}