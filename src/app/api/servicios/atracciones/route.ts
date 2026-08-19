import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureAtraccionesSchema } from "@/lib/atracciones-schema";

type TipoPersona="PROSPECTO"|"CLIENTE";
type Row={id:string;numeroOrden:string;prospectoId:string|null;clienteId:string|null;tipoPersona:TipoPersona;personaNombre:string;destino:string;tipoAtraccion:string;especificacion:string;fechaInicio:string;dias:number;adultos:number;menores9:number;upgrade:boolean;upgradeDetalle:string|null;detalles:string|null;estado:"PENDIENTE"|"DESPACHADA";creadoPorNombre:string;createdAt:string;despachadoAt:string|null};
const TIPOS=["Parque","Show","Concierto","Juego","Evento"];
function tipoPersona(v:unknown):TipoPersona{return v==="CLIENTE"?"CLIENTE":"PROSPECTO"}

export async function GET(){
  try{
    await ensureAtraccionesSchema();
    const ordenes=await db.$queryRaw<Row[]>`
      SELECT o."id",o."numeroOrden",o."prospectoId",o."clienteId",
      CASE WHEN o."clienteId" IS NOT NULL THEN 'CLIENTE' ELSE 'PROSPECTO' END AS "tipoPersona",
      CASE WHEN o."clienteId" IS NOT NULL THEN CONCAT(c."nombres",' ',c."apellidos") ELSE CONCAT(p."nombres",CASE WHEN p."apellidos" IS NOT NULL AND p."apellidos"<>'' THEN CONCAT(' ',p."apellidos") ELSE '' END) END AS "personaNombre",
      o."destino",o."tipoAtraccion",o."especificacion",o."fechaInicio"::text,o."dias",o."adultos",o."menores9",o."upgrade",o."upgradeDetalle",o."detalles",o."estado",u."name" AS "creadoPorNombre",o."createdAt"::text,o."despachadoAt"::text
      FROM "orden_cotizacion_atracciones" o
      LEFT JOIN "prospecto" p ON p."id"=o."prospectoId"
      LEFT JOIN "cliente" c ON c."id"=o."clienteId"
      INNER JOIN "user" u ON u."id"=o."creadoPorId"
      WHERE (o."prospectoId" IS NULL OR p."deletedAt" IS NULL) AND (o."clienteId" IS NULL OR (c."deletedAt" IS NULL AND c."activo"=true))
      ORDER BY o."createdAt" DESC`;
    return NextResponse.json({ordenes});
  }catch(e){console.error(e);return NextResponse.json({error:"No se pudieron obtener las órdenes de Atracciones"},{status:500})}
}

export async function POST(request:Request){
  try{
    await ensureAtraccionesSchema();
    const s=await auth.api.getSession({headers:await headers()});
    if(!s?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
    const b=await request.json();
    const tp=tipoPersona(b.tipoPersona),personaId=typeof b.personaId==="string"?b.personaId.trim():"",destino=typeof b.destino==="string"?b.destino.trim():"",tipoAtraccion=typeof b.tipoAtraccion==="string"?b.tipoAtraccion.trim():"",especificacion=typeof b.especificacion==="string"?b.especificacion.trim():"",fechaInicio=typeof b.fecha==="string"?b.fecha:"",dias=Number(b.dias??1),adultos=Number(b.adultos),menores9=Number(b.menores??0),upgrade=b.upgrade===true,upgradeDetalle=upgrade&&typeof b.upgradeDetalle==="string"&&b.upgradeDetalle.trim()?b.upgradeDetalle.trim():null,detalles=typeof b.detalles==="string"&&b.detalles.trim()?b.detalles.trim():null;
    if(!personaId||!destino||!especificacion||!fechaInicio)return NextResponse.json({error:"Completa persona, destino, especificación y fecha"},{status:400});
    if(!TIPOS.includes(tipoAtraccion))return NextResponse.json({error:"Tipo de atracción no válido"},{status:400});
    if(!Number.isInteger(dias)||dias<1||dias>30)return NextResponse.json({error:"El número de días debe estar entre 1 y 30"},{status:400});
    if(!Number.isInteger(adultos)||adultos<1)return NextResponse.json({error:"Debe haber al menos 1 adulto"},{status:400});
    if(!Number.isInteger(menores9)||menores9<0)return NextResponse.json({error:"Cantidad de menores no válida"},{status:400});
    if(upgrade&&!upgradeDetalle)return NextResponse.json({error:"Especifica el tipo de Upgrade"},{status:400});
    let prospectoId:string|null=null,clienteId:string|null=null;
    if(tp==="CLIENTE"){const c=await db.cliente.findFirst({where:{id:personaId,deletedAt:null,activo:true},select:{id:true}});if(!c)return NextResponse.json({error:"Cliente no disponible"},{status:404});clienteId=c.id}else{const p=await db.prospecto.findFirst({where:{id:personaId,deletedAt:null},select:{id:true}});if(!p)return NextResponse.json({error:"Prospecto no disponible"},{status:404});prospectoId=p.id}
    const anio=new Date().getFullYear(),id=crypto.randomUUID();
    const creada=await db.$transaction(async tx=>{
      const c=await tx.$queryRaw<Array<{ultimo:number}>>`INSERT INTO "orden_cotizacion_atracciones_contador" ("anio","ultimo") VALUES (${anio},1) ON CONFLICT ("anio") DO UPDATE SET "ultimo"="orden_cotizacion_atracciones_contador"."ultimo"+1 RETURNING "ultimo"`;
      const numeroOrden=`ATR-${anio}-${String(Number(c[0]?.ultimo??1)).padStart(4,"0")}`;
      const rows=await tx.$queryRaw<Row[]>`INSERT INTO "orden_cotizacion_atracciones" ("id","numeroOrden","prospectoId","clienteId","destino","tipoAtraccion","especificacion","fechaInicio","dias","adultos","menores9","upgrade","upgradeDetalle","detalles","estado","creadoPorId","createdAt","updatedAt") VALUES (${id},${numeroOrden},${prospectoId},${clienteId},${destino},${tipoAtraccion},${especificacion},${fechaInicio}::date,${dias},${adultos},${menores9},${upgrade},${upgradeDetalle},${detalles},'PENDIENTE',${s.user.id},NOW(),NOW()) RETURNING "id","numeroOrden","prospectoId","clienteId",${tp} AS "tipoPersona",'' AS "personaNombre","destino","tipoAtraccion","especificacion","fechaInicio"::text,"dias","adultos","menores9","upgrade","upgradeDetalle","detalles","estado",${s.user.name??"—"} AS "creadoPorNombre","createdAt"::text,"despachadoAt"::text`;
      return rows[0];
    });
    return NextResponse.json({orden:creada},{status:201});
  }catch(e){console.error(e);return NextResponse.json({error:"No se pudo crear la orden de Atracciones"},{status:500})}
}
