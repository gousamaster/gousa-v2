import { db } from "@/lib/db";

let ready=false;let promise:Promise<void>|null=null;
export async function ensureDs160OperativoSchema(){
 if(ready)return;if(promise)return promise;
 promise=(async()=>{
  await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "nexus_ds160" (
    "clienteId" TEXT PRIMARY KEY REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "applicationId" TEXT,
    "respuestaSeguridadEncrypted" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'INICIADO',
    "motivoViaje" TEXT,
    "lugarViaje" TEXT,
    "tiempoEstadia" TEXT,
    "contactoUsa" TEXT,
    "ocupacionDetalleEs" TEXT,
    "ocupacionDetalleEn" TEXT,
    "negacionAnteriorEs" TEXT,
    "negacionAnteriorEn" TEXT,
    "revisadoDirector" BOOLEAN NOT NULL DEFAULT FALSE,
    "revisadoAt" TIMESTAMP(3),
    "revisadoPorId" TEXT REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "cerradoAt" TIMESTAMP(3),
    "cerradoPorId" TEXT REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "nexus_ds160_estado_idx" ON "nexus_ds160"("estado")`);
  ready=true;
 })();
 try{await promise;}finally{if(!ready)promise=null;}
}
