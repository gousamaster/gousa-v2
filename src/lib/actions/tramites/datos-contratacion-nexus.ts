"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ServicioCatalogo } from "@/lib/actions/tramites/servicios-actions";

function esSolicitudVisa(nombre:string){
  return /^(Solicitud\s+.*Visa|Visa\s+China\s*\+\s*Canton\s+Fair\s+Pack)/i.test(nombre.trim());
}

export async function obtenerDatosContratacionNexus(regionId:string){
  try{
    const session=await auth.api.getSession({headers:await headers()});
    if(!session?.user?.id)return {success:false,error:"No autorizado"} as const;

    const [servicios,estadosPago,usuario]=await Promise.all([
      db.catalogoServicio.findMany({
        where:{activo:true},
        include:{preciosPorRegion:{where:{regionId,activo:true},take:1}},
        orderBy:{orden:"asc"},
      }),
      db.catalogoEstadoPago.findMany({
        where:{activo:true},
        select:{id:true,nombre:true,color:true},
        orderBy:{orden:"asc"},
      }),
      db.user.findUnique({where:{id:session.user.id},select:{role:true}}),
    ]);

    const catalogo:ServicioCatalogo[]=servicios.map(s=>({
      id:s.id,
      nombre:s.nombre,
      codigo:s.codigo,
      requiereTramite:s.requiereTramite,
      precioRegion:s.preciosPorRegion[0]?Number(s.preciosPorRegion[0].precio):null,
      esSolicitudVisa:esSolicitudVisa(s.nombre),
    }));

    return {
      success:true,
      data:{
        servicios:catalogo,
        estadosPago,
        puedeEditarPrecio:usuario?.role==="SUPER_ADMIN"||usuario?.role==="MANAGER",
      },
    } as const;
  }catch(error){
    console.error("obtenerDatosContratacionNexus",error);
    return {success:false,error:"No se pudieron cargar los datos de contratación"} as const;
  }
}
