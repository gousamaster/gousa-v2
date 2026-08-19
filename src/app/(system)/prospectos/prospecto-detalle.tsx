"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Prospecto = {
  id: string;
  nombres: string;
  apellidos: string | null;
  telefono: string;
  email: string | null;
  ciudad: string | null;
  pais: string | null;
  origen: string | null;
  interes: string | null;
  observaciones: string | null;
  estado: string;
  scorePreliminar: number | null;
  convertido: boolean;
  convertidoAt: string | null;
  createdAt: string;

  creadoPor?: {
    id: string;
    name: string;
    email: string;
  } | null;

  convertidoPor?: {
    id: string;
    name: string;
    email: string;
  } | null;

  cliente?: {
    id: string;
    nombres: string;
    apellidos: string;
  } | null;
};

export function ProspectoDetalle({
  prospectoId,
}: {
  prospectoId: string;
}) {
  const router = useRouter();

  const [prospecto, setProspecto] = useState<Prospecto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProspecto = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/prospectos/${prospectoId}`,
          {
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "No se pudo cargar el prospecto",
          );
        }

        setProspecto(data.prospecto);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el prospecto",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProspecto();
  }, [prospectoId]);

  if (loading) {
    return (
      <div className="flex-1 p-8 pt-6">
        <p className="text-sm text-muted-foreground">
          Cargando prospecto...
        </p>
      </div>
    );
  }

  if (error || !prospecto) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Button
          variant="outline"
          onClick={() => router.push("/prospectos")}
        >
          Volver a prospectos
        </Button>

        <p className="text-sm text-destructive">
          {error || "Prospecto no encontrado"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button
            variant="outline"
            className="mb-4"
            onClick={() => router.push("/prospectos")}
          >
            Volver a prospectos
          </Button>

          <h2 className="text-3xl font-bold tracking-tight">
            {prospecto.nombres} {prospecto.apellidos ?? ""}
          </h2>

          <p className="text-muted-foreground">
            Perfil comercial del prospecto
          </p>
        </div>

        <div className="flex gap-2">
          <span className="rounded-full border px-3 py-1 text-sm">
            {prospecto.estado}
          </span>

          {prospecto.convertido && (
            <span className="rounded-full border px-3 py-1 text-sm">
              CONVERTIDO
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos de contacto</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Teléfono</p>
              <p className="font-medium">{prospecto.telefono}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">
                {prospecto.email || "Sin registrar"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Ciudad</p>
              <p className="font-medium">
                {prospecto.ciudad || "Sin registrar"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">País</p>
              <p className="font-medium">
                {prospecto.pais || "Sin registrar"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información comercial</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Origen</p>
              <p className="font-medium">
                {prospecto.origen || "Sin definir"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Interés</p>
              <p className="font-medium">
                {prospecto.interes || "Sin definir"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Score preliminar
              </p>
              <p className="font-medium">
                {prospecto.scorePreliminar !== null
                  ? `${prospecto.scorePreliminar}%`
                  : "Todavía no evaluado"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Estado</p>
              <p className="font-medium">{prospecto.estado}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trazabilidad</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">
                Prospecto registrado por
              </p>
              <p className="font-medium">
                {prospecto.creadoPor?.name || "Sin identificar"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Convertido por
              </p>
              <p className="font-medium">
                {prospecto.convertidoPor?.name ||
                  "Todavía no convertido"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Cliente vinculado
              </p>
              <p className="font-medium">
                {prospecto.cliente
                  ? `${prospecto.cliente.nombres} ${prospecto.cliente.apellidos}`
                  : "Todavía no existe cliente"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="whitespace-pre-wrap text-sm">
              {prospecto.observaciones ||
                "No hay observaciones registradas."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
