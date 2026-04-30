import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="py-20 text-center animate-in fade-in zoom-in-95 duration-500">
      <div class="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-300 mx-auto mb-6 shadow-sm border border-gray-50">
        <mat-icon class="!text-[40px] !w-10 !h-10">{{ icon() }}</mat-icon>
      </div>
      @if (title()) {
        <h3 class="text-gray-900 text-lg font-black mb-1">{{ title() }}</h3>
      }
      <p class="text-gray-400 text-base font-medium italic max-w-xs mx-auto">{{ description() }}</p>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class EmptyStateAtom {
  icon = input<string>('inventory_2');
  title = input<string | null>(null);
  description = input<string>('No se han encontrado registros aún.');
}
