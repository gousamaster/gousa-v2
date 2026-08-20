import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureClienteDocumentosSchema, TIPOS_DOCUMENTO_CLIENTE } from "@/lib/cliente-documentos-schema";

const MAX_BYTES = 3 * 1024 * 1024;
const MIME_PERMITIDOS = new Set(["application/pdf","image/jpeg","image/png"]);

function errorPayload(e:unknown,mensaje:string){
  const detalle=e instanceof Error?e.message:String(e);
  const codigo=typeof e==="object"&&e!==null&&"code" in e?String((e as {code?:unknown}).code??""):undefined;
  return process.env.VERCEL_ENV==="preview"?{error:mensaje,detalle,codigo}:{error:mensaje};
}

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    await ensureClienteDocumentosSchema();
    const session=await auth.api.getSession({headers:await headers()});
    if(!session?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
    const {id}=await params;
    const cliente=await db.cliente.findFirst({where:{id,deletedAt:null},select:{id:true}});
    if(!cliente)return NextResponse.json({error:"Cliente no encontrado"},{status:404});
    const docs=await db.$queryRaw<Array<{id:string;tipo:string;nombreArchivo:string;mimeType:string;tamanoBytes:number;createdAt:Date;updatedAt:Date;subidoPorNombre:string}>>`
      SELECT d."id",d."tipo",d."nombreArchivo",d."mimeType",d."tamanoBytes",d."createdAt",d."updatedAt",u."name" AS "subidoPorNombre"
      FROM "cliente_documento_esencial" d
      INNER JOIN "user" u ON u."id"=d."subidoPorId"
      WHERE d."clienteId"=${id}
      ORDER BY d."tipo" ASC`;
    return NextResponse.json({documentos:docs});
  }catch(e){console.error("documentos GET",e);return NextResponse.json(errorPayload(e,"No se pudieron cargar los documentos"),{status:500})}
}

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    await ensureClienteDocumentosSchema();
    const session=await auth.api.getSession({headers:await headers()});
    if(!session?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
    const {id}=await params;
    const cliente=await db.cliente.findFirst({where:{id,deletedAt:null},select:{id:true}});
    if(!cliente)return NextResponse.json({error:"Cliente no encontrado"},{status:404});
    const form=await request.formData();
    const tipo=String(form.get("tipo")??"").toUpperCase();
    if(!(TIPOS_DOCUMENTO_CLIENTE as readonly string[]).includes(tipo))return NextResponse.json({error:"Tipo de documento no válido"},{status:400});
    const archivo=form.get("archivo");
    if(!(archivo instanceof File))return NextResponse.json({error:"Selecciona un archivo"},{status:400});
    if(!MIME_PERMITIDOS.has(archivo.type))return NextResponse.json({error:"Solo se permiten PDF, JPG y PNG"},{status:400});
    if(archivo.size<=0||archivo.size>MAX_BYTES)return NextResponse.json({error:"El archivo debe pesar máximo 3 MB"},{status:400});
    const contenido=Buffer.from(await archivo.arrayBuffer());
    const docId=crypto.randomUUID();
    await db.$executeRaw`
      INSERT INTO "cliente_documento_esencial" ("id","clienteId","tipo","nombreArchivo","mimeType","tamanoBytes","contenido","subidoPorId","createdAt","updatedAt")
      VALUES (${docId},${id},${tipo},${archivo.name},${archivo.type},${archivo.size},${contenido},${session.user.id},NOW(),NOW())
      ON CONFLICT ("clienteId","tipo") DO UPDATE SET
        "nombreArchivo"=EXCLUDED."nombreArchivo",
        "mimeType"=EXCLUDED."mimeType",
        "tamanoBytes"=EXCLUDED."tamanoBytes",
        "contenido"=EXCLUDED."contenido",
        "subidoPorId"=EXCLUDED."subidoPorId",
        "updatedAt"=NOW()`;
    return NextResponse.json({ok:true});
  }catch(e){console.error("documentos POST",e);return NextResponse.json(errorPayload(e,"No se pudo guardar el documento"),{status:500})}
}
