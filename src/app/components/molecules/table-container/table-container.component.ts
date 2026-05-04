import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStateAtom } from '../../atoms/empty-state/empty-state.component';

@Component({
  selector: 'app-table-container',
  standalone: true,
  imports: [CommonModule, EmptyStateAtom],
  template: `
    <div class="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden min-h-[400px] flex flex-col">
      @if (hasData()) {
        <div class="flex-1 overflow-x-auto">
          <ng-content></ng-content>
        </div>
      } @else {
        <div class="flex-1 flex items-center justify-center p-8">
          <app-empty-state 
            [icon]="emptyIcon()"
            [title]="emptyTitle()"
            [description]="emptyDescription()"
          />
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TableContainerMolecule {
  hasData = input.required<boolean>();
  emptyIcon = input<string>('inventory_2');
  emptyTitle = input<string>('No hay datos');
  emptyDescription = input<string>('Aún no se han encontrado registros en esta sección.');
}
