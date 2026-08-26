// src/components/system/citas/cliente-citas-tab.tsx
"use client";
import {format} from "date-fns";
import {es} from "date-fns/locale";
import {CalendarX,Loader2} from "lucide-react";
import {useEffect,useState} from "react";
import {Badge} from "@/components/ui/badge";
import {Card,CardContent} from "@/components/ui/card";
import {type CitaListItem,obtenerCitasPorTramite} from "@/lib/actions/citas/citas-actions";
import {obtenerTramitesPorCliente} from "@/lib/actions/tramites/tramites-actions";
import {adjustDateForDisplay} from "@/lib/utils/date-timezone";
import {CitaDetalleDrawer} from "./cita-detalle-drawer";

interface ClienteCitasTabProps{clienteId:string}
const ESTADO_COLORS:Record<string,string>={PROGRAMADA:"bg-blue-100 text-blue-800",COMPLETADA:"bg-green-100 text-green-800",CANCELADA:"bg-red-100 text-red-800",REPROGRAMADA:"bg-yellow-100 text-yellow-800"};
const ESTADO_LABELS:Record<string,string>={PROGRAMADA:"Programada",COMPLETADA:"Completada",CANCELADA:"Cancelada",REPROGRAMADA:"Reprogramada"};

export function ClienteCitasTab({clienteId}:ClienteCitasTabProps){
 const[citas,setCitas]=useState<CitaListItem[]>([]),[isLoading,setIsLoading]=useState(true),[citaDetalleId,setCitaDetalleId]=useState<string|null>(null);
 const cargar=async()=>{setIsLoading(true);const tr=await obtenerTramitesPorCliente(clienteId);if(!tr.success||!tr.data){setIsLoading(false);return}const rs=await Promise.all(tr.data.map(t=>obtenerCitasPorTramite(t.id)));const todas=rs.flatMap(r=>r.success&&r.data?r.data:[]).sort((a,b)=>adjustDateForDisplay(new Date(b.fechaHora)).getTime()-adjustDateForDisplay(new Date(a.fechaHora)).getTime());setCitas(Array.from(new Map(todas.map(c=>[c.id,c])).values()));setIsLoading(false)};
 useEffect(()=>{void cargar()},[clienteId]);
 if(isLoading)return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/></div>;
 if(citas.length===0)return <div className="text-center py-12 text-muted-foreground"><CalendarX className="h-10 w-10 mx-auto mb-3 opacity-40"/><p className="text-sm">Este cliente no tiene citas registradas</p></div>;
 return <><div className="space-y-3">{citas.map(cita=>{const fecha=adjustDateForDisplay(new Date(cita.fechaHora));return <Card key={cita.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={()=>setCitaDetalleId(cita.id)}><CardContent className="py-4"><div className="flex items-start justify-between gap-4"><div className="space-y-1"><div className="flex items-center gap-2 flex-wrap"><p className="font-medium text-sm">{cita.tipoCita.nombre}</p>{cita._count.participantes>1&&<Badge variant="outline" className="text-xs">{cita._count.participantes} participantes</Badge>}</div><p className="text-xs text-muted-foreground">{format(fecha,"EEEE dd 'de' MMMM yyyy — HH:mm",{locale:es})}</p>{cita.lugar&&<p className="text-xs text-muted-foreground">{cita.lugar}</p>}{cita.tramite&&<p className="text-xs text-muted-foreground">Trámite: {cita.tramite.servicio.nombre}</p>}{cita.grupoFamiliar&&<p className="text-xs text-muted-foreground">Grupo: {cita.grupoFamiliar.nombre}</p>}</div><Badge className={ESTADO_COLORS[cita.estado]??""}>{ESTADO_LABELS[cita.estado]??cita.estado}</Badge></div></CardContent></Card>})}</div>{citaDetalleId&&<CitaDetalleDrawer open={!!citaDetalleId} onOpenChange={o=>{if(!o)setCitaDetalleId(null)}} citaId={citaDetalleId} onSuccess={cargar}/>}</>;
}
