import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="py-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
      <div class="w-20 h-20 bg-indigo-50 rounded-[28px] flex items-center justify-center text-indigo-600 mb-6 shadow-sm border border-indigo-100/50 rotate-3 hover:rotate-0 transition-transform duration-300">
        <mat-icon class="!text-4xl !w-10 !h-10">{{ icon() }}</mat-icon>
      </div>
      
      @if (title()) {
        <h3 class="text-gray-900 text-xl font-black mb-2 tracking-tight">{{ title() }}</h3>
      }
      
      <p class="text-gray-500 text-base font-medium max-w-xs mx-auto mb-8 leading-relaxed">
        {{ description() }}
      </p>

      <div class="flex justify-center">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class EmptyStateAtom {
  icon = input<string>('inventory_2');
  title = input<string | null>(null);
  description = input<string>('No se han encontrado registros aún en esta sección.');
}
