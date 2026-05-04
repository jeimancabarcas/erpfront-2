import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CategoryService, InventoryCategory } from '../../../services/category.service';

@Component({
  selector: 'app-inventory-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule
  ],
  template: `
    <div class="p-2">
      <header class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight !m-0">
          {{ isEditMode ? 'Editar Categoría' : 'Nueva Categoría' }}
        </h2>
        <button mat-icon-button (click)="dialogRef.close()" class="!text-gray-400">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <form #categoryForm="ngForm" class="space-y-6">
        <div class="space-y-6">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre de la Categoría</mat-label>
            <input 
              matInput 
              [(ngModel)]="category().name" 
              name="name" 
              required 
              placeholder="Ej. Medicamentos"
            >
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Descripción (Opcional)</mat-label>
            <textarea 
              matInput 
              [(ngModel)]="category().description" 
              name="description" 
              rows="3"
              placeholder="Añade una breve descripción..."
            ></textarea>
          </mat-form-field>
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <button mat-button (click)="dialogRef.close()" class="!h-12 !px-8 !rounded-full !font-bold text-gray-500">
            Cancelar
          </button>
          <button 
            mat-flat-button 
            color="primary" 
            [disabled]="!categoryForm.valid"
            (click)="saveCategory()"
            class="!h-12 !px-8 !rounded-full !font-bold !bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
          >
            {{ isEditMode ? 'Guardar Cambios' : 'Crear Categoría' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .custom-dialog-container .mat-mdc-dialog-container .mdc-dialog__surface {
      border-radius: 40px !important;
      padding: 32px !important;
    }
  `]
})
export class InventoryCategoryDialogOrganism implements OnInit {
  public dialogRef = inject(MatDialogRef<InventoryCategoryDialogOrganism>);
  private data = inject(MAT_DIALOG_DATA, { optional: true });
  private categoryService = inject(CategoryService);

  isEditMode = false;
  category = signal<Partial<InventoryCategory>>({
    name: '',
    description: '',
  });

  ngOnInit() {
    if (this.data && this.data.category) {
      this.isEditMode = true;
      this.category.set({ ...this.data.category });
    }
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
