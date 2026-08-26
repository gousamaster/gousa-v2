"use server";
import {db} from "@/lib/db";
import {CATALOGO_SERVICIOS_NEXUS} from "@/config/catalogo-servicios-nexus";

const LEGACY=[
"Asesoria Nueva Visa B1/B2 Cliente A -15anos","Asesoria Nueva Visa B1/B2 Cliente A +15anos","Asesoria Nueva Visa B1/B2 Cliente B -15anos","Asesoria Nueva Visa B1/B2 Cliente B +15anos","Asesoria Nueva Visa B1/B2 Cliente C -15anos","Asesoria Nueva Visa B1/B2 Cliente C +15anos","Asesoria Nueva Visa B1/B2 con PERDON MIGRATORIO","Asesoria Nueva Visa F1-J1 Cliente A","Asesoria Nueva Visa F1-J1 Cliente B","Asesoria Renovacion Visa B1/B2 por Courier","Asesoria Renovacion Visa B1/B2 con Entrevista","Asesoria Nueva Visa Categoria Otros/Especial",null,"Asesoria Migratoria y Evaluacion 30 Minutos","Asesoria Migratoria y Evaluacion 1 Hora","Asesoria Ultima Hora","Recuperacion de Cuenta e Impresion","Reprogramacion y Monitoreo de Cita","Recojo y despacho de Documento","Asesoria Renovacion Pasaporte Americano","Servicio de Asesoria Personalizada"] as const;

function legacyPara(orden:number){
 if(orden<=12)return LEGACY[orden-1];
 if(orden===15||orden===16)return LEGACY[orden-2];
 if(orden>=18&&orden<=23)return LEGACY[orden-3];
 return null;
}

export async function sincronizarCatalogoNexus(){
 const regiones=await db.region.findMany({where:{activo:true}});
 const actuales=await db.catalogoServicio.findMany();
 for(const item of CATALOGO_SERVICIOS_NEXUS){
   const legacy=legacyPara(item.orden);
   let s=actuales.find(x=>x.nombre===item.nombre)||(legacy?actuales.find(x=>x.nombre===legacy):undefined);
   if(s)s=await db.catalogoServicio.update({where:{id:s.id},data:{nombre:item.nombre,activo:true,orden:item.orden,requiereTramite:item.orden<=14||[24,25,26,28].includes(item.orden)}});
   else s=await db.catalogoServicio.create({data:{nombre:item.nombre,codigo:`NEXUS-${String(item.orden).padStart(2,"0")}`,activo:true,orden:item.orden,requiereTramite:item.orden<=14||[24,25,26,28].includes(item.orden)}});
   for(const r of regiones){const recargo=!/la\s*paz/i.test(r.nombre)&&item.recargoRegional?100:0;await db.servicioPrecioPorRegion.upsert({where:{servicioId_regionId:{servicioId:s.id,regionId:r.id}},create:{servicioId:s.id,regionId:r.id,precio:item.precio+recargo,activo:true},update:{precio:item.precio+recargo,activo:true}})}
 }
 // Catálogo viejo: no debe convivir con las nuevas Solicitudes.
 await db.catalogoServicio.updateMany({
   where:{OR:[
     {nombre:{contains:"Asesoria Nueva Visa B1/B2",mode:"insensitive"}},
     {nombre:{contains:"Asesoría Nueva Visa B1/B2",mode:"insensitive"}},
     {nombre:{contains:"Asesoria Nueva Visa F1",mode:"insensitive"}},
     {nombre:{contains:"Asesoría Nueva Visa F1",mode:"insensitive"}},
     {nombre:{contains:"Asesoria Renovacion Visa B1/B2",mode:"insensitive"}},
     {nombre:{contains:"Asesoría Renovación Visa B1/B2",mode:"insensitive"}},
     {nombre:{contains:"Asesoria Nueva Visa Categoria",mode:"insensitive"}},
     {nombre:{contains:"Asesoría Nueva Visa Categoría",mode:"insensitive"}},
     {nombre:{contains:"FAMILIAR",mode:"insensitive"}}
   ]},
   data:{activo:false}
 });
 // Reactiva explícitamente toda la matriz oficial por si algún nombre moderno coincidió con un filtro previo.
 await db.catalogoServicio.updateMany({where:{nombre:{in:CATALOGO_SERVICIOS_NEXUS.map(x=>x.nombre)}},data:{activo:true}});
 return {success:true};
}
