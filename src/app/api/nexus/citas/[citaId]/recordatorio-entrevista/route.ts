import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureEntrevistaRecordatorioSchema } from "@/lib/entrevista-recordatorio-schema";

export async function POST(request:Request,{params}:{params:Promise<{citaId:string}>}){
  try{
    await ensureEntrevistaRecordatorioSchema();
    const session=await auth.api.getSession({headers:await headers()});
    if(!session?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
    const {citaId}=await params;
    const body=await request.json().catch(()=>({}));
    const enviado=body?.enviado===true;
    const cita=await db.cita.findFirst({where:{id:citaId,deletedAt:null},select:{id:true,tipoCita:{select:{nombre:true,codigo:true}}}});
    if(!cita)return NextResponse.json({error:"Cita no encontrada"},{status:404});
    const descriptor=`${cita.tipoCita.nombre} ${cita.tipoCita.codigo??""}`.toLowerCase();
    if(!(descriptor.includes("entrevista")||descriptor.includes("consular")||descriptor.includes("embajada")))return NextResponse.json({error:"La cita no corresponde a entrevista consular"},{status:400});
    await db.$executeRaw`
      INSERT INTO "entrevista_recordatorio" ("citaId","enviado","marcadoPorId","marcadoAt","updatedAt")
      VALUES (${citaId},${enviado},${session.user.id},${enviado?new Date():null},CURRENT_TIMESTAMP)
      ON CONFLICT ("citaId") DO UPDATE SET
        "enviado"=EXCLUDED."enviado",
        "marcadoPorId"=EXCLUDED."marcadoPorId",
        "marcadoAt"=EXCLUDED."marcadoAt",
        "updatedAt"=CURRENT_TIMESTAMP
    `;
    return NextResponse.json({success:true,enviado});
  }catch(error){
    console.error("recordatorio-entrevista POST",error);
    return NextResponse.json({error:"No se pudo actualizar el recordatorio"},{status:500});
  }
}
