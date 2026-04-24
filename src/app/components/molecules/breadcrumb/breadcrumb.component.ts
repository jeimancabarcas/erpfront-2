import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export interface BreadcrumbItem {
  label: string;
  link?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <nav class="flex items-center gap-2 text-sm font-bold mb-6">
      @for (item of items(); track item.label; let last = $last) {
        @if (item.link) {
          <a [routerLink]="item.link" class="text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-wider text-[11px]">
            {{ item.label }}
          </a>
        } @else {
          <span class="text-gray-400 uppercase tracking-wider text-[11px]">{{ item.label }}</span>
        }
        
        <mat-icon class="!text-gray-300 !text-sm flex items-center justify-center">chevron_right</mat-icon>
      }
      <span class="text-indigo-600 uppercase tracking-wider text-[11px]">{{ currentLabel() }}</span>
    </nav>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class BreadcrumbMolecule {
  items = input<BreadcrumbItem[]>([]);
  currentLabel = input<string>('');
}
