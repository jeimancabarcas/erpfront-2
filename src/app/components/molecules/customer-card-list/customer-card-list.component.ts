import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { SalesService } from '../../../services/sales.service';
import { StatusTagAtom } from '../../atoms/status-tag/status-tag.component';

@Component({
  selector: 'app-customer-card-list',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, CurrencyPipe, StatusTagAtom],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      @for (customer of salesService.customers(); track customer.id) {
        <mat-card class="!rounded-[28px] !border-none !shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:!shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all overflow-hidden bg-white">
          <div class="p-8">
            <div class="flex justify-between items-start mb-6">
              <div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-xl">
                {{customer.name.charAt(0)}}
              </div>
              <app-status-tag [label]="customer.status" [color]="customer.status === 'Active' ? 'green' : 'gray'" />
            </div>

            <h3 class="text-lg font-bold text-gray-900 mb-1">{{customer.name}}</h3>
            <p class="text-sm text-gray-500 font-medium mb-1">{{customer.company}}</p>
            <p class="text-[10px] font-mono text-indigo-400 font-bold mb-4">NIT: {{customer.nit}}</p>
            <p class="text-xs text-gray-400 mb-6">{{customer.email}}</p>

            <div class="flex justify-between items-center pt-4 border-t border-gray-50">
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Comprado</p>
                <p class="text-lg font-extrabold text-indigo-600">{{customer.totalSpent | currency:'USD':'symbol':'1.0-0'}}</p>
              </div>
              <button mat-icon-button class="!bg-gray-50 !text-gray-400">
                <mat-icon class="!text-sm">arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CustomerCardListMolecule {
  salesService = inject(SalesService);
}
