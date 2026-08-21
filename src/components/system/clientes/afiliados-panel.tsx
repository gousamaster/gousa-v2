"use client";

import { useEffect,useMemo,useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card,CardContent,CardHeader,CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ClienteListItem } from "@/types/cliente-types";
import { Search,UserCheck,UserMinus } from "lucide-react";
import { toast } from "sonner";

type AfiliadoRow={clienteId:string;afiliado:boolean;afiliadoAt:string};

export function AfiliadosPanel({clientes}:{clientes:ClienteListItem[]}){
 const[ids,setIds]=useState<Set<string>>(new Set());
 const[loading,setLoading]=useState(true);
 const[busqueda,setBusqueda]=useState("");
 const[guardando,setGuardando]=useState<string|null>(null);
 async function cargar(){setLoading(true);try{const r=await fetch("/api/nexus/afiliados",{cache:"no-store"});const j=await r.json();if(!r.ok)throw new Error(j.error??"No se pudieron cargar afiliados");setIds(new Set(((j.afiliados??[]) as AfiliadoRow[]).map(a=>a.clienteId)))}catch(e){toast.error(e instanceof Error?e.message:"No se pudieron cargar afiliados")}finally{setLoading(false)}}
 useEffect(()=>{void cargar()},[]);
 const visibles=useMemo(()=>{const q=busqueda.trim().toLowerCase();return clientes.filter(c=>!q||c.nombreCompleto.toLowerCase().includes(q)||c.email?.toLowerCase().includes(q)||c.telefonoCelular?.toLowerCase().includes(q))},[clientes,busqueda]);
 async function cambiar(clienteId:string,afiliado:boolean){setGuardando(clienteId);try{const r=await fetch("/api/nexus/afiliados",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({clienteId,afiliado})});const j=await r.json();if(!r.ok)throw new Error(j.error??"No se pudo actualizar afiliado");setIds(actual=>{const n=new Set(actual);afiliado?n.add(clienteId):n.delete(clienteId);return n});toast.success(afiliado?"Cliente convertido en afiliado":"Afiliación retirada")}catch(e){toast.error(e instanceof Error?e.message:"No se pudo actualizar afiliado")}finally{setGuardando(null)}}
 const afiliados=clientes.filter(c=>ids.has(c.id));
 return <Card className="border-violet-200 shadow-sm"><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-violet-600"/>Afiliados NEXUS</CardTitle><p className="mt-1 text-sm text-muted-foreground">Tercera condición comercial para campañas, promociones y fidelización.</p></div><Badge className="bg-violet-600">{afiliados.length} afiliado(s)</Badge></div></CardHeader><CardContent className="space-y-4"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" placeholder="Buscar cliente por nombre, email o teléfono..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}/></div>{loading?<p className="text-sm text-muted-foreground">Cargando afiliados...</p>:<div className="max-h-[420px] space-y-2 overflow-auto pr-1">{visibles.map(c=>{const es=ids.has(c.id);return <div key={c.id} className={`flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between ${es?"border-violet-200 bg-violet-50/50":""}`}><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-medium">{c.nombreCompleto}</span>{es&&<Badge className="bg-violet-600">AFILIADO</Badge>}</div><div className="mt-1 text-xs text-muted-foreground">{c.telefonoCelular??"Sin teléfono"}{c.email?` · ${c.email}`:""}</div></div><Button size="sm" variant={es?"outline":"default"} disabled={guardando===c.id} onClick={()=>void cambiar(c.id,!es)}>{es?<><UserMinus className="mr-2 h-4 w-4"/>Quitar afiliación</>:<><UserCheck className="mr-2 h-4 w-4"/>Convertir en afiliado</>}</Button></div>})}{visibles.length===0&&<div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">No hay clientes que coincidan con la búsqueda.</div>}</div>}</CardContent></Card>
}
