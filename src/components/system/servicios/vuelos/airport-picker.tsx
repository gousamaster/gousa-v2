"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Airport = {
  iata: string;
  name: string;
  city: string;
  country: string;
};

type AirportPickerProps = {
  id: string;
  label: string;
  value: string;
  onChange: (iata: string) => void;
  placeholder: string;
  excludeIata?: string;
  required?: boolean;
};

function countryName(countryCode: string) {
  if (!countryCode) return "";
  try {
    const displayNames = new Intl.DisplayNames(["es"], { type: "region" });
    return displayNames.of(countryCode) ?? countryCode;
  } catch {
    return countryCode;
  }
}

export function AirportPicker({
  id,
  label,
  value,
  onChange,
  placeholder,
  excludeIata,
  required = false,
}: AirportPickerProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Airport | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) {
      setSelected(null);
      setQuery("");
    }
  }, [value]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    const normalized = query.trim();
    if (selected && (normalized === selected.iata || normalized === `${selected.iata} — ${selected.city}`)) {
      return;
    }

    if (normalized.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/catalogos/aeropuertos?q=${encodeURIComponent(normalized)}`, {
          signal: controller.signal,
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? "No se pudieron buscar aeropuertos");
        setResults(json.aeropuertos ?? []);
        setOpen(true);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, selected]);

  const visibleResults = useMemo(
    () => results.filter((airport) => airport.iata !== excludeIata),
    [results, excludeIata],
  );

  function choose(airport: Airport) {
    setSelected(airport);
    setQuery(`${airport.iata} — ${airport.city || airport.name}`);
    onChange(airport.iata);
    setOpen(false);
  }

  function handleInput(next: string) {
    setQuery(next);
    if (selected) setSelected(null);
    onChange("");
    setOpen(true);
  }

  return (
    <div ref={wrapperRef} className="relative space-y-1.5">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          value={query}
          onChange={(event) => handleInput(event.target.value)}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          placeholder={placeholder}
          className="pl-9 pr-9"
          autoComplete="off"
          required={required && !value}
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : selected ? (
          <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
        ) : null}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-lg">
          {loading && visibleResults.length === 0 ? (
            <div className="px-3 py-3 text-sm text-muted-foreground">Buscando aeropuertos…</div>
          ) : visibleResults.length === 0 ? (
            <div className="px-3 py-3 text-sm text-muted-foreground">
              No encontramos aeropuertos. Prueba con ciudad, nombre o código IATA.
            </div>
          ) : (
            visibleResults.map((airport) => (
              <button
                key={`${id}-${airport.iata}`}
                type="button"
                onClick={() => choose(airport)}
                className="flex w-full items-start gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="font-semibold">{airport.iata}</span>
                  <span> — {airport.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {[airport.city, countryName(airport.country)].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {selected && (
        <p className="text-xs text-muted-foreground">
          {selected.name} · {[selected.city, countryName(selected.country)].filter(Boolean).join(" · ")}
        </p>
      )}
    </div>
  );
}
