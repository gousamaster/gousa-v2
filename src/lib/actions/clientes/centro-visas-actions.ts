"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getClienteCentroVisas, upsertClienteCentroVisas } from "@/lib/cliente-centro-visas";

export async function obtenerCentroVisasCliente(clienteId:string){
  const session=await auth.api.getSession({headers:await headers()});
  if(!session?.user?.id)return {success:false,error:"No autorizado"} as const;
  try{
    const row=await getClienteCentroVisas(clienteId);
    return {success:true,data:row?{mismoCorreo:row.mismoCorreo,email:row.email,passwordGuardada:true}:{mismoCorreo:true,email:"",passwordGuardada:false}} as const;
  }catch(error){console.error("obtenerCentroVisasCliente",error);return {success:false,error:"No se pudo cargar el acceso al Centro de Visas"} as const;}
}

export async function guardarCentroVisasCliente(clienteId:string,input:{mismoCorreo:boolean;email?:string|null;password?:string|null;emailCliente?:string|null}){
  const session=await auth.api.getSession({headers:await headers()});
  if(!session?.user?.id)return {success:false,error:"No autorizado"} as const;
  try{
    const email=(input.mismoCorreo?input.emailCliente:input.email)?.trim()??"";
    if(!email)return {success:false,error:"Debes registrar el correo utilizado en el Centro de Visas"} as const;
    if(!/^\S+@\S+\.\S+$/.test(email))return {success:false,error:"El correo del Centro de Visas no es válido"} as const;
    await upsertClienteCentroVisas({clienteId,mismoCorreo:input.mismoCorreo,email,password:input.password});
    return {success:true} as const;
  }catch(error){
    console.error("guardarCentroVisasCliente",error);
    const msg=error instanceof Error?error.message:"No se pudo guardar el acceso al Centro de Visas";
    return {success:false,error:msg} as const;
  }
}
