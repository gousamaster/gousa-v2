"use client";

import { useCallback,useEffect,useState } from "react";
import { CalendarPlus,ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card,CardContent,CardHeader,CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from "@/components/ui/select";

type Usuario={id:string;name:string;email?:string};
const CATEGORIAS=[
  ["CIERRE_PROSPECTO","Cerrar / dar seguimiento a prospecto"],
  ["DOCUMENTOS","Solicitar o revisar documentos"],
  ["PAGO","Cobro / pago pendiente"],
  ["LLAMADA","Llamar o contactar"],
  ["REUNION_EQUIPO","Reunión de equipo"],
  ["FORMACION_EQUIPO","Formación / capacitación"],
  ["OTRO","Otro pendiente"],
] as const;
const esActividadEquipo=(v:string)=>v==="REUNION_EQUIPO"||v==="FORMACION_EQUIPO";
function fechaBolivia(){const d=new Date(new Date().toLocaleString("en-US",{timeZone:"America/La_Paz"}));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}

export function PendientesTimeCard(){
 const[usuarios,setUsuarios]=useState<Usuario[]>([]),[error,setError]=useState<string|null>(null),[success,setSuccess]=useState<string|null>(null),[saving,setSaving]=useState(false);
 const[titulo,setTitulo]=useState(""),[detalle,setDetalle]=useState(""),[categoria,setCategoria]=useState("CIERRE_PROSPECTO"),[fechaObjetivo,setFechaObjetivo]=useState(fechaBolivia()),[asignadoAId,setAsignadoAId]=useState("SIN_ASIGNAR"),[horaInicio,setHoraInicio]=useState("09:00"),[horaFin,setHoraFin]=useState("10:00"),[enviarCorreoEquipo,setEnviarCorreoEquipo]=useState(true);
 const actividadEquipo=esActividadEquipo(categoria);
 const cargarUsuarios=useCallback(async()=>{try{const r=await fetch("/api/nexus/pendientes",{cache:"no-store"});const j=await r.json();if(r.ok)setUsuarios(j.usuarios??[])}catch{}},[]);
 useEffect(()=>{void cargarUsuarios()},[cargarUsuarios]);
 async function crear(){if(!titulo.trim()){setError("Escribe un título para la actividad");return;}if(!horaInicio){setError("La hora es obligatoria");return;}if(actividadEquipo&&!horaFin){setError("Define la hora de fin");return;}setSaving(true);setError(null);setSuccess(null);try{const r=await fetch("/api/nexus/pendientes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({titulo:titulo.trim(),detalle:detalle.trim()||null,categoria,fechaObjetivo,horaInicio,horaFin:actividadEquipo?horaFin:null,enviarCorreoEquipo:actividadEquipo?enviarCorreoEquipo:false,asignadoAId:actividadEquipo?null:(asignadoAId==="SIN_ASIGNAR"?null:asignadoAId)})});const j=await r.json();if(!r.ok)throw new Error(j.error??"No se pudo crear la actividad");if(actividadEquipo&&enviarCorreoEquipo){setSuccess(j.correoEstado==="ENVIADO"?"Actividad creada e invitación enviada al equipo.":j.correoEstado==="CONFIGURAR_CORREO"?"Actividad creada. Falta configurar el servicio de correo para enviar invitaciones automáticamente.":"Actividad creada; la invitación por correo quedó pendiente de envío.")}else setSuccess("Actividad creada correctamente. Ya aparece en Jornada NEXUS.");setTitulo("");setDetalle("");setFechaObjetivo(fechaBolivia())}catch(e){setError(e instanceof Error?e.message:"No se pudo crear la actividad")}finally{setSaving(false)}}
 return <Card className="border-amber-200 shadow-sm"><CardHeader className="pb-3"><div><CardTitle className="flex items-center gap-2 text-base"><ClipboardCheck className="h-5 w-5"/>Crear pendiente / actividad</CardTitle><p className="mt-1 text-xs text-muted-foreground">Todo lo que crees aquí aparecerá ordenado por hora en Jornada NEXUS.</p></div></CardHeader><CardContent className="space-y-4">{error&&<div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>}{success&&<div className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-700">{success}</div>}<div className="rounded-xl border bg-muted/20 p-4"><div className="mb-3 flex items-center gap-2 text-sm font-semibold"><CalendarPlus className="h-4 w-4"/>Nueva actividad</div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><div className="xl:col-span-2"><Label>Título</Label><Input value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder={actividadEquipo?"Ej. Capacitación NEXUS del equipo":"Ej. Llamar a Juan para cerrar solicitud"}/></div><div><Label>Fecha</Label><Input type="date" value={fechaObjetivo} onChange={e=>setFechaObjetivo(e.target.value)}/></div><div><Label>Tipo</Label><Select value={categoria} onValueChange={v=>{setCategoria(v);if(esActividadEquipo(v))setAsignadoAId("SIN_ASIGNAR")}}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{CATEGORIAS.map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div><div><Label>{actividadEquipo?"Hora inicio":"Hora"}</Label><Input type="time" value={horaInicio} onChange={e=>setHoraInicio(e.target.value)}/></div>{actividadEquipo&&<div><Label>Hora fin</Label><Input type="time" value={horaFin} onChange={e=>setHoraFin(e.target.value)}/></div>}<div className="xl:col-span-2"><Label>Detalle opcional</Label><Input value={detalle} onChange={e=>setDetalle(e.target.value)} placeholder="Nota breve para el equipo"/></div>{!actividadEquipo&&<div><Label>Responsable</Label><Select value={asignadoAId} onValueChange={setAsignadoAId}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="SIN_ASIGNAR">Todo el equipo</SelectItem>{usuarios.map(u=><SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent></Select></div>}{actividadEquipo&&<div className="flex items-end"><label className="flex h-10 cursor-pointer items-center gap-2 rounded-md border bg-background px-3 text-sm"><Checkbox checked={enviarCorreoEquipo} onCheckedChange={v=>setEnviarCorreoEquipo(v===true)}/><span>Enviar invitación por correo al equipo</span></label></div>}<div className="flex items-end"><Button className="w-full" onClick={()=>void crear()} disabled={saving||!titulo.trim()}>{saving?"Guardando...":"Crear actividad"}</Button></div></div></div></CardContent></Card>;
}
