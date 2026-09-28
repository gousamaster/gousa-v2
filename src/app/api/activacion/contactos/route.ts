import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET(){
 const s=await auth.api.getSession({headers:await headers()}); if(!s?.user)return NextResponse.json({error:"No autorizado"},{status:401});
 await db.$executeRawUnsafe(`UPDATE contacto_activacion SET estado='ARCHIVADO',archivado_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE estado NOT IN ('CONVERTIDO','NO_INTERESADO','SIN_RESPUESTA','ARCHIVADO') AND vence_at<=CURRENT_TIMESTAMP`);
 const rows=await db.$queryRawUnsafe<any[]>(`SELECT c.*,u.name AS creador FROM contacto_activacion c LEFT JOIN "user" u ON u.id=c.creado_por_id ORDER BY c.created_at DESC LIMIT 500`);
 return NextResponse.json({contactos:rows});
}
export async function POST(req:Request){
 const s=await auth.api.getSession({headers:await headers()}); if(!s?.user)return NextResponse.json({error:"No autorizado"},{status:401});
 const b=await req.json(); const nombres=String(b.nombres??"").trim(), telefono=String(b.telefono??"").replace(/\s+/g,"");
 if(!nombres||!telefono)return NextResponse.json({error:"Nombre y WhatsApp son obligatorios"},{status:400});
 const dup=await db.$queryRawUnsafe<any[]>(`SELECT id,nombres,estado FROM contacto_activacion WHERE regexp_replace(telefono,'[^0-9]','','g')=regexp_replace($1,'[^0-9]','','g') ORDER BY created_at DESC LIMIT 1`,telefono);
 if(dup[0]&&!['ARCHIVADO','NO_INTERESADO','SIN_RESPUESTA'].includes(dup[0].estado))return NextResponse.json({error:`Este WhatsApp ya está registrado como contacto: ${dup[0].nombres}`},{status:409});
 const id=randomUUID();
 await db.$executeRawUnsafe(`INSERT INTO contacto_activacion(id,nombres,telefono,interes,origen,punto_captacion,clasificacion,observaciones,creado_por_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,id,nombres,telefono,String(b.interes??"NO_DEFINIDO"),String(b.origen??"CALLE"),b.puntoCaptacion||null,String(b.clasificacion??"SOLO_INFORMACION"),b.observaciones||null,s.user.id);
 return NextResponse.json({ok:true,id});
}