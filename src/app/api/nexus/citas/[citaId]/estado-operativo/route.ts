import {headers} from "next/headers";
import {NextResponse} from "next/server";
import {auth} from "@/lib/auth";
import {db} from "@/lib/db";
import {registrarAuditoriaNexus} from "@/lib/auditoria-nexus";

const HORAS_POSTERIORES=12;
const estadosPermitidos=["COMPLETADA","CANCELADA","REPROGRAMADA"] as const;
type EstadoOperativo=(typeof estadosPermitidos)[number];

export async function POST(req:Request,{params}:{params:Promise<{citaId:string}>}){
 try{
  const session=await auth.api.getSession({headers:await headers()});
  if(!session?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
  const{citaId}=await params;
  const body=await req.json();
  const estado=String(body.estado??"").toUpperCase() as EstadoOperativo;
  if(!estadosPermitidos.includes(estado))return NextResponse.json({error:"Estado operativo no válido"},{status:400});
  const cita=await db.cita.findFirst({where:{id:citaId,deletedAt:null},include:{tramite:{select:{clienteId:true}},tipoCita:{select:{nombre:true,codigo:true}}}});
  if(!cita)return NextResponse.json({error:"Cita no encontrada"},{status:404});
  const desc=`${cita.tipoCita.nombre} ${cita.tipoCita.codigo??""}`.toLowerCase();
  if(!desc.includes("simulacr")&&!desc.includes("entrevista")&&!desc.includes("consular")&&!desc.includes("embajada"))return NextResponse.json({error:"Esta acción aplica únicamente a simulacros o entrevistas"},{status:400});
  const ahora=Date.now(),agendada=new Date(cita.fechaHora).getTime(),limite=agendada+HORAS_POSTERIORES*60*60*1000;
  if(ahora>limite)return NextResponse.json({error:"La ventana operativa de 12 horas posteriores ya terminó"},{status:400});
  if(estado==="COMPLETADA"&&ahora<agendada)return NextResponse.json({error:"Podrás marcarla como realizada desde la hora programada"},{status:400});
  let nuevaFecha:Date|undefined;
  if(estado==="REPROGRAMADA"){
   if(!body.fechaHora)return NextResponse.json({error:"Registra la nueva fecha y hora"},{status:400});
   nuevaFecha=new Date(body.fechaHora);
   if(Number.isNaN(nuevaFecha.getTime())||nuevaFecha.getTime()<=ahora)return NextResponse.json({error:"La nueva fecha debe ser futura"},{status:400});
  }
  await db.$transaction(async tx=>{
   await tx.cita.update({where:{id:citaId},data:{estado,fechaHora:nuevaFecha??cita.fechaHora,lugar:body.lugar!==undefined?(String(body.lugar).trim()||null):cita.lugar,notas:body.notas!==undefined?(String(body.notas).trim()||null):cita.notas,updatedAt:new Date()}});
   if(estado==="COMPLETADA")await tx.citaParticipante.updateMany({where:{citaId},data:{asistio:true}});
  });
  if(cita.tramite?.clienteId)await registrarAuditoriaNexus({accion:`CITA_${estado}`,entidad:"CITA",entidadId:citaId,clienteId:cita.tramite.clienteId,usuarioId:session.user.id,detalle:estado==="REPROGRAMADA"?`Reprogramada para ${nuevaFecha?.toISOString()}`:`Cita marcada ${estado.toLowerCase()}`});
  return NextResponse.json({ok:true,estado,fechaHora:nuevaFecha??cita.fechaHora});
 }catch(error){console.error("estado-operativo POST",error);return NextResponse.json({error:"No se pudo actualizar la cita"},{status:500})}
}
