import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { CategoryService, InventoryCategory } from '../../../services/category.service';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';

@Component({
  selector: 'app-inventory-category-dialog',
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
        <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight !m-0">
          {{ isEditMode ? 'Editar Categoría' : 'Nueva Categoría' }}
        </h2>
        <ui-button variant="icon" (clicked)="onClose()" ariaLabel="Cerrar diálogo">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <form #categoryForm="ngForm" class="space-y-6">
        <div class="space-y-6">
          <ui-text-input
            label="Nombre de la Categoría"
            icon="category"
            [value]="category().name ?? ''"
            (valueChange)="category().name = $event"
            name="name"
            [required]="true"
            placeholder="Ej. Medicamentos"
          />

          <ui-textarea
            label="Descripción (Opcional)"
            [value]="category().description ?? ''"
            (valueChange)="category().description = $event"
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
            [disabled]="!categoryForm.valid"
            (clicked)="saveCategory()"
          >
            {{ isEditMode ? 'Guardar Cambios' : 'Crear Categoría' }}
          </ui-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class InventoryCategoryDialogOrganism implements OnInit {
  private dialogRef = inject(MatDialogRef<InventoryCategoryDialogOrganism, boolean>);
  private dialogData = inject<{ category?: InventoryCategory }>(MAT_DIALOG_DATA);

  private categoryService = inject(CategoryService);

  isEditMode = false;
  category = signal<Partial<InventoryCategory>>({
    name: '',
    description: '',
  });

  ngOnInit() {
    if (this.dialogData?.category) {
      this.isEditMode = true;
      this.category.set({ ...this.dialogData.category });
    }
  }

  onClose() {
    this.dialogRef.close(false);
  }

  saveCategory() {
    const categoryData = this.category();
    
    if (this.isEditMode && categoryData.id) {
      this.categoryService.updateCategory(categoryData.id, {
        name: categoryData.name,
        description: categoryData.description
      }).subscribe(() => this.dialogRef.close(true));
    } else {
      this.categoryService.createCategory({
        name: categoryData.name!,
        description: categoryData.description
      }).subscribe(() => this.dialogRef.close(true));
    }
  }
}
