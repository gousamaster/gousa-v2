// src/components/system/citas/programar-cita-drawer.tsx
"use client";
import {Loader2} from "lucide-react";
import {useEffect,useMemo,useState} from "react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import {Sheet,SheetContent,SheetHeader,SheetTitle} from "@/components/ui/sheet";
import {Textarea} from "@/components/ui/textarea";
import {obtenerTiposCita} from "@/lib/actions/citas/citas-actions";
import {crearCitaIncluida} from "@/lib/actions/citas/cita-incluida-actions";
import {useSession} from "@/lib/auth-client";

type TramiteParticipante={id:string;cliente:{nombres:string;apellidos:string};servicio:{nombre:string}};
interface Props{open:boolean;onOpenChange:(open:boolean)=>void;tramiteId?:string;grupoFamiliarId?:string;regionId:string;tramitesDisponibles?:TramiteParticipante[];onSuccess:(citaId:string)=>void}

export function ProgramarCitaDrawer({open,onOpenChange,tramiteId,grupoFamiliarId,tramitesDisponibles=[],onSuccess}:Props){
 const{data:session}=useSession();
 const[tiposCita,setTiposCita]=useState<Array<{id:string;nombre:string;precioRegion:number|null}>>([]);
 const[tipoId,setTipoId]=useState("");
 const[fechaHora,setFechaHora]=useState("");
 const[lugar,setLugar]=useState("");
 const[notas,setNotas]=useState("");
 const[participantes,setParticipantes]=useState<string[]>([]);
 const[isSubmitting,setIsSubmitting]=useState(false);
 const[cabina,setCabina]=useState(false);
 const otros=tramitesDisponibles.filter(t=>t.id!==tramiteId);
 const tipoSeleccionado=useMemo(()=>tiposCita.find(t=>t.id===tipoId),[tiposCita,tipoId]);
 const esSimulacro=(tipoSeleccionado?.nombre??"").toLowerCase().includes("simulacr");

 useEffect(()=>{if(!open)return;void(async()=>{const t=await obtenerTiposCita();if(t.success&&t.data)setTiposCita(t.data)})()},[open]);
 useEffect(()=>{if(!esSimulacro)setCabina(false)},[esSimulacro]);
 function toggle(id:string){setParticipantes(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])}
 function cerrar(v:boolean){if(!v){setTipoId("");setFechaHora("");setLugar("");setNotas("");setParticipantes([]);setCabina(false)}onOpenChange(v)}
 async function submit(e:React.FormEvent){
  e.preventDefault();
  if(!session?.user?.id)return;
  if(!tipoId)return toast.error("Selecciona el tipo de cita");
  if(!fechaHora)return toast.error("Registra fecha y hora");
  setIsSubmitting(true);
  const r=await crearCitaIncluida({
   tramiteId:tramiteId??null,
   grupoFamiliarId:grupoFamiliarId??null,
   tipoCitaId:tipoId,
   fechaHora,
   lugar:cabina?"Centro de Simulación Consular · Cabina":lugar||null,
   notas:notas||null,
   participanteTramiteIds:participantes,
  },session.user.id);
  setIsSubmitting(false);
  if(r.success&&r.data){toast.success(cabina?"Simulacro en cabina programado correctamente":"Cita programada correctamente");cerrar(false);onSuccess(r.data.id)}else toast.error(r.error??"Error al programar");
 }

 return <Sheet open={open} onOpenChange={cerrar}><SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4"><SheetHeader><SheetTitle>{grupoFamiliarId?"Programar Cita Grupal":"Programar Cita"}</SheetTitle></SheetHeader><form onSubmit={submit} className="mt-6 space-y-5">
  <div className="space-y-2"><Label>Tipo de cita *</Label><Select value={tipoId} onValueChange={setTipoId}><SelectTrigger><SelectValue placeholder="Selecciona tipo de cita"/></SelectTrigger><SelectContent>{tiposCita.map(t=><SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>)}</SelectContent></Select></div>
  {esSimulacro&&<div className="rounded-lg border border-primary/30 bg-primary/5 p-4"><label className="flex items-start gap-3 cursor-pointer"><Checkbox checked={cabina} onCheckedChange={v=>setCabina(v===true)}/><div><p className="font-semibold">Simulacro en Centro de Simulación Consular</p><p className="text-xs text-muted-foreground">Opción operativa incluida en el servicio contratado. No genera un segundo cobro desde esta agenda.</p></div></label></div>}
  <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Fecha y hora *</Label><Input type="datetime-local" value={fechaHora} onChange={e=>setFechaHora(e.target.value)}/></div><div className="space-y-2"><Label>Lugar</Label><Input disabled={cabina} placeholder="Embajada, consulado..." value={cabina?"Centro de Simulación Consular · Cabina":lugar} onChange={e=>setLugar(e.target.value)}/></div></div>
  <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">La cita o simulacro está asociado al servicio ya contratado. Precios, descuentos y estado de pago se administran únicamente desde <b>Servicios y Trámites</b>.</div>
  {otros.length>0&&<div className="space-y-2"><Label>Participantes adicionales</Label>{otros.map(t=><label key={t.id} className="flex gap-3 border rounded p-2"><Checkbox checked={participantes.includes(t.id)} onCheckedChange={()=>toggle(t.id)}/><span>{t.cliente.nombres} {t.cliente.apellidos}</span></label>)}</div>}
  <div><Label>Notas</Label><Textarea rows={3} value={notas} onChange={e=>setNotas(e.target.value)}/></div>
  <div className="flex gap-3"><Button type="button" variant="outline" className="flex-1" onClick={()=>cerrar(false)}>Cancelar</Button><Button type="submit" className="flex-1" disabled={isSubmitting}>{isSubmitting&&<Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Programar</Button></div>
 </form></SheetContent></Sheet>
}
