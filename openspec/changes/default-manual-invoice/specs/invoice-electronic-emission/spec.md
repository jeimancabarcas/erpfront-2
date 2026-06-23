# Especificación: invoice-electronic-emission

## Propósito

Permitir la emisión electrónica post-hoc de facturas manuales desde el diálogo de detalle. Agregar un botón "Emitir Electrónicamente" en `InvoiceDetailDialogOrganism`, un método `emitInvoice()` en `InvoiceService`, y un endpoint `POST /sales/invoices/:id/emit` en el backend que carga la factura manual, llama a Factus y actualiza el registro con CUFE, QR y `factusNumber`.

## Requisitos

---

### Requisito: Botón "Emitir Electrónicamente" en detalle

El diálogo de detalle DEBE mostrar un botón "Emitir Electrónicamente" cuando la factura cumpla: `!inv.isElectronic && !inv.factusNumber`. El botón DEBE estar oculto si `inv.isElectronic` es `true` o si `inv.factusNumber` ya existe.

**Escenario: Botón visible en factura manual sin emitir**
- DADO una factura con `isElectronic: false` y `factusNumber: undefined`
- CUANDO el diálogo de detalle se abre
- ENTONCES se renderiza un botón "Emitir Electrónicamente"

**Escenario: Botón oculto en factura electrónica**
- DADO una factura con `isElectronic: true`
- CUANDO el diálogo de detalle se abre
- ENTONCES el botón "Emitir Electrónicamente" NO está presente

**Escenario: Botón oculto si ya fue emitida**
- DADO una factura con `isElectronic: false` y `factusNumber: "SETP990003678"`
- CUANDO el diálogo de detalle se abre
- ENTONCES el botón "Emitir Electrónicamente" NO está presente

---

### Requisito: InvoiceService.emitInvoice()

`InvoiceService` DEBE exponer un método `emitInvoice(id: string): Observable<Invoice>` que realice un `POST /sales/invoices/{id}/emit`.

**Escenario: Llamada exitosa retorna la factura actualizada**
- DADO que `emitInvoice(id)` se invoca con un ID válido
- CUANDO el backend responde 200 con la factura actualizada
- ENTONCES el observable emite la factura con `factusNumber` poblado

**Escenario: Error del backend se propaga al caller**
- DADO que `emitInvoice(id)` se invoca con un ID inválido
- CUANDO el backend responde 404
- ENTONCES el observable emite un error

---

### Requisito: Endpoint POST /sales/invoices/:id/emit

El `SalesController` DEBE exponer `POST /invoices/:id/emit` que invoca `SalesService.emit(id)`. El endpoint DEBE estar protegido por `JwtAuthGuard`.

**Escenario: Endpoint existe y responde**
- DADO una factura manual (`isElectronic: false`) sin emisión previa
- CUANDO se hace POST a `/sales/invoices/{id}/emit`
- ENTONCES el backend responde 200 OK con la factura actualizada

---

### Requisito: SalesService.emit(id)

`SalesService.emit(id)` DEBE cargar la factura manual, armar el payload de Factus con sus items y cliente, llamar a `factusGateway.createInvoice()`, y actualizar el registro con `factusNumber`, `cufe`, `qrUrl`, `publicUrl`. DEBE lanzar `BadRequestException` si la factura es electrónica o ya fue emitida.

**Escenario: Emisión post-hoc exitosa**
- DADO una factura manual con `isElectronic: false` y `factusNumber: null`
- CUANDO `emit(id)` se ejecuta y Factus responde OK
- ENTONCES la factura se actualiza con `factusNumber` = número Factus, `cufe`, `qrUrl`, y `publicUrl`
- Y el `invoiceNumber` original NO se modifica

**Escenario: Error en Factus lanza excepción**
- DADO una factura manual sin emitir
- CUANDO `emit(id)` se ejecuta y Factus responde con error
- ENTONCES se lanza `BadRequestException` con mensaje del error
- Y la factura NO se modifica

**Escenario: Rechazo si la factura ya es electrónica**
- DADO una factura con `isElectronic: true`
- CUANDO `emit(id)` se ejecuta
- ENTONCES se lanza `BadRequestException` indicando que la factura ya es electrónica

**Escenario: Rechazo si ya fue emitida post-hoc**
- DADO una factura con `factusNumber` ya asignado
- CUANDO `emit(id)` se ejecuta
- ENTONCES se lanza `BadRequestException` indicando que ya fue emitida

---

### Requisito: Invoice model incluye factusNumber

La interfaz `Invoice` en el frontend DEBE incluir `factusNumber?: string` para que el detalle pueda evaluar la condición de visibilidad del botón.

**Escenario: Modelo acepta factusNumber desde API**
- DADO que la API retorna `{ ..., factusNumber: "SETP990003678" }`
- CUANDO se deserializa en la interfaz `Invoice`
- ENTONCES `invoice.factusNumber` es `"SETP990003678"` sin errores de tipo

---

### Fuera de Alcance

- Emisión electrónica desde la lista de facturas (solo desde detalle)
- Reprocessing o cancelación de facturas electrónicas
- Notas de crédito/débito post-emisión
