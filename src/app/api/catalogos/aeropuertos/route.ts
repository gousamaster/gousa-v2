import { NextResponse } from "next/server";

const AIRPORTS_URL =
  "https://cdn.jsdelivr.net/gh/srestre/world-countries-cities-db@main/airports/airports.json";

type AirportSource = {
  ident?: string;
  type?: string;
  name?: string;
  iata?: string;
  icao?: string;
  iso_country?: string;
  municipality?: string;
};

type AirportResult = {
  iata: string;
  name: string;
  city: string;
  country: string;
};

const FALLBACK: AirportResult[] = [
  { iata: "LPB", name: "El Alto International Airport", city: "La Paz", country: "BO" },
  { iata: "VVI", name: "Viru Viru International Airport", city: "Santa Cruz", country: "BO" },
  { iata: "CBB", name: "Jorge Wilstermann International Airport", city: "Cochabamba", country: "BO" },
  { iata: "MIA", name: "Miami International Airport", city: "Miami", country: "US" },
  { iata: "JFK", name: "John F Kennedy International Airport", city: "New York", country: "US" },
  { iata: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "US" },
  { iata: "MCO", name: "Orlando International Airport", city: "Orlando", country: "US" },
  { iata: "IAD", name: "Washington Dulles International Airport", city: "Washington", country: "US" },
  { iata: "ATL", name: "Hartsfield Jackson Atlanta International Airport", city: "Atlanta", country: "US" },
  { iata: "MAD", name: "Adolfo Suárez Madrid–Barajas Airport", city: "Madrid", country: "ES" },
];

let memoryCache: AirportResult[] | null = null;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function loadAirports(): Promise<AirportResult[]> {
  if (memoryCache) return memoryCache;

  try {
    const response = await fetch(AIRPORTS_URL, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) throw new Error(`Airport catalog ${response.status}`);

    const source = (await response.json()) as AirportSource[];
    const seen = new Set<string>();

    memoryCache = source
      .map((airport) => ({
        iata: (airport.iata ?? "").trim().toUpperCase(),
        name: (airport.name ?? "").trim(),
        city: (airport.municipality ?? "").trim(),
        country: (airport.iso_country ?? "").trim().toUpperCase(),
      }))
      .filter((airport) => {
        if (!/^[A-Z0-9]{3}$/.test(airport.iata)) return false;
        if (seen.has(airport.iata)) return false;
        seen.add(airport.iata);
        return true;
      });

    return memoryCache;
  } catch (error) {
    console.error("No se pudo cargar el catálogo mundial de aeropuertos:", error);
    return FALLBACK;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") ?? "";
  const query = normalize(rawQuery);

  if (query.length < 2) {
    return NextResponse.json({ aeropuertos: [] });
  }

  const airports = await loadAirports();

  const scored = airports
    .map((airport) => {
      const iata = normalize(airport.iata);
      const city = normalize(airport.city);
      const name = normalize(airport.name);

      let score = 99;
      if (iata === query) score = 0;
      else if (iata.startsWith(query)) score = 1;
      else if (city === query) score = 2;
      else if (city.startsWith(query)) score = 3;
      else if (name.startsWith(query)) score = 4;
      else if (city.includes(query)) score = 5;
      else if (name.includes(query)) score = 6;
      else if (iata.includes(query)) score = 7;

      return { airport, score };
    })
    .filter(({ score }) => score < 99)
    .sort((a, b) => a.score - b.score || a.airport.iata.localeCompare(b.airport.iata))
    .slice(0, 12)
    .map(({ airport }) => airport);

  return NextResponse.json(
    { aeropuertos: scored },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
