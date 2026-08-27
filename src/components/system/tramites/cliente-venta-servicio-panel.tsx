"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContratarServicioDrawer } from "./contratar-servicio-drawer";

export function ClienteVentaServicioPanel({ clienteId, regionId }: { clienteId: string; regionId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Emitir servicio</CardTitle>
        <p className="text-sm text-muted-foreground">
          Registra únicamente la venta contratada. El seguimiento técnico y el trámite continúan con el equipo operativo.
        </p>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Emitir servicio
        </Button>
        <ContratarServicioDrawer
          open={open}
          onOpenChange={setOpen}
          clienteId={clienteId}
          regionId={regionId}
          onSuccess={() => {
            setOpen(false);
            toast.success("Servicio emitido correctamente. Queda disponible para el equipo operativo.");
          }}
        />
      </CardContent>
    </Card>
  );
}
