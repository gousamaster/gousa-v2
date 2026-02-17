// src/components/system/clientes/grupo-familiar-drawer.tsx

"use client";

import { Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { GrupoFamiliarDetalle } from "@/lib/actions/clientes/grupos-familiares-actions";
import type { ClienteListItem } from "@/types/cliente-types";
import { GrupoFamiliarForm } from "./grupo-familiar-form";
import { GrupoFamiliarMiembros } from "./grupo-familiar-miembros";

type Vista = "lista" | "crear" | "detalle";

interface GrupoFamiliarDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: ClienteListItem;
  onSuccess: () => void;
}

/**
 * Drawer principal para gestión de grupos familiares
 * Implementa patrón State para navegar entre vistas
 */
export function GrupoFamiliarDrawer({
  open,
  onOpenChange,
  cliente,
  onSuccess,
}: GrupoFamiliarDrawerProps) {
  const [vista, setVista] = useState<Vista>("lista");
  const [grupoSeleccionado, setGrupoSeleccionado] =
    useState<GrupoFamiliarDetalle | null>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setVista("lista");
      setGrupoSeleccionado(null);
    }
    onOpenChange(isOpen);
  };

  const handleGrupoCreado = () => {
    setVista("lista");
    onSuccess();
  };

  const handleVerDetalle = (grupo: GrupoFamiliarDetalle) => {
    setGrupoSeleccionado(grupo);
    setVista("detalle");
  };

  const titulos: Record<Vista, string> = {
    lista: `Grupos Familiares — ${cliente.nombres} ${cliente.apellidos}`,
    crear: "Crear Grupo Familiar",
    detalle: grupoSeleccionado?.nombre ?? "Detalle del Grupo",
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-4">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {titulos[vista]}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {vista === "lista" && (
            <GrupoFamiliarLista
              clienteId={cliente.id}
              onCrear={() => setVista("crear")}
              onVerDetalle={handleVerDetalle}
              onSuccess={onSuccess}
            />
          )}

          {vista === "crear" && (
            <GrupoFamiliarForm
              clienteId={cliente.id}
              onSuccess={handleGrupoCreado}
              onCancel={() => setVista("lista")}
            />
          )}

          {vista === "detalle" && grupoSeleccionado && (
            <GrupoFamiliarMiembros
              grupo={grupoSeleccionado}
              onBack={() => setVista("lista")}
              onSuccess={() => {
                setVista("lista");
                onSuccess();
              }}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Sub-componente: Lista de grupos ─────────────────────────────────────────

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  type GrupoFamiliarListItem,
  obtenerGrupoFamiliarPorId,
  obtenerGruposFamiliaresDeCliente,
} from "@/lib/actions/clientes/grupos-familiares-actions";

interface GrupoFamiliarListaProps {
  clienteId: string;
  onCrear: () => void;
  onVerDetalle: (grupo: GrupoFamiliarDetalle) => void;
  onSuccess: () => void;
}

function GrupoFamiliarLista({
  clienteId,
  onCrear,
  onVerDetalle,
  onSuccess,
}: GrupoFamiliarListaProps) {
  const [grupos, setGrupos] = useState<GrupoFamiliarListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const result = await obtenerGruposFamiliaresDeCliente(clienteId);
      if (result.success && result.data) setGrupos(result.data);
      setIsLoading(false);
    };
    load();
  }, [clienteId]);

  const handleVerDetalle = async (grupoId: string) => {
    setLoadingDetalle(grupoId);
    const result = await obtenerGrupoFamiliarPorId(grupoId);
    setLoadingDetalle(null);
    if (result.success && result.data) {
      onVerDetalle(result.data);
    } else {
      toast.error("Error al cargar el grupo familiar");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onCrear} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Grupo
        </Button>
      </div>

      {grupos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">
            Este cliente no pertenece a ningún grupo familiar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {grupos.map((grupo) => (
            <Card
              key={grupo.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleVerDetalle(grupo.id)}
            >
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{grupo.nombre}</p>
                    <Badge variant={grupo.activo ? "default" : "secondary"}>
                      {grupo.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  {grupo.titular && (
                    <p className="text-sm text-muted-foreground">
                      Titular: {grupo.titular.nombres} {grupo.titular.apellidos}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {grupo.totalMiembros} miembro
                    {grupo.totalMiembros !== 1 ? "s" : ""}
                  </p>
                </div>

                {loadingDetalle === grupo.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="pointer-events-none"
                  >
                    Ver →
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
