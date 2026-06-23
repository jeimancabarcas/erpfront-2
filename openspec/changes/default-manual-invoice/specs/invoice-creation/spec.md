# Especificación: invoice-creation

## Propósito

Invertir el default de facturación de electrónica a manual en el `SaleFormMolecule`. Reemplazar la señal `isManual` por `isElectronic` con valor `false` por defecto, etiquetar el toggle como "Factura electrónica" con color primary, y enviar `isElectronic: this.isElectronic()` al backend.

## Requisitos

---

### Requisito: Señal isElectronic con default false

El componente DEBE declarar `isElectronic = signal(false)` en lugar de `isManual = signal(false)`. El toggle `MatSlideToggle` DEBE etiquetarse "Factura electrónica" con color `primary`.

**Escenario: Toggle inicia en OFF (manual por defecto)**
- DADO que el formulario de venta se abre
- CUANDO el usuario inspecciona el toggle
- ENTONCES el toggle muestra "Factura electrónica" en OFF
- Y `isElectronic()` es `false`

**Escenario: Toggle activado pasa a electrónica**
- DADO que `isElectronic` es `false`
- CUANDO el usuario activa el toggle "Factura electrónica"
- ENTONCES `isElectronic` se establece en `true`

---

### Requisito: Advertencia visible solo en modo manual

Cuando `isElectronic` es `false`, DEBE mostrarse un mensaje amber con el texto "Esta venta NO se enviará a la DIAN". Cuando `isElectronic` es `true`, la advertencia NO DEBE renderizarse.

**Escenario: Modo manual muestra advertencia**
- DADO que `isElectronic` es `false`
- CUANDO el formulario se renderiza
- ENTONCES se muestra un banner amber con el texto "Esta venta NO se enviará a la DIAN"

**Escenario: Modo electrónico oculta advertencia**
- DADO que `isElectronic` es `true`
- CUANDO el formulario se renderiza
- ENTONCES no hay banner de advertencia visible

---

### Requisito: Envío de isElectronic en el DTO

`onSubmit()` DEBE incluir `isElectronic: this.isElectronic()` en el objeto `CreateInvoiceDto`. No DEBE usar `!isManual`.

**Escenario: Venta manual envía isElectronic: false**
- DADO que el toggle "Factura electrónica" está desactivado
- CUANDO el usuario envía el formulario
- ENTONCES el POST body contiene `"isElectronic": false`

**Escenario: Venta electrónica envía isElectronic: true**
- DADO que el toggle "Factura electrónica" está activado
- CUANDO el usuario envía el formulario
- ENTONCES el POST body contiene `"isElectronic": true`

---

### Fuera de Alcance

- Post-hoc emission from detail dialog (cubierto en `invoice-electronic-emission`)
- Backend entity defaults (cubierto en `factus-number-field`)
- Invoice list badges or hidden PDF buttons (sin cambios en este cambio)
