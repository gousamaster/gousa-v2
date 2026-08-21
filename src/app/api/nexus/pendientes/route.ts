import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureNexusPendientesSchema } from "@/lib/nexus-pendientes-schema";

const CATEGORIAS_EQUIPO = new Set(["REUNION_EQUIPO","FORMACION_EQUIPO"]);

function icsDate(fecha:string,hora:string){
  const d=new Date(`${fecha}T${hora}:00-04:00`);
  return d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
}
function escapeIcs(v:string){return v.replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");}
async function enviarInvitacionEquipo(args:{titulo:string;detalle:string|null;fecha:string;horaInicio:string;horaFin:string;creadoPor:string}){
  const usuarios=await db.user.findMany({where:{status:"ACTIVE",email:{not:""}},select:{email:true,name:true}});
  const destinatarios=usuarios.map(u=>u.email).filter(Boolean);
  if(destinatarios.length===0)return {estado:"SIN_DESTINATARIOS",enviado:false};
  const apiKey=process.env.RESEND_API_KEY;
  const from=process.env.NEXUS_MAIL_FROM;
  if(!apiKey||!from)return {estado:"CONFIGURAR_CORREO",enviado:false};
  const uid=`${randomUUID()}@nexus.gousa`;
  const ics=[
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//GO USA NEXUS//Dashboard Time//ES","CALSCALE:GREGORIAN","METHOD:REQUEST",
    "BEGIN:VEVENT",`UID:${uid}`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z")}`,
    `DTSTART:${icsDate(args.fecha,args.horaInicio)}`,`DTEND:${icsDate(args.fecha,args.horaFin)}`,
    `SUMMARY:${escapeIcs(args.titulo)}`,`DESCRIPTION:${escapeIcs(args.detalle??"Actividad de equipo creada en NEXUS Dashboard Time")}`,
    "LOCATION:GO USA","STATUS:CONFIRMED","END:VEVENT","END:VCALENDAR"
  ].join("\r\n");
  const etiquetaFecha=new Date(`${args.fecha}T12:00:00-04:00`).toLocaleDateString("es-BO",{day:"2-digit",month:"long",year:"numeric",timeZone:"America/La_Paz"});
  const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({
    from,to:destinatarios,subject:`NEXUS · ${args.titulo}`,
    html:`<div style="font-family:Arial,sans-serif;line-height:1.5"><h2>${args.titulo}</h2><p><strong>Fecha:</strong> ${etiquetaFecha}</p><p><strong>Hora:</strong> ${args.horaInicio} - ${args.horaFin}</p>${args.detalle?`<p><strong>Detalle:</strong> ${args.detalle}</p>`:""}<p>Actividad creada por ${args.creadoPor} en NEXUS Dashboard Time.</p></div>`,
    attachments:[{filename:"actividad-nexus.ics",content:Buffer.from(ics,"utf8").toString("base64")}]
  })});
  if(!r.ok){console.error("Resend actividad equipo",await r.text());return {estado:"ERROR_ENVIO",enviado:false};}
  return {estado:"ENVIADO",enviado:true};
}

