import { NextResponse } from "next/server";

const AIRPORTS_URL = "https://cdn.jsdelivr.net/gh/srestre/world-countries-cities-db@main/airports/airports.json";
type AirportSource = { municipality?: string; iso_country?: string; iata?: string };
type CityResult = { city: string; country: string };
const FALLBACK: CityResult[] = [
  { city: "La Paz", country: "BO" }, { city: "Santa Cruz", country: "BO" }, { city: "Cochabamba", country: "BO" },
  { city: "Miami", country: "US" }, { city: "Orlando", country: "US" }, { city: "New York", country: "US" },
  { city: "Washington DC", country: "US" }, { city: "Los Angeles", country: "US" }, { city: "Madrid", country: "ES" },
  { city: "Guangzhou", country: "CN" }, { city: "Shanghai", country: "CN" }, { city: "Beijing", country: "CN" },
];
let cache: CityResult[] | null = null;
function normalize(v: string){return v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();}
async function loadCities(){
  if(cache) return cache;
  try{
    const r=await fetch(AIRPORTS_URL,{next:{revalidate:86400}}); if(!r.ok) throw new Error(String(r.status));
    const data=(await r.json()) as AirportSource[]; const seen=new Set<string>();
    cache=data.map(a=>({city:(a.municipality??"").trim(),country:(a.iso_country??"").trim().toUpperCase()}))
      .filter(c=>{if(!c.city||!c.country)return false;const k=`${normalize(c.city)}|${c.country}`;if(seen.has(k))return false;seen.add(k);return true;});
    return cache;
  }catch(e){console.error("No se pudo cargar catálogo de ciudades:",e);return FALLBACK;}
}
export async function GET(request:Request){
  const q=normalize(new URL(request.url).searchParams.get("q")??""); if(q.length<2)return NextResponse.json({ciudades:[]});
  const cities=await loadCities();
  const result=cities.map(c=>{const n=normalize(c.city);return {c,score:n===q?0:n.startsWith(q)?1:n.includes(q)?2:99};})
    .filter(x=>x.score<99).sort((a,b)=>a.score-b.score||a.c.city.localeCompare(b.c.city)).slice(0,12).map(x=>x.c);
  return NextResponse.json({ciudades:result},{headers:{"Cache-Control":"public, s-maxage=86400, stale-while-revalidate=604800"}});
}
