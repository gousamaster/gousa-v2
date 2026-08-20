import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureClienteDocumentosSchema, TIPOS_DOCUMENTO_CLIENTE } from "@/lib/cliente-documentos-schema";

export async function GET(_request:Request,{params}:{params:Promise<{id:string;tipo:string}>}){
  try{
    await ensureClienteDocumentosSchema();
    const session=await auth.api.getSession({headers:await headers()});
    if(!session?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
    const {id,tipo}=await params;
    const t=tipo.toUpperCase();
    if(!(TIPOS_DOCUMENTO_CLIENTE as readonly string[]).includes(t))return NextResponse.json({error:"Tipo no válido"},{status:400});
    const rows=await db.$queryRaw<Array<{nombreArchivo:string;mimeType:string;contenido:Buffer}>>`
      SELECT "nombreArchivo","mimeType","contenido" FROM "cliente_documento_esencial"
      WHERE "clienteId"=${id} AND "tipo"=${t} LIMIT 1`;
    const doc=rows[0];
    if(!doc)return NextResponse.json({error:"Documento no encontrado"},{status:404});
    const safeName=doc.nombreArchivo.replace(/[\r\n"]/g,"_");
    return new NextResponse(doc.contenido,{headers:{"Content-Type":doc.mimeType,"Content-Disposition":`inline; filename="${safeName}"`,"Cache-Control":"private, no-store"}});
  }catch(e){console.error(e);return NextResponse.json({error:"No se pudo abrir el documento"},{status:500})}
}
