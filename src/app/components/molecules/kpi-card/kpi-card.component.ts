import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-kpi-card-molecule',
  standalone: true,
  imports: [CommonModule, MatIconModule, CurrencyPipe],
  template: `
    <div 
      class="p-6 rounded-[32px] border border-gray-100 bg-white shadow-sm flex flex-col justify-between h-full group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 hover:-translate-y-1"
    >
      <div class="flex justify-between items-start mb-6">
        <div 
          class="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
          [ngClass]="iconBgClass"
        >
          <mat-icon [class]="iconColorClass">{{ icon }}</mat-icon>
        </div>
        
        @if (trend !== undefined) {
          <div 
            class="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
            [ngClass]="trend === 'UP' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'"
          >
            <mat-icon class="!text-[14px] !w-[14px] !h-[14px]">{{ trend === 'UP' ? 'trending_up' : 'trending_down' }}</mat-icon>
            {{ trendValue | number:'1.0-1' }}%
          </div>
        }
      </div>

      <div>
        <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{{ label }}</p>
        <h3 class="text-2xl font-black text-gray-900 tracking-tight">{{ value | currency }}</h3>
        
        @if (subtitle) {
          <p class="text-xs text-gray-400 font-medium mt-2 flex items-center gap-1">
            <mat-icon class="!text-[14px] !w-[14px] !h-[14px] opacity-50">info_outline</mat-icon>
            {{ subtitle }}
          </p>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class KpiCardMolecule {
  @Input({ required: true }) label: string = '';
  @Input({ required: true }) value: number = 0;
  @Input({ required: true }) icon: string = '';
  @Input() trend?: 'UP' | 'DOWN';
  @Input() trendValue?: number;
  @Input() subtitle?: string;
  @Input() iconBgClass: string = 'bg-indigo-50';
  @Input() iconColorClass: string = 'text-indigo-600';
}
