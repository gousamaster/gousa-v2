"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardContent,CardHeader,CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {confirmarPagoArancel,obtenerArancelesPendientesTime,reenviarHojaArancel,type ArancelPendienteTime} from "@/lib/actions/tramites/arancel-actions";
import {toast} from "sonner";

export function ArancelesTimeCard(){
 const[items,setItems]=useState<ArancelPendienteTime[]>([]),[loading,setLoading]=useState(true),[fecha,setFecha]=useState<Record<string,string>>({}),[obs,setObs]=useState<Record<string,string>>({});
 const cargar=async()=>{setLoading(true);const r=await obtenerArancelesPendientesTime();if(r.success&&r.data)setItems(r.data);setLoading(false)};
 useEffect(()=>{void cargar()},[]);
 async function confirmar(id:string){const r=await confirmarPagoArancel(id);if(!r.success)return toast.error(r.error);toast.success("Pago de arancel confirmado");await cargar()}
 async function reenviar(id:string){if(!fecha[id])return toast.error("Selecciona la nueva fecha de envío");const r=await reenviarHojaArancel(id,fecha[id],obs[id]);if(!r.success)return toast.error(r.error);toast.success("Reenvío registrado y nuevo seguimiento programado");setFecha(v=>({...v,[id]:""}));setObs(v=>({...v,[id]:""}));await cargar()}
 return <Card><CardHeader><div className="flex items-center justify-between gap-3"><div><CardTitle className="text-base">Pago de Arancel · Seguimiento</CardTitle><p className="mt-1 text-sm text-muted-foreground">Hojas de pago con 24 horas cumplidas y todavía sin confirmación.</p></div><Badge variant={items.length?"destructive":"secondary"}>{items.length}</Badge></div></CardHeader><CardContent>{loading?<p className="text-sm text-muted-foreground">Cargando pendientes...</p>:items.length===0?<p className="text-sm text-muted-foreground">No hay pagos de arancel pendientes de seguimiento.</p>:<div className="space-y-3">{items.map(i=><div key={i.id} className="rounded-lg border p-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">Pago de Arancel pendiente · {i.clienteNombre}</p><p className="text-xs text-muted-foreground">{i.servicioNombre}</p><p className="mt-1 text-xs text-muted-foreground">Hoja enviada: {new Date(i.fechaEnvio).toLocaleString("es-BO")} · seguimiento vencido: {new Date(i.venceAt).toLocaleString("es-BO")}</p>{i.observacion&&<p className="mt-1 text-xs">Obs.: {i.observacion}</p>}</div><Button asChild size="sm" variant="outline"><Link href={`/clients/${i.clienteId}`}>Abrir cliente</Link></Button></div><div className="mt-3 flex flex-wrap gap-2"><Button size="sm" onClick={()=>void confirmar(i.tramiteId)}>Pago realizado</Button></div><div className="mt-3 grid gap-2 md:grid-cols-[180px_1fr_auto]"><Input type="datetime-local" value={fecha[i.tramiteId]??""} onChange={e=>setFecha(v=>({...v,[i.tramiteId]:e.target.value}))}/><Textarea rows={1} placeholder="Motivo / observación del reenvío" value={obs[i.tramiteId]??""} onChange={e=>setObs(v=>({...v,[i.tramiteId]:e.target.value}))}/><Button size="sm" variant="outline" onClick={()=>void reenviar(i.tramiteId)}>Reenviar hoja</Button></div></div>)}</div>}</CardContent></Card>
}
