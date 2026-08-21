import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const ROLES_VENTA=new Set(["MANAGER","SUPER_ADMIN"]);

export async function GET(){
  try{
    const session=await auth.api.getSession({headers:await headers()});
    if(!session?.user?.id)return NextResponse.json({error:"No autorizado"},{status:401});
    const usuario=await db.user.findUnique({where:{id:session.user.id},select:{role:true,status:true}});
    if(!usuario||usuario.status!=="ACTIVE"||!ROLES_VENTA.has(String(usuario.role).toUpperCase()))return NextResponse.json({error:"Acceso restringido"},{status:403});
    const usuarios=await db.user.findMany({where:{status:"ACTIVE"},select:{id:true,name:true},orderBy:{name:"asc"}});
    return NextResponse.json({usuarios:usuarios.map(u=>({id:u.id,nombre:u.name}))});
  }catch(e){
    console.error("Error usuarios de venta:",e);
    return NextResponse.json({error:"No se pudieron cargar los usuarios"},{status:500});
  }
}
