// src/components/system/clientes/client-form-drawer.tsx

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  crearClienteCompleto,
  obtenerClientePorId,
} from "@/lib/actions/clientes/clientes-actions";
import type { ClienteListItem } from "@/types/cliente-types";
import {
  type CreateClienteCompletoFormData,
  createClienteCompletoSchema,
} from "@/validations/cliente-validations";
import { DatosAcademicosForm } from "./datos-academicos-form";
import { DatosBasicosForm } from "./datos-basicos-form";
import { DatosLaboralesForm } from "./datos-laborales-form";
import { DatosMatrimonialesForm } from "./datos-matrimoniales-form";
import { DatosPatrocinadorForm } from "./datos-patrocinador-form";
import { DatosPersonalesForm } from "./datos-personales-form";
import { DatosViajeForm } from "./datos-viaje-form";

interface ClientFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: ClienteListItem | null;
  onSuccess: () => void;
  regiones: Array<{ id: string; nombre: string }>;
}

/**
 * Drawer para crear o editar clientes
 * Implementa patrón Strategy para manejar formularios por secciones
 * y patrón Observer para notificar cambios al componente padre
 */
export function ClientFormDrawer({
  open,
  onOpenChange,
  cliente,
  onSuccess,
  regiones,
}: ClientFormDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState("basicos");
  const isEdit = !!cliente;

  const methods = useForm<CreateClienteCompletoFormData>({
    resolver: zodResolver(createClienteCompletoSchema),
    mode: "onChange",
    defaultValues: {
      cliente: {
        nombres: "",
        apellidos: "",
        tipoCliente: undefined as any,
        regionId: "",
        registradoPorId: "",
      },
      datosPersonales: {},
      datosLaborales: {},
      datosAcademicos: {},
      datosMatrimoniales: {},
      datosPatrocinador: {},
      datosViaje: {},
    },
  });

  // Cargar datos del cliente al editar
  useEffect(() => {
    async function cargarDatosCliente() {
      if (open && cliente) {
        setIsLoadingData(true);
        try {
          const result = await obtenerClientePorId(cliente.id);
          if (result.success && result.data) {
            const data = result.data;

            methods.reset({
              cliente: {
                nombres: data.nombres,
                apellidos: data.apellidos,
                tipoCliente: data.tipoCliente,
                fechaNacimiento: data.fechaNacimiento || undefined,
                lugarNacimiento: data.lugarNacimiento || undefined,
                nacionalidad: data.nacionalidad || undefined,
                numeroCi: data.numeroCi || undefined,
                numeroPasaporte: data.numeroPasaporte || undefined,
                email: data.email || undefined,
                telefonoCelular: data.telefonoCelular || undefined,
                regionId: data.regionId,
                registradoPorId: data.registradoPorId,
              },
              datosPersonales: data.datosPersonales || {},
              datosLaborales: data.datosLaborales || {},
              datosAcademicos: data.datosAcademicos || {},
              datosMatrimoniales: data.datosMatrimoniales || {},
              datosPatrocinador: data.datosPatrocinador || {},
              datosViaje: data.datosViaje || {},
            });
          }
        } catch (error) {
          console.error("Error al cargar datos del cliente:", error);
          toast.error("Error al cargar los datos del cliente");
        } finally {
          setIsLoadingData(false);
        }
      }
    }

    if (open && !cliente) {
      methods.reset({
        cliente: {
          nombres: "",
          apellidos: "",
          tipoCliente: undefined as any,
          regionId: "",
          registradoPorId: "",
        },
        datosPersonales: {},
        datosLaborales: {},
        datosAcademicos: {},
        datosMatrimoniales: {},
        datosPatrocinador: {},
        datosViaje: {},
      });
      setActiveTab("basicos");
    } else if (open && cliente) {
      cargarDatosCliente();
    }
  }, [open, cliente, methods]);

  const handleSubmit = methods.handleSubmit(
    async (data) => {
      console.log("Formulario válido, enviando datos:", data);
      setIsLoading(true);
      try {
        // Solo soportamos crear por ahora
        // TODO: Implementar actualización
        if (isEdit) {
          toast.error("La edición aún no está implementada");
          return;
        }

        const result = await crearClienteCompleto(data);

        if (result.success) {
          toast.success("Cliente creado correctamente");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(result.error || "Error al procesar la solicitud");
        }
      } catch (error) {
        toast.error("Ocurrió un error inesperado");
        console.error("Error en crearClienteCompleto:", error);
      } finally {
        setIsLoading(false);
      }
    },
    (errors) => {
      console.log("Errores de validación:", errors);
      toast.error("Por favor completa todos los campos obligatorios");

      const firstError = Object.values(errors)[0];
      if (firstError && typeof firstError === "object") {
        const nestedError = Object.values(firstError)[0];
        if (nestedError && "message" in nestedError) {
          toast.error(String(nestedError.message));
        }
      }
    },
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Ver cliente" : "Crear nuevo cliente"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Información del cliente (modo solo lectura)"
              : "Completa los datos para crear un nuevo cliente"}
          </SheetDescription>
        </SheetHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit} className="mt-6">
              <div className="p-4">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="basicos">Básicos</TabsTrigger>
                    <TabsTrigger value="personales">Personales</TabsTrigger>
                    <TabsTrigger value="laborales">Laborales</TabsTrigger>
                    <TabsTrigger value="academicos">Académicos</TabsTrigger>
                    <TabsTrigger value="matrimoniales">
                      Matrimoniales
                    </TabsTrigger>
                    <TabsTrigger value="patrocinador">Patrocinador</TabsTrigger>
                    <TabsTrigger value="viaje">Viaje</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basicos" className="mt-6">
                    <DatosBasicosForm regiones={regiones} />
                  </TabsContent>

                  <TabsContent value="personales" className="mt-6">
                    <DatosPersonalesForm />
                  </TabsContent>

                  <TabsContent value="laborales" className="mt-6">
                    <DatosLaboralesForm />
                  </TabsContent>

                  <TabsContent value="academicos" className="mt-6">
                    <DatosAcademicosForm />
                  </TabsContent>

                  <TabsContent value="matrimoniales" className="mt-6">
                    <DatosMatrimonialesForm />
                  </TabsContent>

                  <TabsContent value="patrocinador" className="mt-6">
                    <DatosPatrocinadorForm />
                  </TabsContent>

                  <TabsContent value="viaje" className="mt-6">
                    <DatosViajeForm />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t px-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isEdit ? "Cerrar" : "Cancelar"}
                </Button>
                {!isEdit && (
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Crear Cliente
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        )}
      </SheetContent>
    </Sheet>
  );
}
