// src/components/system/citas/cita-detalle-drawer.tsx
"use client";
import {zodResolver} from "@hookform/resolvers/zod";
import {format} from "date-fns";
import {es} from "date-fns/locale";
import {CalendarCheck,Loader2,Save,UserCheck,UserX} from "lucide-react";
import {useEffect,useState} from "react";
import {Controller,useForm} from "react-hook-form";
import {toast} from "sonner";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import {Separator} from "@/components/ui/separator";
import {Sheet,SheetContent,SheetHeader,SheetTitle} from "@/components/ui/sheet";
import {Textarea} from "@/components/ui/textarea";
import {actualizarCita,type CitaDetalle,obtenerCitaPorId,registrarAsistencia} from "@/lib/actions/citas/citas-actions";
import {adjustDateForDisplay,formatForDateTimeLocal} from "@/lib/utils/date-timezone";
import {type UpdateCitaFormData,updateCitaSchema} from "@/validations/cita-validations";

const ESTADOS_CITA=[{value:"PROGRAMADA",label:"Programada"},{value:"COMPLETADA",label:"Completada"},{value:"CANCELADA",label:"Cancelada"},{value:"REPROGRAMADA",label:"Reprogramada"}] as const;
interface Props{open:boolean;onOpenChange:(open:boolean)=>void;citaId:string;onSuccess:()=>void}

export function CitaDetalleDrawer({open,onOpenChange,citaId,onSuccess}:Props){
 const[cita,setCita]=useState<CitaDetalle|null>(null),[isLoading,setIsLoading]=useState(true);
 const cargar=async()=>{setIsLoading(true);const r=await obtenerCitaPorId(citaId);if(r.success&&r.data)setCita(r.data);setIsLoading(false)};
 useEffect(()=>{if(open)void cargar()},[open,citaId]);
 if(!open)return null;
 return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-4"><SheetHeader><SheetTitle className="flex items-center gap-2"><CalendarCheck className="h-5 w-5"/>Detalle de Cita</SheetTitle></SheetHeader>{isLoading||!cita?<div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/></div>:<div className="mt-6 space-y-6"><CitaInfoHeader cita={cita}/><Separator/><EditarCitaForm cita={cita} onSuccess={()=>{void cargar();onSuccess()}}/>{cita.participantes.length>0&&<><Separator/><AsistenciaParticipantes cita={cita} onSuccess={()=>{void cargar();onSuccess()}}/></>}</div>}</SheetContent></Sheet>;
}

function CitaInfoHeader({cita}:{cita:CitaDetalle}){const colors:Record<string,string>={PROGRAMADA:"bg-blue-100 text-blue-800",COMPLETADA:"bg-green-100 text-green-800",CANCELADA:"bg-red-100 text-red-800",REPROGRAMADA:"bg-yellow-100 text-yellow-800"};const fecha=adjustDateForDisplay(new Date(cita.fechaHora));return <div className="space-y-2"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-lg">{cita.tipoCita.nombre}</p><p className="text-sm text-muted-foreground">{format(fecha,"EEEE dd 'de' MMMM yyyy — HH:mm",{locale:es})}</p>{cita.lugar&&<p className="text-sm text-muted-foreground">{cita.lugar}</p>}</div><Badge className={colors[cita.estado]??""}>{ESTADOS_CITA.find(e=>e.value===cita.estado)?.label??cita.estado}</Badge></div>{cita.tramite&&<p className="text-sm text-muted-foreground">{cita.tramite.cliente.nombres} {cita.tramite.cliente.apellidos} — {cita.tramite.servicio.nombre}</p>}{cita.grupoFamiliar&&<p className="text-sm text-muted-foreground">Grupo: {cita.grupoFamiliar.nombre}</p>}<div className="rounded-md border bg-muted/30 p-2 text-xs text-muted-foreground">Cita/simulacro incluido en el servicio contratado. La cobranza se gestiona desde Servicios y Trámites.</div></div>}

function EditarCitaForm({cita,onSuccess}:{cita:CitaDetalle;onSuccess:()=>void}){const[isSubmitting,setIsSubmitting]=useState(false);const{register,control,handleSubmit}=useForm<UpdateCitaFormData>({resolver:zodResolver(updateCitaSchema),defaultValues:{fechaHora:formatForDateTimeLocal(adjustDateForDisplay(new Date(cita.fechaHora))),lugar:cita.lugar??"",estado:cita.estado as any,notas:cita.notas??""}});const onSubmit=handleSubmit(async data=>{setIsSubmitting(true);const r=await actualizarCita(cita.id,{fechaHora:data.fechaHora,lugar:data.lugar,estado:data.estado,notas:data.notas});setIsSubmitting(false);r.success?(toast.success("Cita actualizada"),onSuccess()):toast.error(r.error??"Error al actualizar")});return <form onSubmit={onSubmit} className="space-y-4"><p className="font-medium text-sm">Editar Cita</p><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Fecha y hora</Label><Input type="datetime-local" {...register("fechaHora")}/></div><div className="space-y-2"><Label>Lugar</Label><Input {...register("lugar")}/></div></div><div className="space-y-2"><Label>Estado</Label><Controller control={control} name="estado" render={({field})=><Select value={field.value??""} onValueChange={field.onChange}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{ESTADOS_CITA.map(e=><SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent></Select>}/></div><div className="space-y-2"><Label>Notas</Label><Textarea rows={3} {...register("notas")}/></div><Button type="submit" size="sm" variant="outline" disabled={isSubmitting}>{isSubmitting?<Loader2 className="mr-2 h-4 w-4 animate-spin"/>:<Save className="mr-2 h-4 w-4"/>}Guardar Cambios</Button></form>}

function AsistenciaParticipantes({cita,onSuccess}:{cita:CitaDetalle;onSuccess:()=>void}){const[loadingId,setLoadingId]=useState<string|null>(null);async function toggle(tramiteId:string,asistio:boolean){setLoadingId(tramiteId);const r=await registrarAsistencia(cita.id,{tramiteId,asistio});setLoadingId(null);r.success?(toast.success(asistio?"Asistencia registrada":"Inasistencia registrada"),onSuccess()):toast.error(r.error??"Error al registrar asistencia")}return <div className="space-y-3"><p className="font-medium text-sm">Asistencia</p><div className="space-y-2">{cita.participantes.map(p=><div key={p.id} className="flex items-center justify-between p-3 rounded-lg border"><div><p className="text-sm font-medium">{p.tramite.cliente.nombres} {p.tramite.cliente.apellidos}</p><p className="text-xs text-muted-foreground">{p.tramite.servicio.nombre}</p></div><div className="flex items-center gap-2">{p.asistio?<Badge className="bg-green-100 text-green-800">Asistió</Badge>:<Badge variant="secondary">Pendiente</Badge>}<Button variant="ghost" size="sm" disabled={loadingId===p.tramite.id} onClick={()=>void toggle(p.tramite.id,!p.asistio)}>{loadingId===p.tramite.id?<Loader2 className="h-4 w-4 animate-spin"/>:p.asistio?<UserX className="h-4 w-4"/>:<UserCheck className="h-4 w-4"/>}</Button></div></div>)}</div></div>}
