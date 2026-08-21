# GO USA NEXUS — Backlog operativo del equipo (21 Ago 2026)

## Regla de trabajo
- Continuar únicamente desde `reconcile/nexus-multiverso`.
- No sincronizar ni traer cambios de otras ramas/multiversos hasta cerrar este backlog.
- Integrar luego a `nexus-dev` en bloque controlado y con QA.

## 1. Dashboard Time / Agenda
- [ ] Colorear agenda por región: La Paz / Cochabamba / Interior.
- [ ] Permitir simultaneidad entre regiones.
- [ ] Excepción de solapamiento: simulacros atendidos por Rodrigo no pueden coincidir.
- [ ] Prioridad de visualización: Entrevistas Embajada > Simulacros > Asesorías > otras actividades.
- [ ] Cambiar vista de 3 días a semana completa.
- [ ] Corregir error de cumpleaños.
- [ ] Mostrar nombre + teléfono del cumpleañero y acceso rápido para mensajería.
- [ ] Registrar auditoría: usuario que agenda, modifica o reagenda.

## 2. Simulacro / Centro de Simulación
- [ ] Añadir upgrade “Simulacro en cabina — Centro de Simulación Consular” con costo adicional.

## 3. Cliente / DS-160 / Centro de Visas
- [ ] Hacer muy visible el flujo DS-160.
- [ ] Mostrar y editar Application ID AA00...
- [ ] Guardar respuesta de seguridad protegida.
- [ ] Acceso directo a CEAC: https://ceac.state.gov/GenNIV/Default.aspx
- [ ] Estados visibles: Iniciado / En proceso / Para cerrar / Cerrado.
- [ ] Recuperar Centro de Visas: mismo correo personal sí/no, correo usado y contraseña.
- [ ] Recuperar Documentos esenciales e imágenes por cliente.
- [ ] Observaciones generales del cliente.
- [ ] Mejorar accesibilidad del menú de acciones (...) en pantallas pequeñas.
- [ ] Permitir devolver cliente inactivo a Prospecto.

## 4. Datos laborales / académicos / traducciones
- [ ] Permitir registrar al menos un trabajo anterior adicional.
- [ ] Permitir registrar al menos una formación académica anterior adicional.
- [ ] Descripción de trabajo / funciones.
- [ ] Motivo de negación anterior.
- [ ] Casilla de traducción al inglés para textos narrativos importantes.

## 5. Gestiones
Crear opciones operativas visibles:
- [ ] Nueva Visa Americana No Inmigrante B1/B2
- [ ] Nueva Visa Americana No Inmigrante — otras categorías
- [ ] Renovación Visa Americana
- [ ] Visa Americana Inmigrante
- [ ] Visa China
- [ ] Asesoría Migratoria
- [ ] Servicio de Preparación

## 6. Servicios — Vuelos
- [ ] Número de PAX en cotización.
- [ ] Registrar usuario que generó cotización.
- [ ] Flujo Cotización -> Emisión.
- [ ] En emisión: monto, vendedor y comisión.

## 7. Auditoría / responsabilidades
- [ ] Registrar quién creó, modificó, agendó, reagendó o cambió información operativa relevante.

## 8. Cobros y facturación
- [ ] Alerta de pendiente de cobro cerca de la cita si existe saldo, dos pagos incompletos o efectivo no registrado.
- [ ] Método de pago: Efectivo / QR / Transferencia.
- [ ] Registrar si se notificó el pago.
- [ ] Registrar si solicitó factura.
- [ ] Si factura = Sí: Nombre/Razón Social + NIT.

## 9. NEXUS Score
- [ ] Ajustar criterios y ponderaciones con el Excel del usuario.
- [ ] Mantener trazabilidad Prospecto -> Cliente.
- [ ] Llevar indicadores de Score al Dashboard Comercial.

## 10. Reconciliación ya iniciada
- [x] Recuperación de Documentos esenciales en `reconcile/nexus-multiverso`.
- [ ] Recuperación completa de UI + flujo de Centro de Visas.
- [ ] QA de reconciliación antes de integrar a `nexus-dev`.
