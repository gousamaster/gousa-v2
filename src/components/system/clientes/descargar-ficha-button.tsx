// src/components/system/clientes/descargar-ficha-button.tsx

"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { obtenerClientePorId } from "@/lib/actions/clientes/clientes-actions";
import { descargarFichaClientePdf } from "@/lib/pdf/ficha-cliente-pdf";

interface DescargarFichaButtonProps {
  clienteId: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
}

/**
 * Botón que obtiene los datos completos del cliente y genera su ficha PDF
 * Solo descarga campos con datos — omite automáticamente los vacíos
 */
export function DescargarFichaButton({
  clienteId,
  variant = "ghost",
  size = "sm",
  showLabel = false,
}: DescargarFichaButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDescargar = async () => {
    setIsLoading(true);
    try {
      const result = await obtenerClientePorId(clienteId);

      if (!result.success || !result.data) {
        toast.error("No se pudo obtener los datos del cliente");
        return;
      }

      await descargarFichaClientePdf(result.data);
      toast.success("Ficha descargada correctamente");
    } catch (error) {
      console.error("Error al descargar ficha:", error);
      toast.error("Error al generar el PDF");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDescargar}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="ml-2">
          {isLoading ? "Generando..." : "Descargar Ficha"}
        </span>
      )}
    </Button>
  );
}
