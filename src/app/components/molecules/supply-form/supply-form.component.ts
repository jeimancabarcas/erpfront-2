import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SupplyService, Supply } from '../../../services/supply.service';
import { CreateSupplyDto } from '../../../models/supply.model';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';

export interface SupplyFormDialogData {
  supply?: Supply;
}

@Component({
  selector: 'app-supply-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonAtom,
    TextInputComponent,
    TextareaComponent
  ],
  template: `
    <div class="p-8">
      <header class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight !m-0">
          {{ isEditMode ? 'Editar Insumo' : 'Nuevo Insumo' }}
        </h2>
        <ui-button variant="icon" (clicked)="onClose()" ariaLabel="Cerrar diálogo">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <form #supplyForm="ngForm" class="space-y-6">
        <div class="space-y-6">
          <ui-text-input
            label="Nombre del Insumo"
            icon="inventory_2"
            [value]="supply().nombre ?? ''"
            (valueChange)="supply().nombre = $event"
            name="nombre"
            [required]="true"
            placeholder="Ej. Gasas estériles"
          />

          <ui-textarea
            label="Descripción (Opcional)"
            [value]="supply().descripcion ?? ''"
            (valueChange)="supply().descripcion = $event"
            [rows]="3"
            placeholder="Añade una breve descripción..."
          />
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <ui-button variant="outline" (clicked)="onClose()">
            Cancelar
          </ui-button>
          <ui-button
            variant="primary"
            [disabled]="!supplyForm.valid"
            (clicked)="saveSupply()"
          >
            {{ isEditMode ? 'Guardar Cambios' : 'Crear Insumo' }}
          </ui-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SupplyFormMolecule implements OnInit {
  private dialogRef = inject(MatDialogRef<SupplyFormMolecule, boolean>);
  private dialogData = inject<SupplyFormDialogData>(MAT_DIALOG_DATA, { optional: true });

  private supplyService = inject(SupplyService);

  isEditMode = false;
  supply = signal<Partial<Supply>>({
    nombre: '',
    descripcion: ''
  });

  ngOnInit() {
    if (this.dialogData?.supply) {
      this.isEditMode = true;
      this.supply.set({ ...this.dialogData.supply });
    }
  }

  onClose() {
    this.dialogRef.close(false);
  }

  saveSupply() {
    const supplyData = this.supply();

    if (this.isEditMode && supplyData.id) {
      this.supplyService.updateSupply(supplyData.id, {
        nombre: supplyData.nombre,
        descripcion: supplyData.descripcion
      }).subscribe(() => this.dialogRef.close(true));
    } else {
      this.supplyService.createSupply({
        nombre: supplyData.nombre!,
        descripcion: supplyData.descripcion
      }).subscribe(() => this.dialogRef.close(true));
    }
  }
}