export async function GET() {
  try {
    await ensureNexusPendientesSchema();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const rows = await db.$queryRaw<Array<{id:string;titulo:string;detalle:string|null;categoria:string;fechaObjetivo:Date;completado:boolean;horaInicio:string|null;horaFin:string|null;enviarCorreoEquipo:boolean;correoEstado:string|null;correoEnviadoAt:Date|null;prospectoId:string|null;clienteId:string|null;asignadoAId:string|null;asignadoA:string|null;prospecto:string|null;cliente:string|null;}>>`
      SELECT p."id",p."titulo",p."detalle",p."categoria",p."fechaObjetivo",p."completado",p."horaInicio",p."horaFin",p."enviarCorreoEquipo",p."correoEstado",p."correoEnviadoAt",
        p."prospectoId",p."clienteId",p."asignadoAId",u."name" AS "asignadoA",
        CASE WHEN pr."id" IS NOT NULL THEN TRIM(pr."nombres" || ' ' || COALESCE(pr."apellidos",'')) ELSE NULL END AS "prospecto",
        CASE WHEN cl."id" IS NOT NULL THEN TRIM(cl."nombres" || ' ' || cl."apellidos") ELSE NULL END AS "cliente"
      FROM "nexus_pendiente" p LEFT JOIN "user" u ON u."id"=p."asignadoAId" LEFT JOIN "prospecto" pr ON pr."id"=p."prospectoId" LEFT JOIN "cliente" cl ON cl."id"=p."clienteId"
      WHERE p."completado"=FALSE AND (p."fechaObjetivo" - INTERVAL '4 hours')::date <= ((NOW() AT TIME ZONE 'America/La_Paz')::date + 2)
      ORDER BY p."fechaObjetivo" ASC`;
    const hoy=new Date(new Date().toLocaleString("en-US",{timeZone:"America/La_Paz"}));const hoyBase=new Date(hoy.getFullYear(),hoy.getMonth(),hoy.getDate()).getTime();
    const pendientes=rows.map(r=>{const local=new Date(new Date(r.fechaObjetivo).toLocaleString("en-US",{timeZone:"America/La_Paz"}));const base=new Date(local.getFullYear(),local.getMonth(),local.getDate()).getTime();const diaOffset=Math.round((base-hoyBase)/86400000);return {...r,diaOffset,atrasado:diaOffset<0};});
    const usuarios=await db.user.findMany({where:{status:"ACTIVE"},select:{id:true,name:true,email:true},orderBy:{name:"asc"}});
    return NextResponse.json({pendientes,usuarios});
  } catch(error){console.error("pendientes GET",error);return NextResponse.json({error:"No se pudieron cargar los pendientes"},{status:500});}
}

export async function POST(request: Request) {
  try {
    await ensureNexusPendientesSchema();
    const session=await auth.api.getSession({headers:await headers()});
    if(!session?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
    const body=await request.json();
    if(!body?.titulo||!body?.fechaObjetivo)return NextResponse.json({error:"Título y fecha son obligatorios"},{status:400});
    const categoria=String(body.categoria??"OTRO");
    const esEquipo=CATEGORIAS_EQUIPO.has(categoria);
    if(esEquipo&&(!body.horaInicio||!body.horaFin))return NextResponse.json({error:"Hora de inicio y fin son obligatorias para actividades de equipo"},{status:400});
    const id=randomUUID();const fecha=new Date(`${body.fechaObjetivo}T12:00:00-04:00`);const enviarCorreoEquipo=esEquipo&&body.enviarCorreoEquipo!==false;
    await db.$executeRaw`
      INSERT INTO "nexus_pendiente" ("id","titulo","detalle","categoria","fechaObjetivo","horaInicio","horaFin","enviarCorreoEquipo","prospectoId","clienteId","asignadoAId","creadoPorId")
      VALUES (${id},${String(body.titulo)},${body.detalle?String(body.detalle):null},${categoria},${fecha},${body.horaInicio?String(body.horaInicio):null},${body.horaFin?String(body.horaFin):null},${enviarCorreoEquipo},${body.prospectoId??null},${body.clienteId??null},${esEquipo?null:(body.asignadoAId??null)},${session.user.id})`;
    let correoEstado:string|null=null;
    if(enviarCorreoEquipo){
      const envio=await enviarInvitacionEquipo({titulo:String(body.titulo),detalle:body.detalle?String(body.detalle):null,fecha:String(body.fechaObjetivo),horaInicio:String(body.horaInicio),horaFin:String(body.horaFin),creadoPor:session.user.name??"Equipo GO USA"});
      correoEstado=envio.estado;
      await db.$executeRaw`UPDATE "nexus_pendiente" SET "correoEstado"=${envio.estado},"correoEnviadoAt"=${envio.enviado?new Date():null},"updatedAt"=CURRENT_TIMESTAMP WHERE "id"=${id}`;
    }
    return NextResponse.json({ok:true,id,correoEstado,correoConfigurado:correoEstado!=="CONFIGURAR_CORREO"});
  } catch(error){console.error("pendientes POST",error);return NextResponse.json({error:"No se pudo crear el pendiente"},{status:500});}
}
