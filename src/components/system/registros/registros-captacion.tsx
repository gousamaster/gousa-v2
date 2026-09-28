"use client";
import { useEffect, useState } from "react";

type Registro={id:string;nombres:string;apellidos?:string|null;telefono:string;origen?:string|null;interes?:string|null;captador?:string|null;consentimiento:boolean;estado:string;createdAt:string};

export function RegistrosCaptacion(){
 const [items,setItems]=useState<Registro[]>([]); const [form,setForm]=useState({nombres:"",telefono:"",origen:"ACTIVACION",interes:"Visa USA",captador:"",consentimiento:false}); const [msg,setMsg]=useState("");
 const load=()=>fetch("/api/registros").then(r=>r.json()).then(d=>setItems(d.registros||[]));
 useEffect(()=>{load()},[]);
 async function guardar(e:React.FormEvent){e.preventDefault();setMsg("");const r=await fetch("/api/registros",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const d=await r.json();if(!r.ok){setMsg(d.error||"No se pudo guardar");return}setForm({...form,nombres:"",telefono:"",consentimiento:false});setMsg("Registro guardado");load();}
 async function convertir(id:string){const r=await fetch(`/api/registros/${id}/convertir`,{method:"POST"});const d=await r.json();setMsg(r.ok?"Convertido a prospecto":d.error||"No se pudo convertir");load();}
 return <div className="space-y-6 p-6">
  <div><h1 className="text-2xl font-bold">Registro / Captación</h1><p className="text-sm text-slate-500">Personas captadas en activaciones, ferias, publicidad o WhatsApp. Convierte a Prospecto solo cuando exista interés comercial real.</p></div>
  <form onSubmit={guardar} className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-3">
   <input className="rounded-md border p-2" placeholder="Nombre *" value={form.nombres} onChange={e=>setForm({...form,nombres:e.target.value})}/>
   <input className="rounded-md border p-2" placeholder="WhatsApp *" value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})}/>
   <select className="rounded-md border p-2" value={form.origen} onChange={e=>setForm({...form,origen:e.target.value})}><option>ACTIVACION</option><option>FIPAZ</option><option>WHATSAPP API</option><option>PUBLICIDAD META</option><option>REFERIDO</option><option>OTRO</option></select>
   <select className="rounded-md border p-2" value={form.interes} onChange={e=>setForm({...form,interes:e.target.value})}><option>Visa USA</option><option>Visa China</option><option>Pasajes</option><option>Otro</option></select>
   <input className="rounded-md border p-2" placeholder="Captador (ej. Luis)" value={form.captador} onChange={e=>setForm({...form,captador:e.target.value})}/>
   <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.consentimiento} onChange={e=>setForm({...form,consentimiento:e.target.checked})}/> Aceptó recibir información por WhatsApp</label>
   <button className="rounded-md bg-blue-700 px-4 py-2 font-semibold text-white md:col-span-3">Guardar registro</button>
  </form>
  {msg&&<div className="rounded-md bg-slate-100 p-3 text-sm">{msg}</div>}
  <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Persona</th><th>WhatsApp</th><th>Origen</th><th>Interés</th><th>Captador</th><th>Consentimiento</th><th>Estado</th><th></th></tr></thead><tbody>{items.map(x=><tr key={x.id} className="border-b"><td className="p-3 font-medium">{x.nombres} {x.apellidos||""}</td><td>{x.telefono}</td><td>{x.origen||"—"}</td><td>{x.interes||"—"}</td><td>{x.captador||"—"}</td><td>{x.consentimiento?"Sí":"No"}</td><td>{x.estado}</td><td className="p-2">{x.estado==="REGISTRO"&&<button onClick={()=>convertir(x.id)} className="rounded-md border px-3 py-1.5">Convertir en prospecto</button>}</td></tr>)}</tbody></table></div>
 </div>
}