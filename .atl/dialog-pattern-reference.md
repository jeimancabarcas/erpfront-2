# Canonical Dialog Pattern — ERP Frontend

> **Reference implementation**: `PurchaseOrderDialogOrganism` (`src/app/components/organisms/purchase-order-dialog/purchase-order-dialog.component.ts`)
>
> **Reference caller**: `CustomerInvoicesTableOrganism.viewInvoiceDetail()` (`src/app/components/organisms/customer-invoices-table/customer-invoices-table.component.ts`)
>
> **Last updated**: 2026-06-22

---

## 1. Caller Side — How to Open a Dialog

```typescript
import { MatDialog } from '@angular/material/dialog';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS } from '../../shared/constants/dialog.config';
import { XxxDialogOrganism } from '../organisms/xxx-dialog/xxx-dialog.component';

@Component({...})
export class MyPageComponent {
  private dialog = inject(MatDialog);

  openDialog(data: SomeType) {
    const ref = this.dialog.open(XxxDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.lg,
      panelClass: DIALOG_PANEL_CLASS,
      data: { myData: data },
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData(); // recargar datos tras guardar/confirmar
      }
    });
  }
}
```

### Rules for callers

| Rule | ✅ Correcto | ❌ Incorrecto |
|------|------------|---------------|
| Abrir con `MatDialog.open()` | `this.dialog.open(Comp, config)` | `showDialog.set(true)` + `<div class="fixed inset-0 z-50...">` |
| Usar `DIALOG_WIDTHS` | `width: DIALOG_WIDTHS.lg` | `width: '850px'` (inline string) |
| Usar `DIALOG_PANEL_CLASS` | `panelClass: DIALOG_PANEL_CLASS` | `panelClass: 'premium-dialog'` (otro nombre) |
| Usar `DIALOG_DEFAULTS` | `...DIALOG_DEFAULTS` | `maxWidth: '95vw'` (inline) |
| Pasar data via config | `data: { invoiceId: id }` | `[data]="{ invoiceId: id }"` (input binding) |
| Result via `afterClosed()` | `ref.afterClosed().subscribe()` | `(closed)="handler($event)"` (output binding) |
| NO renderizar en template | Sin `<app-dialog>` en el HTML | `<app-dialog [data]="..." (closed)="...">` |
| NO importar en `imports[]` | El diálogo NO va en imports | `imports: [XxxDialog]` (no necesario) |

---

## 2. Dialog Component — How to Build a Dialog

### 2.1 TypeScript Class Template

```typescript
import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, formatDate, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// Material form modules as needed
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

// 1. EXPORT typed dialog data interface
export interface XxxDialogData {
  myData?: SomeType;
}

// 2. EXPORT typed result interface (optional but recommended)
export interface XxxDialogResult {
  success: boolean;
  // ...result fields
}

@Component({
  selector: 'app-xxx-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,  // SIEMPRE — nunca FormsModule
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    // NUNCA MatIconModule
    CurrencyPipe,
    DatePipe,
  ],
  template: `...`,
  styles: [`
    :host { display: block; }
    /* NUNCA ::ng-deep */
  `],
})
export class XxxDialogOrganism implements OnInit {
  // 3. Estados obligatorios (P0)
  loading = signal(false);
  error = signal<string | null>(null);

  // 4. Datos tipados via MAT_DIALOG_DATA
  private dialogData = inject<XxxDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<XxxDialogOrganism, XxxDialogResult>);
  private fb = inject(FormBuilder);

  // 5. Reactive Forms — NUNCA FormsModule ni [(ngModel)]
  form = this.fb.group({
    name: ['', Validators.required],
    // ...
  });

  ngOnInit() {
    if (this.dialogData?.myData) {
      this.form.patchValue(this.dialogData.myData);
    }
  }

  // 6. Cierre tipado
  close(result: XxxDialogResult | null = null) {
    this.dialogRef.close(result);
  }

  // 7. Submit con loading/error
  submit() {
    if (this.form.invalid) return;
    this.error.set(null);
    this.loading.set(true);

    this.service.save(this.form.getRawValue()).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.dialogRef.close({ success: true, ...result });
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error al guardar. Intente nuevamente.');
      },
    });
  }
}
```

### 2.2 Template Structure

```html
<div class="flex flex-col h-full max-h-[90vh]">
  <!-- HEADER: título + status + close button -->
  <header class="flex justify-between items-center mb-8 px-2">
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
        <span class="material-icons text-3xl">icon_name</span>
      </div>
      <div>
        <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight !m-0">
          Título del Diálogo
        </h2>
        <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Subtítulo</p>
      </div>
    </div>
    <button (click)="close(null)" aria-label="Cerrar diálogo"
            class="!text-gray-400 hover:!text-gray-600 transition-colors">
      <span class="material-icons">close</span>
    </button>
  </header>

  <!-- ESTADOS: loading / error / content -->
  @if (loading()) {
    <div class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  } @else if (error()) {
    <div class="mx-2 mb-4 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center justify-between gap-3 text-red-700">
      <div class="flex items-center gap-3">
        <span class="material-icons text-red-500">error_outline</span>
        <p class="text-xs font-bold uppercase tracking-wide">{{ error() }}</p>
      </div>
      <button (click)="error.set(null)" class="!text-red-400 hover:!text-red-600">
        <span class="material-icons">close</span>
      </button>
    </div>
  } @else {
    <!-- BODY: formulario o contenido -->
    <div class="flex-1 px-2 overflow-y-auto custom-scrollbar">
      <form [formGroup]="form" class="space-y-8 pb-4">
        <!-- form fields... -->
      </form>
    </div>
  }

  <!-- FOOTER: botones de acción -->
  <footer class="flex justify-end gap-3 mt-8 px-2 pt-4 border-t border-gray-100">
    <button mat-button (click)="close(null)" class="!rounded-full !h-12 !px-6 !font-bold">
      Cancelar
    </button>
    <button mat-flat-button color="primary" [disabled]="form.invalid"
            (click)="submit()"
            class="!rounded-full !h-12 !px-8 !font-bold !bg-indigo-600 shadow-xl shadow-indigo-100">
      Guardar
    </button>
  </footer>
</div>
```

