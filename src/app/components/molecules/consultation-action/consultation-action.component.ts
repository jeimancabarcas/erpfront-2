import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-consultation-action',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <button (click)="action.emit()" 
      class="w-full group p-5 rounded-[28px] border transition-all duration-300 flex items-center justify-between text-left shadow-sm hover:shadow-md active:scale-[0.98]"
      [class]="buttonClasses()">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm"
          [class]="iconContainerClasses()">
          <mat-icon>{{ icon() }}</mat-icon>
        </div>
        <div>
          <span class="block font-black text-sm transition-colors" 
            [class]="labelClasses()">
            {{ label() }}
          </span>
          <span class="text-[10px] uppercase tracking-tighter font-bold transition-colors" 
            [class]="statusClasses()">
            {{ statusLabel() }}
          </span>
        </div>
      </div>
      <mat-icon class="!text-sm transition-all duration-300 group-hover:translate-x-1" 
        [class]="chevronClasses()">
        {{ isComplete() ? 'check_circle' : 'chevron_right' }}
      </mat-icon>
    </button>
  `
})
export class ConsultationActionMolecule {
  icon = input.required<string>();
  label = input.required<string>();
  statusLabel = input.required<string>();
  isComplete = input<boolean>(false);
  
  action = output<void>();

  // Computed classes for cleaner template logic and better performance
  buttonClasses = computed(() => 
    this.isComplete() 
      ? 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-50' 
      : 'bg-gray-50/50 border-gray-100 hover:border-indigo-200 hover:bg-white'
  );

  iconContainerClasses = computed(() => 
    this.isComplete() 
      ? 'bg-indigo-600 text-white rotate-0' 
      : 'bg-white text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-50'
  );

  labelClasses = computed(() => 
    this.isComplete() ? 'text-indigo-900' : 'text-gray-600 group-hover:text-indigo-900'
  );

  statusClasses = computed(() => 
    this.isComplete() ? 'text-indigo-400' : 'text-gray-400 group-hover:text-indigo-400'
  );

  chevronClasses = computed(() => 
    this.isComplete() ? 'text-indigo-400' : 'text-gray-300 group-hover:text-indigo-400'
  );
}
