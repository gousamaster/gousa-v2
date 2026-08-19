"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type City={city:string;country:string};
type Props={value:City|null;onChange:(city:City|null)=>void};
function countryName(code:string){try{return new Intl.DisplayNames(["es"],{type:"region"}).of(code)??code}catch{return code}}
export function CityPicker({value,onChange}:Props){
 const[q,setQ]=useState(value?`${value.city} · ${countryName(value.country)}`:"");const[results,setResults]=useState<City[]>([]);const[loading,setLoading]=useState(false),[open,setOpen]=useState(false);const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!value)setQ("")},[value]);
 useEffect(()=>{const close=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)};document.addEventListener("mousedown",close);return()=>document.removeEventListener("mousedown",close)},[]);
 useEffect(()=>{const n=q.trim();if(value&&n===`${value.city} · ${countryName(value.country)}`)return;if(n.length<2){setResults([]);return}const c=new AbortController();const t=window.setTimeout(async()=>{setLoading(true);try{const r=await fetch(`/api/catalogos/ciudades?q=${encodeURIComponent(n)}`,{signal:c.signal});const j=await r.json();setResults(r.ok?j.ciudades??[]:[]);setOpen(true)}catch{}finally{setLoading(false)}},250);return()=>{clearTimeout(t);c.abort()}},[q,value]);
 const visible=useMemo(()=>results,[results]);
 return <div ref={ref} className="relative space-y-1.5"><label className="text-sm font-medium">Destino</label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input value={q} onChange={e=>{setQ(e.target.value);onChange(null);setOpen(true)}} placeholder="Miami, Orlando, Guangzhou..." className="pl-9 pr-9" required={!value}/>{loading?<Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"/>:value?<Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600"/>:null}</div>{open&&q.trim().length>=2&&<div className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-md border bg-popover p-1 shadow-lg">{visible.length===0?<div className="px-3 py-3 text-sm text-muted-foreground">No encontramos ciudades.</div>:visible.map(c=><button key={`${c.city}-${c.country}`} type="button" onClick={()=>{onChange(c);setQ(`${c.city} · ${countryName(c.country)}`);setOpen(false)}} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-accent"><MapPin className="h-4 w-4 text-muted-foreground"/><span><b>{c.city}</b> · {countryName(c.country)}</span></button>)}</div>}</div>
}
