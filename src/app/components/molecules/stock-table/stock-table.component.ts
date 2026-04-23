import { Component, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { InventoryService, StockItem } from '../../../services/inventory.service';
import { ProductFormMolecule } from '../product-form/product-form.component';

@Component({
  selector: 'app-stock-table',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="overflow-x-auto">
      <table mat-table [dataSource]="inventoryService.stock()" class="w-full">
        <!-- SKU Column -->
        <ng-container matColumnDef="sku">
          <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">SKU</th>
          <td mat-cell *matCellDef="let item" class="!text-gray-500 font-mono">{{item.sku}}</td>
        </ng-container>

        <!-- Name Column -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Producto</th>
          <td mat-cell *matCellDef="let item">
            <div class="font-bold text-gray-900">{{item.name}}</div>
            <div class="text-xs text-gray-500">{{item.category}}</div>
          </td>
        </ng-container>

        <!-- Quantity Column -->
        <ng-container matColumnDef="quantity">
          <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Stock</th>
          <td mat-cell *matCellDef="let item">
            <span class="font-bold" [class.text-red-600]="item.quantity === 0">{{item.quantity}}</span>
            <span class="text-xs text-gray-400 ml-1">{{item.unit}}</span>
          </td>
        </ng-container>

        <!-- Status Column -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Estado</th>
          <td mat-cell *matCellDef="let item">
            <span 
              class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              [class]="getStatusClass(item.status)"
            >
              {{item.status}}
            </span>
          </td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let item" class="text-right">
            <button mat-icon-button (click)="editProduct(item)" class="!text-gray-400">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button class="!text-gray-400">
              <mat-icon>more_vert</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50 transition-colors cursor-pointer"></tr>
      </table>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .mat-mdc-header-cell {
      padding-top: 16px;
      padding-bottom: 16px;
    }
    .mat-mdc-cell {
      padding-top: 20px;
      padding-bottom: 20px;
    }
  `]
})
export class StockTableMolecule {
  inventoryService = inject(InventoryService);
  private dialog = inject(MatDialog);
  displayedColumns: string[] = ['sku', 'name', 'quantity', 'status', 'actions'];

  editProduct(product: StockItem) {
    this.dialog.open(ProductFormMolecule, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: true,
      data: { product }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-700';
      case 'Low Stock': return 'bg-amber-100 text-amber-700';
      case 'Out of Stock': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}
