import { Component, inject, signal, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { SupplierService } from '../../../services/supplier.service';
import { Supplier } from '../../../models/supplier.model';
import { ButtonAtom } from '../../atoms/button/button.component';

export interface SupplierDialogData {
  supplier?: Supplier;
}

@Component({
  selector: 'app-supplier-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonAtom,
    TextInputComponent
  ],
  template: `
    @if (loading()) {
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    } @else if (error()) {
      <div class="flex flex-col items-center gap-2 text-red-500 py-12">
        <span class="material-icons text-5xl">error_outline</span>
        <p>{{ error() }}</p>
        <button (click)="onClose()" class="!rounded-full !px-6 !h-10 !text-sm !font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mt-4">Cerrar</button>
      </div>
    } @else {
    <div class="bg-white dark:bg-gray-900 p-8">
      <header class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight !m-0">
          {{ isEditMode ? 'Editar Proveedor' : 'Nuevo Proveedor' }}
        </h2>
        <ui-button variant="icon" (clicked)="onClose()" aria-label="Cerrar diálogo">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <form #supplierForm="ngForm" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ui-text-input label="NIT / Identificación" icon="fingerprint" [value]="form().nit" (valueChange)="form().nit = $event" name="nit" [required]="true" placeholder="Ej. 900.123.456-1" />
          <ui-text-input label="Nombre del Proveedor" icon="business" [value]="form().name" (valueChange)="form().name = $event" name="name" [required]="true" placeholder="Ej. Distribuidora Global S.A.S" />
          <ui-text-input label="Dirección" icon="location_on" [value]="form().address" (valueChange)="form().address = $event" name="address" [required]="true" placeholder="Ej. Calle 123 # 45-67" />
          <ui-text-input label="Teléfono" icon="phone" [value]="form().phone" (valueChange)="form().phone = $event" name="phone" [required]="true" placeholder="Ej. +57 300 123 4567" />
          <ui-text-input type="email" label="Correo Electrónico" icon="email" [value]="form().email" (valueChange)="form().email = $event" name="email" [required]="true" placeholder="Ej. contacto@proveedor.com" />
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <ui-button variant="outline" (clicked)="onClose()">
            Cancelar
          </ui-button>
          <ui-button
            variant="primary"
            [disabled]="!supplierForm.valid"
            (clicked)="saveSupplier()"
          >
            {{ isEditMode ? 'Guardar Cambios' : 'Registrar Proveedor' }}
          </ui-button>
        </div>
      </form>
    </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SupplierDialogOrganism implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  /** Input for inline usage via template binding */
  data = input<{ supplier?: Supplier }>({});
  /** Output for inline usage */
  closed = output<boolean>();
  /** MAT_DIALOG_DATA for MatDialog.open path */
  private dialogData = inject<SupplierDialogData>(MAT_DIALOG_DATA, { optional: true });
  private dialogRef = inject<MatDialogRef<SupplierDialogOrganism>>(MatDialogRef, { optional: true });

  private supplierService = inject(SupplierService);

  isEditMode = false;
  form = signal<any>({
    nit: '',
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  ngOnInit() {
    // Use MAT_DIALOG_DATA if available (MatDialog path), otherwise input() (inline path)
    const incoming = this.dialogData ?? this.data();
    if (incoming.supplier) {
      this.isEditMode = true;
      this.form.set({ ...incoming.supplier });
    }
  }

  onClose() {
    this.dialogRef?.close();
    this.closed.emit(false);
  }

  saveSupplier() {
    const { id, nit, name, address, phone, email } = this.form();
    const payload = { nit, name, address, phone, email };
    
    const request = this.isEditMode 
      ? this.supplierService.updateSupplier(id, payload)
      : this.supplierService.createSupplier(payload);

    request.subscribe({
      next: () => this.closed.emit(true),
      error: (err) => console.error('Error saving supplier:', err)
    });
  }
}
