import { Component, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { InventoryService } from '../../../services/inventory.service';

@Component({
  selector: 'app-movements-table',
  standalone: true,
  imports: [MatTableModule, MatIconModule],
  template: `
    <div class="overflow-x-auto">
      <table mat-table [dataSource]="inventoryService.movements()" class="w-full">
        <!-- ID Column -->
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">ID</th>
          <td mat-cell *matCellDef="let movement" class="!text-gray-500 font-mono">{{movement.id}}</td>
        </ng-container>

        <!-- Product Column -->
        <ng-container matColumnDef="product">
          <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Producto</th>
          <td mat-cell *matCellDef="let movement" class="font-bold text-gray-900">{{movement.product}}</td>
        </ng-container>

        <!-- Type Column -->
        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Tipo</th>
          <td mat-cell *matCellDef="let movement">
            <div class="flex items-center gap-2">
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center"
                [class]="getTypeBg(movement.type)"
              >
                <mat-icon class="!text-[18px] !w-auto !h-auto" [class]="getTypeColor(movement.type)">
                  {{getTypeIcon(movement.type)}}
                </mat-icon>
              </div>
              <span class="text-sm font-medium">{{movement.type}}</span>
            </div>
          </td>
        </ng-container>

        <!-- Quantity Column -->
        <ng-container matColumnDef="quantity">
          <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Cantidad</th>
          <td mat-cell *matCellDef="let movement" class="font-bold">{{movement.quantity}}</td>
        </ng-container>

        <!-- Date Column -->
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Fecha</th>
          <td mat-cell *matCellDef="let movement" class="text-gray-500 text-sm">{{movement.date}}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50 transition-colors"></tr>
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
      padding-top: 16px;
      padding-bottom: 16px;
    }
  `]
})
export class MovementsTableMolecule {
  inventoryService = inject(InventoryService);
  displayedColumns: string[] = ['id', 'product', 'type', 'quantity', 'date'];

  getTypeIcon(type: string): string {
    switch (type) {
      case 'In': return 'south_west';
      case 'Out': return 'north_east';
      case 'Transfer': return 'sync_alt';
      default: return 'help';
    }
  }

  getTypeBg(type: string): string {
    switch (type) {
      case 'In': return 'bg-green-50';
      case 'Out': return 'bg-red-50';
      case 'Transfer': return 'bg-blue-50';
      default: return 'bg-gray-50';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'In': return '!text-green-600';
      case 'Out': return '!text-red-600';
      case 'Transfer': return '!text-blue-600';
      default: return '!text-gray-600';
    }
  }
}
