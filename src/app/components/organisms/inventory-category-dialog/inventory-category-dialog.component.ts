import { Component, inject, signal, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, InventoryCategory } from '../../../services/category.service';
import { ButtonAtom } from '../../atoms/button/button.component';

@Component({
  selector: 'app-inventory-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonAtom
  ],
  template: `
    <div class="p-2">
      <header class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight !m-0">
          {{ isEditMode ? 'Editar Categoría' : 'Nueva Categoría' }}
        </h2>
        <ui-button variant="icon" (clicked)="onClose()" class="!text-gray-400">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <form #categoryForm="ngForm" class="space-y-6">
        <div class="space-y-6">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Nombre de la Categoría</label>
            <input
              [(ngModel)]="category().name"
              name="name"
              required
              placeholder="Ej. Medicamentos"
              class="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Descripción (Opcional)</label>
            <textarea
              [(ngModel)]="category().description"
              name="description"
              rows="3"
              placeholder="Añade una breve descripción..."
              class="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all resize-none"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <ui-button variant="outline" (clicked)="onClose()" class="!h-12 !px-8 !rounded-full !font-bold text-gray-500">
            Cancelar
          </ui-button>
          <ui-button
            variant="primary"
            [disabled]="!categoryForm.valid"
            (clicked)="saveCategory()"
            class="!h-12 !px-8 !rounded-full !font-bold !bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
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
  data = input<{ category?: InventoryCategory }>({});
  closed = output<boolean>();

  private categoryService = inject(CategoryService);

  isEditMode = false;
  category = signal<Partial<InventoryCategory>>({
    name: '',
    description: '',
  });

  ngOnInit() {
    const incoming = this.data();
    if (incoming.category) {
      this.isEditMode = true;
      this.category.set({ ...incoming.category });
    }
  }

  onClose() {
    this.closed.emit(false);
  }

  saveCategory() {
    const categoryData = this.category();
    
    if (this.isEditMode && categoryData.id) {
      this.categoryService.updateCategory(categoryData.id, {
        name: categoryData.name,
        description: categoryData.description
      }).subscribe(() => this.closed.emit(true));
    } else {
      this.categoryService.createCategory({
        name: categoryData.name!,
        description: categoryData.description
      }).subscribe(() => this.closed.emit(true));
    }
  }
}