---

## 3. Checklist — Antes de Merge

| # | Regla | Verificar |
|---|-------|-----------|
| 1 | `MatDialog.open()` en el caller | ✅ |
| 2 | `DIALOG_WIDTHS`, `DIALOG_PANEL_CLASS`, `DIALOG_DEFAULTS` en el caller | ✅ |
| 3 | `<span class="material-icons">` — NUNCA `<mat-icon>` | ✅ |
| 4 | `MatIconModule` NO está en imports | ✅ |
| 5 | `ReactiveFormsModule` SÍ está en imports | ✅ |
| 6 | `FormsModule` NO está en imports | ✅ |
| 7 | `[(ngModel)]` NO se usa en el template | ✅ |
| 8 | `FormBuilder` + `FormGroup`/`FormArray` para formularios | ✅ |
| 9 | `MAT_DIALOG_DATA` con tipo exportado (`XxxDialogData`) | ✅ |
| 10 | `loading` y `error` signals declarados | ✅ |
| 11 | Template tri-estado: `@if loading @else if error @else content` | ✅ |
| 12 | `aria-label="Cerrar diálogo"` en botón de cierre | ✅ |
| 13 | `::ng-deep` NO está en styles | ✅ |
| 14 | Tailwind: `rounded-[32px]` o consistente con otros diálogos | ✅ |
| 15 | Caller NO renderiza el diálogo en su template | ✅ |
| 16 | Caller NO tiene `showXxxDialog` signals | ✅ |
| 17 | Caller usa `afterClosed().subscribe()` para resultado | ✅ |
| 18 | El componente NO usa `input()`/`output()` para datos del diálogo | ✅ |

---

## 4. Anti-Patterns — PROHIBIDOS

### ❌ Inline modal (Pattern C)

```html
<!-- NUNCA hagas esto -->
@if (showDialog()) {
  <div class="fixed inset-0 z-50 backdrop-blur-sm" (click)="showDialog.set(false)">
    <app-dialog [data]="..." (closed)="showDialog.set(false)" />
  </div>
}
```

### ❌ `input()`/`output()` para datos de diálogo

```typescript
// NUNCA
data = input<any>({});
closed = output<boolean>();
```

### ❌ `[(ngModel)]` + `FormsModule`

```html
<!-- NUNCA -->
<input [(ngModel)]="myField" />
```

### ❌ `<mat-icon>` + `MatIconModule`

```html
<!-- NUNCA -->
<mat-icon>close</mat-icon>
```

### ❌ `::ng-deep`

```css
/* NUNCA */
::ng-deep .mat-mdc-dialog-container { ... }
```

### ❌ `MAT_DIALOG_DATA` sin tipar

```typescript
// NUNCA
private data = inject<any>(MAT_DIALOG_DATA);
```

---

## 5. `dialog.config.ts` Reference

```typescript
// src/app/shared/constants/dialog.config.ts
export const DIALOG_WIDTHS = {
  sm: '500px',
  md: '600px',
  lg: '850px',
  xl: '950px',
} as const;

export const DIALOG_PANEL_CLASS = 'erp-dialog-panel';
export const DIALOG_DEFAULTS = {
  maxWidth: '95vw',
  disableClose: false,
} as const;
```

---

## 6. Real Examples in Codebase

| Componente | Archivo | ¿Cumple? |
|-----------|---------|-----------|
| `PurchaseOrderDialogOrganism` | `organisms/purchase-order-dialog/` | ✅ Referencia canónica |
| `CustomerInvoicesTableOrganism` | `organisms/customer-invoices-table/` | ✅ Caller canónico |
| `TransportDispatchDialogOrganism` | `organisms/transport-dispatch-dialog/` | ✅ Migrado |
| `AnamnesisDialogComponent` | `organisms/anamnesis-dialog/` | ✅ Migrado |
| `InvoiceDetailDialogOrganism` | `organisms/invoice-detail-dialog/` | ✅ Migrado |
| `ConfirmDeleteDialogOrganism` | `organisms/confirm-delete-dialog/` | ✅ Migrado |

---

## 7. Shared Styles

Para scrollbar consistente en todos los diálogos:

```css
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
```

Aplicar con `class="overflow-y-auto custom-scrollbar"` en el body del diálogo.
