import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-customer-stats-molecule',
  standalone: true,
  imports: [CommonModule, MatIconModule, CurrencyPipe],
  template: `
    <div class="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100 flex flex-col justify-center h-full min-h-[200px] relative overflow-hidden group">
      <!-- Background Decoration -->
      <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500"></div>
      
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-white/10 rounded-lg">
            <mat-icon class="!w-6 !h-6">payments</mat-icon>
          </div>
          <span class="text-[10px] font-black uppercase tracking-widest opacity-80">Total Facturado Histórico</span>
        </div>
        
        <h3 class="text-4xl font-black mb-2 tracking-tighter">{{ totalBilled | currency }}</h3>
        
        <div class="flex items-center gap-2 text-indigo-100 mt-4">
          <mat-icon class="!w-4 !h-4 !text-xs">receipt</mat-icon>
          <p class="text-xs font-bold">{{ invoiceCount }} facturas emitidas satisfactoriamente</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class CustomerStatsMolecule {
  @Input({ required: true }) totalBilled: number = 0;
  @Input({ required: true }) invoiceCount: number = 0;
}
