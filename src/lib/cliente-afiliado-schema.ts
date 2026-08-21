import { db } from "@/lib/db";

let ready=false;let promise:Promise<void>|null=null;
export async function ensureClienteAfiliadoSchema(){
 if(ready)return;if(promise)return promise;
 promise=(async()=>{
  await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "cliente_afiliado" (
    "clienteId" TEXT PRIMARY KEY REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "afiliado" BOOLEAN NOT NULL DEFAULT TRUE,
    "afiliadoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "afiliadoPorId" TEXT REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "cliente_afiliado_estado_idx" ON "cliente_afiliado"("afiliado")`);
  ready=true;
 })();
 try{await promise;}finally{if(!ready)promise=null;}
}
