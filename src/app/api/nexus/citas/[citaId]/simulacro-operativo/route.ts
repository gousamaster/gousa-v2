import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureSimulacroOperativoSchema } from "@/lib/simulacro-operativo-schema";

const DEP=["Soporte Motivo de Viaje","Soporte Contacto en USA","Soporte Acompanantes de Viaje","Certificado de Trabajo","Boletas de Pago 3/Ult-Mes","Detalle GESTORA","NIT","Extractos Bancarios 3/Ult-Mes","Documentos Propiedades Bienes Inmuebles","Documentos Propiedades Vehiculares","Documentos de Patrimonio o Dinero Notarial","Certificado de Estudios"];
const IND=["Soporte Motivo de Viaje","Soporte Contacto en USA","Soporte Acompanantes de Viaje","NIT","Pago de Impuesto","Licencia de Funcionamiento / Patente","Documentos Comerciales(Facturas)","Contratos con clientes","Extractos Bancarios 3/Ult-Mes","Documentos Propiedades Bienes Inmuebles","Documentos Propiedades Vehiculares","Documentos de Patrimonio o Dinero Notarial","Certificado de Estudios"];

type Documento={nombre:string;presente:boolean;extra?:boolean};

export async function GET(_req:Request,{params}:{params:Promise<{citaId:string}>}){
  await ensureSimulacroOperativoSchema();
  const session=await auth.api.getSession({headers:await headers()});
  if(!session?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
  const {citaId}=await params;
  const rows=await db.$queryRaw<Array<{perfil:string|null;documentos:Documento[]|null;observaciones:string|null;realizado:boolean;realizadoAt:Date|null;atendidoPorId:string|null;atendidoPor:string|null}>>`
    SELECT so."perfil",so."documentos",so."observaciones",so."realizado",so."realizadoAt",so."atendidoPorId",u."name" AS "atendidoPor"
    FROM "simulacro_operativo" so LEFT JOIN "user" u ON u."id"=so."atendidoPorId" WHERE so."citaId"=${citaId}`;
  const usuarios=await db.user.findMany({where:{status:"ACTIVE"},select:{id:true,name:true},orderBy:{name:"asc"}});
  return NextResponse.json({registro:rows[0]??null,plantillas:{DEPENDIENTE:DEP,INDEPENDIENTE:IND},usuarios});
}

export async function POST(req:Request,{params}:{params:Promise<{citaId:string}>}){
  await ensureSimulacroOperativoSchema();
  const session=await auth.api.getSession({headers:await headers()});
  if(!session?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
  const {citaId}=await params;
  const body=await req.json();
  const perfil=body.perfil==="INDEPENDIENTE"?"INDEPENDIENTE":"DEPENDIENTE";
  const documentos=Array.isArray(body.documentos)?body.documentos:[];
  const observaciones=body.observaciones?String(body.observaciones):null;
  const realizado=body.realizado===true;
  const atendidoPorId=body.atendidoPorId?String(body.atendidoPorId):null;
  await db.$executeRaw`
    INSERT INTO "simulacro_operativo" ("citaId","perfil","documentos","observaciones","realizado","realizadoAt","atendidoPorId","updatedAt")
    VALUES (${citaId},${perfil},${JSON.stringify(documentos)}::jsonb,${observaciones},${realizado},${realizado?new Date():null},${atendidoPorId},CURRENT_TIMESTAMP)
    ON CONFLICT ("citaId") DO UPDATE SET "perfil"=EXCLUDED."perfil","documentos"=EXCLUDED."documentos","observaciones"=EXCLUDED."observaciones","realizado"=EXCLUDED."realizado","realizadoAt"=CASE WHEN EXCLUDED."realizado" THEN COALESCE("simulacro_operativo"."realizadoAt",CURRENT_TIMESTAMP) ELSE NULL END,"atendidoPorId"=EXCLUDED."atendidoPorId","updatedAt"=CURRENT_TIMESTAMP`;
  return NextResponse.json({ok:true});
}
