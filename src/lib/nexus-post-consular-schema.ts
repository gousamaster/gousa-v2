import { db } from "@/lib/db";

let ready=false;let promise:Promise<void>|null=null;
export async function ensureNexusPostConsularSchema(){
 if(ready)return;if(promise)return promise;
 promise=(async()=>{
  await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "nexus_post_consular" (
   "citaId" TEXT PRIMARY KEY REFERENCES "cita"("id") ON DELETE CASCADE ON UPDATE CASCADE,
   "clienteId" TEXT REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE,
   "autorizacionAisActualizada" BOOLEAN NOT NULL DEFAULT FALSE,
   "autorizacionAisAt" TIMESTAMP(3),
   "fedexEnviado" BOOLEAN NOT NULL DEFAULT FALSE,
   "fedexEnviadoAt" TIMESTAMP(3),
   "codigoOp" TEXT,
   "documentoRetornado" BOOLEAN NOT NULL DEFAULT FALSE,
   "documentoRetornadoAt" TIMESTAMP(3),
   "entregadoCliente" BOOLEAN NOT NULL DEFAULT FALSE,
   "entregadoClienteAt" TIMESTAMP(3),
   "informadoCliente" BOOLEAN NOT NULL DEFAULT FALSE,
   "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "nexus_renovacion" (
   "tramiteId" TEXT PRIMARY KEY REFERENCES "tramite"("id") ON DELETE CASCADE ON UPDATE CASCADE,
   "clienteId" TEXT REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE,
   "via" TEXT NOT NULL,
   "fechaDespacho" TIMESTAMP(3),
   "fechaRetorno" TIMESTAMP(3),
   "entregadoCliente" BOOLEAN NOT NULL DEFAULT FALSE,
   "entregadoAt" TIMESTAMP(3),
   "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  ready=true;
 })();try{await promise;}finally{if(!ready)promise=null;}
}
