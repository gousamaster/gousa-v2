import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureNexusPendientesSchema } from "@/lib/nexus-pendientes-schema";

export async function POST(request: Request,{params}:{params:Promise<{id:string}>}){
  try{
    await ensureNexusPendientesSchema();
    const session=await auth.api.getSession({headers:await headers()});
    if(!session?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
    const {id}=await params; const body=await request.json(); const completado=body?.completado!==false;
    await db.$executeRaw`
      UPDATE "nexus_pendiente"
      SET "completado"=${completado},
          "completadoAt"=${completado?new Date():null},
          "completadoPorId"=${completado?session.user.id:null},
          "updatedAt"=CURRENT_TIMESTAMP
      WHERE "id"=${id}`;
    return NextResponse.json({ok:true});
  }catch(error){console.error("pendientes POST id",error);return NextResponse.json({error:"No se pudo actualizar el pendiente"},{status:500});}
}
