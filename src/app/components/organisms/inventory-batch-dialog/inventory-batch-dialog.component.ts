import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { InventoryBatch } from '../../../models/inventory-batch.model';

@Component({
  selector: 'app-inventory-batch-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    CurrencyPipe,
    DatePipe
  ],
  template: `
    <div class="flex flex-col h-full max-h-[90vh]">
      <!-- Header -->
      <header class="flex justify-between items-center mb-8 px-2">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <mat-icon class="!text-3xl">history</mat-icon>
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight !m-0">
              Trazabilidad por Lotes
            </h2>
            <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
              {{ product.name }} • {{ product.sku }}
            </p>
          </div>
        </div>
        <button mat-icon-button (click)="dialogRef.close()" class="!text-gray-400">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <!-- Info del Producto -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 px-2">
        <div class="bg-gray-50 p-6 rounded-[28px] border border-gray-100">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Precio Medio Ponderado (PMP)</p>
          <p class="text-3xl font-black text-indigo-600 tracking-tighter">
            {{ product.averagePurchasePrice | currency }}
          </p>
        </div>
        <div class="bg-gray-50 p-6 rounded-[28px] border border-gray-100">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock Actual Total</p>
          <p class="text-3xl font-black text-gray-900 tracking-tighter">
            {{ product.currentStock }} <span class="text-sm font-bold text-gray-400 ml-1 uppercase">unidades</span>
          </p>
        </div>
      </div>

      <mat-dialog-content class="flex-1 !px-2 custom-scrollbar">
        <h3 class="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 px-2">Historial de Ingresos</h3>
        
        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center p-20 gap-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p class="text-sm text-gray-500 font-medium">Cargando lotes...</p>
          </div>
        } @else if (batches().length === 0) {
          <div class="bg-gray-50 rounded-3xl p-12 text-center border border-gray-100">
            <mat-icon class="!text-5xl text-gray-300 mb-4">inventory_2</mat-icon>
            <p class="text-gray-900 font-bold">No hay lotes registrados</p>
            <p class="text-xs text-gray-500">Este producto aún no tiene ingresos de stock trazables.</p>
          </div>
        } @else {
          <div class="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50/50">
                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Fecha Ingreso</th>
                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center border-b border-gray-50">Cant. Inicial</th>
                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center border-b border-gray-50">Disponible</th>
                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right border-b border-gray-50">Precio Compra</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  @for (batch of batches(); track batch.id) {
                    <tr class="hover:bg-gray-50/50 transition-colors">
                      <td class="px-6 py-4">
                        <p class="text-sm font-bold text-gray-900">{{ batch.createdAt | date:'dd MMM, yyyy' }}</p>
                        <p class="text-[10px] text-gray-400 font-medium italic">ID: {{ batch.id.split('-')[0] }}</p>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span class="text-gray-400 text-xs font-bold">{{ batch.initialQuantity }}</span>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span 
                          class="px-3 py-1 rounded-full text-xs font-black"
                          [ngClass]="batch.remainingQuantity > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'"
                        >
                          {{ batch.remainingQuantity }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <span class="text-sm font-black text-gray-900">{{ batch.purchasePrice | currency }}</span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions class="!justify-end !pt-6 !px-2 !min-h-0 border-t border-gray-100 mt-4">
        <button 
          mat-flat-button 
          (click)="dialogRef.close()"
          class="!h-12 !px-8 !rounded-full !font-bold !bg-gray-900 !text-white"
        >
          Entendido
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface {
      border-radius: 40px !important;
      padding: 32px !important;
    }
  `]
})
export class InventoryBatchDialogOrganism implements OnInit {
  public dialogRef = inject(MatDialogRef<InventoryBatchDialogOrganism>);
  public product: Product = inject(MAT_DIALOG_DATA).product;
  private productService = inject(ProductService);

  batches = signal<InventoryBatch[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.productService.getProductBatches(this.product.id).subscribe({
      next: (data: InventoryBatch[]) => {
        this.batches.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
