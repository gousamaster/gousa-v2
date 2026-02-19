// src/components/system/clientes/descarga-ficha-button.tsx

"use client";

import { Download, FileText, Loader2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  obtenerDatosClienteParaPdf,
  obtenerGrupoFamiliarParaPdf,
} from "@/lib/actions/clientes/descarga-pdf-actions";
import { descargarFichaClientePdf } from "@/lib/pdf/ficha-cliente-pdf";
import { descargarFichasGrupoFamiliarPdf } from "@/lib/pdf/ficha-grupo-familiar-pdf";

interface DescargaFichaButtonProps {
  clienteId: string;
  nombreCliente: string;
  tieneGrupoFamiliar: boolean;
}

/**
 * Botón para descargar ficha del cliente (individual o grupal)
 * Patrón Strategy: selecciona estrategia de descarga según contexto
 */
export function DescargaFichaButton({
  clienteId,
  nombreCliente,
  tieneGrupoFamiliar,
}: DescargaFichaButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const descargarIndividual = async () => {
    setIsDownloading(true);
    try {
      const result = await obtenerDatosClienteParaPdf(clienteId);

      if (!result.success || !result.data) {
        toast.error(result.error || "Error al obtener datos del cliente");
        return;
      }

      await descargarFichaClientePdf(result.data);
      toast.success("Ficha descargada correctamente");
    } catch (error) {
      console.error("Error al descargar ficha:", error);
      toast.error("Error al generar el PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const descargarGrupal = async () => {
    setIsDownloading(true);
    try {
      const result = await obtenerGrupoFamiliarParaPdf(clienteId);

      if (!result.success || !result.data) {
        toast.error(result.error || "Error al obtener grupo familiar");
        return;
      }

      await descargarFichasGrupoFamiliarPdf(
        result.data.grupo,
        result.data.miembros,
      );
      toast.success("Fichas del grupo familiar descargadas correctamente");
    } catch (error) {
      console.error("Error al descargar fichas grupales:", error);
      toast.error("Error al generar el PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!tieneGrupoFamiliar) {
    return (
      <Button
        onClick={descargarIndividual}
        disabled={isDownloading}
        size="sm"
        variant="outline"
      >
        {isDownloading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Descargar Ficha
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isDownloading} size="sm" variant="outline">
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Descargar Ficha
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Opciones de Descarga</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={descargarIndividual}
          disabled={isDownloading}
        >
          <FileText className="mr-2 h-4 w-4" />
          <div>
            <p className="font-medium">Individual</p>
            <p className="text-xs text-muted-foreground">
              Solo {nombreCliente.split(" ")[0]}
            </p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={descargarGrupal} disabled={isDownloading}>
          <Users className="mr-2 h-4 w-4" />
          <div>
            <p className="font-medium">Grupo Familiar</p>
            <p className="text-xs text-muted-foreground">Todos los miembros</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
