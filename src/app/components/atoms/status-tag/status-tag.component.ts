import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-tag',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center justify-center"
      [class]="colorClasses()"
    >
      {{ label() }}
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class StatusTagAtom {
  label = input.required<string>();
  color = input.required<'green' | 'amber' | 'red' | 'blue' | 'gray'>();

  colorClasses = computed(() => {
    switch (this.color()) {
      case 'green': 
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'amber': 
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'red': 
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'blue': 
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default: 
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400';
    }
  });
}
