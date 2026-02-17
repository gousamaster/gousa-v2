// src/components/system/citas/citas-calendario.tsx

"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CitaListItem } from "@/lib/actions/citas/citas-actions";
import { cn } from "@/lib/utils";
import { CitaDetalleDrawer } from "./cita-detalle-drawer";

interface CitasCalendarioProps {
  citas: CitaListItem[];
  onRefresh: () => void;
}

const ESTADO_COLORS: Record<string, string> = {
  PROGRAMADA: "#3b82f6",
  COMPLETADA: "#22c55e",
  CANCELADA: "#ef4444",
  REPROGRAMADA: "#f59e0b",
};

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/**
 * Calendario mensual de citas implementado sin dependencias externas
 * Usa solo date-fns para todos los cálculos de fechas
 */
export function CitasCalendario({ citas, onRefresh }: CitasCalendarioProps) {
  const [mesActual, setMesActual] = useState(new Date());
  const [citaDetalleId, setCitaDetalleId] = useState<string | null>(null);

  const inicioMes = startOfMonth(mesActual);
  const finMes = endOfMonth(mesActual);
  const inicioGrid = startOfWeek(inicioMes, { weekStartsOn: 1 });
  const finGrid = endOfWeek(finMes, { weekStartsOn: 1 });

  const diasDelGrid = eachDayOfInterval({ start: inicioGrid, end: finGrid });

  const citasPorDia = (dia: Date): CitaListItem[] =>
    citas.filter((c) => isSameDay(new Date(c.fechaHora), dia));

  return (
    <>
      <div className="flex flex-col h-full">
        <CalendarioHeader
          mesActual={mesActual}
          onPrev={() => setMesActual(subMonths(mesActual, 1))}
          onNext={() => setMesActual(addMonths(mesActual, 1))}
          onHoy={() => setMesActual(new Date())}
        />

        <div className="grid grid-cols-7 mt-4">
          {DIAS_SEMANA.map((dia) => (
            <div
              key={dia}
              className="py-2 text-center text-xs font-medium text-muted-foreground border-b"
            >
              {dia}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 flex-1 border-l border-t">
          {diasDelGrid.map((dia) => (
            <CeldaDia
              key={dia.toISOString()}
              dia={dia}
              mesActual={mesActual}
              citas={citasPorDia(dia)}
              onCitaClick={setCitaDetalleId}
            />
          ))}
        </div>

        <Leyenda />
      </div>

      {citaDetalleId && (
        <CitaDetalleDrawer
          open={!!citaDetalleId}
          onOpenChange={(open) => {
            if (!open) setCitaDetalleId(null);
          }}
          citaId={citaDetalleId}
          onSuccess={() => {
            setCitaDetalleId(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}

// ─── Header del calendario ────────────────────────────────────────────────────

function CalendarioHeader({
  mesActual,
  onPrev,
  onNext,
  onHoy,
}: {
  mesActual: Date;
  onPrev: () => void;
  onNext: () => void;
  onHoy: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-lg capitalize">
        {format(mesActual, "MMMM yyyy", { locale: es })}
      </h3>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onHoy}>
          Hoy
        </Button>
        <div className="flex">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-r-none"
            onClick={onPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-l-none border-l-0"
            onClick={onNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Celda de cada día ────────────────────────────────────────────────────────

const MAX_CITAS_VISIBLES = 3;

function CeldaDia({
  dia,
  mesActual,
  citas,
  onCitaClick,
}: {
  dia: Date;
  mesActual: Date;
  citas: CitaListItem[];
  onCitaClick: (id: string) => void;
}) {
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const esMesActual = isSameMonth(dia, mesActual);
  const esHoy = isToday(dia);
  const citasVisibles = mostrarTodas
    ? citas
    : citas.slice(0, MAX_CITAS_VISIBLES);
  const restantes = citas.length - MAX_CITAS_VISIBLES;

  return (
    <div
      className={cn(
        "min-h-[110px] border-b border-r p-1.5 flex flex-col gap-1",
        !esMesActual && "bg-muted/30",
      )}
    >
      <span
        className={cn(
          "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full self-end",
          esHoy && "bg-primary text-primary-foreground",
          !esMesActual && "text-muted-foreground",
        )}
      >
        {format(dia, "d")}
      </span>

      <div className="flex flex-col gap-0.5 flex-1">
        {citasVisibles.map((cita) => (
          <EventoCita
            key={cita.id}
            cita={cita}
            onClick={() => onCitaClick(cita.id)}
          />
        ))}

        {!mostrarTodas && restantes > 0 && (
          <button
            type="button"
            onClick={() => setMostrarTodas(true)}
            className="text-xs text-muted-foreground hover:text-foreground text-left px-1 transition-colors"
          >
            +{restantes} más
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Evento individual en la celda ────────────────────────────────────────────

function EventoCita({
  cita,
  onClick,
}: {
  cita: CitaListItem;
  onClick: () => void;
}) {
  const color = ESTADO_COLORS[cita.estado] ?? "#6b7280";
  const hora = format(new Date(cita.fechaHora), "HH:mm");

  const nombreCliente = cita.tramite
    ? `${cita.tramite.cliente.apellidos}`
    : (cita.grupoFamiliar?.nombre ?? "—");

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded px-1.5 py-0.5 text-xs leading-tight hover:opacity-80 transition-opacity truncate"
      style={{
        backgroundColor: `${color}20`,
        borderLeft: `3px solid ${color}`,
      }}
      title={`${hora} — ${cita.tipoCita.nombre} — ${nombreCliente}`}
    >
      <span className="font-medium" style={{ color }}>
        {hora}
      </span>{" "}
      <span className="text-foreground truncate">{nombreCliente}</span>
    </button>
  );
}

// ─── Leyenda de estados ───────────────────────────────────────────────────────

function Leyenda() {
  const items = [
    { estado: "PROGRAMADA", label: "Programada" },
    { estado: "COMPLETADA", label: "Completada" },
    { estado: "CANCELADA", label: "Cancelada" },
    { estado: "REPROGRAMADA", label: "Reprogramada" },
  ];

  return (
    <div className="flex items-center gap-4 pt-3 flex-wrap">
      {items.map(({ estado, label }) => (
        <div key={estado} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: ESTADO_COLORS[estado] }}
          />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}
