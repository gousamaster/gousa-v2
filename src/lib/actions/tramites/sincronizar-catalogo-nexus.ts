"use server";
import {db} from "@/lib/db";
import {CATALOGO_SERVICIOS_NEXUS} from "@/config/catalogo-servicios-nexus";

const LEGACY=[
"Asesoria Nueva Visa B1/B2 Cliente A -15anos","Asesoria Nueva Visa B1/B2 Cliente A +15anos","Asesoria Nueva Visa B1/B2 Cliente B -15anos","Asesoria Nueva Visa B1/B2 Cliente B +15anos","Asesoria Nueva Visa B1/B2 Cliente C -15anos","Asesoria Nueva Visa B1/B2 Cliente C +15anos","Asesoria Nueva Visa B1/B2 con PERDON MIGRATORIO","Asesoria Nueva Visa F1-J1 Cliente A","Asesoria Nueva Visa F1-J1 Cliente B","Asesoria Renovacion Visa B1/B2 por Courier","Asesoria Renovacion Visa B1/B2 con Entrevista","Asesoria Nueva Visa Categoria Otros/Especial",null,"Asesoria Migratoria y Evaluacion 30 Minutos","Asesoria Migratoria y Evaluacion 1 Hora","Asesoria Ultima Hora","Recuperacion de Cuenta e Impresion","Reprogramacion y Monitoreo de Cita","Recojo y despacho de Documento","Asesoria Renovacion Pasaporte Americano","Servicio de Asesoria Personalizada"] as const;

export async function sincronizarCatalogoNexus(){
 const regiones=await db.region.findMany({where:{activo:true}});
 const actuales=await db.catalogoServicio.findMany();
 for(const item of CATALOGO_SERVICIOS_NEXUS){
   const legacy=item.orden<=12?LEGACY[item.orden-1]:item.orden>=15&&item.orden<=23?LEGACY[item.orden-2]:null;
   let s=actuales.find(x=>x.nombre===item.nombre)||(legacy?actuales.find(x=>x.nombre===legacy):undefined);
   if(s)s=await db.catalogoServicio.update({where:{id:s.id},data:{nombre:item.nombre,activo:true,orden:item.orden,requiereTramite:item.orden<=14||[24,25,26,28].includes(item.orden)}});
   else s=await db.catalogoServicio.create({data:{nombre:item.nombre,codigo:`NEXUS-${String(item.orden).padStart(2,"0")}`,activo:true,orden:item.orden,requiereTramite:item.orden<=14||[24,25,26,28].includes(item.orden)}});
   for(const r of regiones){const recargo=!/la\s*paz/i.test(r.nombre)&&item.recargoRegional?100:0;await db.servicioPrecioPorRegion.upsert({where:{servicioId_regionId:{servicioId:s.id,regionId:r.id}},create:{servicioId:s.id,regionId:r.id,precio:item.precio+recargo,activo:true},update:{precio:item.precio+recargo,activo:true}})}
 }
 await db.catalogoServicio.updateMany({where:{nombre:{contains:"FAMILIAR",mode:"insensitive"}},data:{activo:false}});
 return {success:true};
}
