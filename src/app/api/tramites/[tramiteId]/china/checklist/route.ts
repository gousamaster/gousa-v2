import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const MAX_BYTES = 3 * 1024 * 1024;
const MIME_PERMITIDOS = new Set(["application/pdf", "image/jpeg", "image/png"]);
const TIPOS = ["ITINERARIO_VUELO","RESERVA_HOSPEDAJE","SEGURO_VIAJE","CARTA_INVITACION","REGISTRO_EMPRESA_INVITANTE","CEDULA_REPRESENTANTE_LEGAL"] as const;
type Tipo = (typeof TIPOS)[number];

type Checklist = Record<Tipo,{listo:boolean;origen:"PROPIO"|"GO_USA"|null}>;
const vacio = (): Checklist => ({
  ITINERARIO_VUELO:{listo:false,origen:null},
  RESERVA_HOSPEDAJE:{listo:false,origen:null},
  SEGURO_VIAJE:{listo:false,origen:null},
  CARTA_INVITACION:{listo:false,origen:null},
  REGISTRO_EMPRESA_INVITANTE:{listo:false,origen:null},
  CEDULA_REPRESENTANTE_LEGAL:{listo:false,origen:null},
});

async function contexto(tramiteId:string){
  const rows=await db.$queryRaw<Array<{servicio:string;fecha_nacimiento:Date|null;checklist:unknown;respaldo_solicitado:boolean}>>`
    select cs.nombre as servicio,c."fechaNacimiento" as fecha_nacimiento,cto.documentos_checklist as checklist,cto.respaldo_solicitado
    from tramite t
    join cliente c on c.id=t."clienteId" and c."deletedAt" is null
    join cliente_servicio clis on clis.id=t."clienteServicioId" and clis."deletedAt" is null
    join catalogo_servicio cs on cs.id=clis."servicioId"
    join china_tramite_operativo cto on cto.tramite_id=t.id
    where t.id=${tramiteId} and t."deletedAt" is null limit 1`;
  return rows[0]??null;
}
function edad(fecha:Date|null){if(!fecha)return null;const h=new Date();let e=h.getFullYear()-fecha.getFullYear();const m=h.getMonth()-fecha.getMonth();if(m<0||(m===0&&h.getDate()<fecha.getDate()))e--;return e;}
function normalizar(v:unknown):Checklist{const base=vacio();if(!v||typeof v!=="object")return base;for(const k of TIPOS){const x=(v as Record<string,unknown>)[k];if(x&&typeof x==="object"){const o=x as Record<string,unknown>;base[k]={listo:o.listo===true,origen:o.origen==="PROPIO"||o.origen==="GO_USA"?o.origen:null};}}return base;}

export async function GET(_r:Request,{params}:{params:Promise<{tramiteId:string}>}){
  try{const s=await auth.api.getSession({headers:await headers()});if(!s?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});const{tramiteId}=await params;const c=await contexto(tramiteId);if(!c)return NextResponse.json({error:"Trámite China no encontrado"},{status:404});const docs=await db.$queryRaw<Array<{tipo:string;nombreArchivo:string;updatedAt:Date}>>`select "tipo","nombreArchivo","updatedAt" from china_tramite_documento where "tramiteId"=${tramiteId} order by "tipo"`;const e=edad(c.fecha_nacimiento);return NextResponse.json({checklist:normalizar(c.checklist),respaldoSolicitado:c.respaldo_solicitado,esVisaM:/negocios|\(m\)|\bm\b/i.test(c.servicio),requiereSeguro:e!==null&&e>60,edad:e,servicio:c.servicio,archivos:docs});}catch(e){console.error("china checklist GET",e);return NextResponse.json({error:"No se pudo cargar el checklist China"},{status:500});}
}

export async function PATCH(r:Request,{params}:{params:Promise<{tramiteId:string}>}){
  try{const s=await auth.api.getSession({headers:await headers()});if(!s?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});const{tramiteId}=await params;const body=await r.json() as {checklist?:unknown;respaldoSolicitado?:boolean};const c=await contexto(tramiteId);if(!c)return NextResponse.json({error:"Trámite China no encontrado"},{status:404});const checklist=normalizar(body.checklist);const e=edad(c.fecha_nacimiento);const esM=/negocios|\(m\)|\bm\b/i.test(c.servicio);const req=["ITINERARIO_VUELO","RESERVA_HOSPEDAJE",...(e!==null&&e>60?["SEGURO_VIAJE"]:[]),...(esM?["CARTA_INVITACION","REGISTRO_EMPRESA_INVITANTE","CEDULA_REPRESENTANTE_LEGAL"]:[])] as Tipo[];const completo=req.every(k=>checklist[k].listo);const json=JSON.stringify(checklist);await db.$executeRaw`update china_tramite_operativo set documentos_checklist=${json}::jsonb,respaldo_solicitado=${body.respaldoSolicitado===true},documentos_subidos=${completo},updated_at=now() where tramite_id=${tramiteId}`;return NextResponse.json({ok:true,documentosSubidos:completo});}catch(e){console.error("china checklist PATCH",e);return NextResponse.json({error:"No se pudo guardar el checklist China"},{status:500});}
}

export async function POST(r:Request,{params}:{params:Promise<{tramiteId:string}>}){
  try{const s=await auth.api.getSession({headers:await headers()});if(!s?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});const{tramiteId}=await params;const c=await contexto(tramiteId);if(!c)return NextResponse.json({error:"Trámite China no encontrado"},{status:404});const f=await r.formData();const tipo=String(f.get("tipo")??"").toUpperCase() as Tipo;if(!TIPOS.includes(tipo))return NextResponse.json({error:"Tipo de documento no válido"},{status:400});const archivo=f.get("archivo");if(!(archivo instanceof File))return NextResponse.json({error:"Selecciona un archivo"},{status:400});if(!MIME_PERMITIDOS.has(archivo.type)||archivo.size<=0||archivo.size>MAX_BYTES)return NextResponse.json({error:"Solo PDF, JPG o PNG de máximo 3 MB"},{status:400});const contenido=Buffer.from(await archivo.arrayBuffer());await db.$executeRaw`insert into china_tramite_documento ("id","tramiteId","tipo","nombreArchivo","mimeType","tamanoBytes","contenido","subidoPorId","createdAt","updatedAt") values (${crypto.randomUUID()},${tramiteId},${tipo},${archivo.name},${archivo.type},${archivo.size},${contenido},${s.user.id},now(),now()) on conflict ("tramiteId","tipo") do update set "nombreArchivo"=excluded."nombreArchivo","mimeType"=excluded."mimeType","tamanoBytes"=excluded."tamanoBytes","contenido"=excluded."contenido","subidoPorId"=excluded."subidoPorId","updatedAt"=now()`;return NextResponse.json({ok:true});}catch(e){console.error("china checklist POST",e);return NextResponse.json({error:"No se pudo cargar el documento China"},{status:500});}
}
