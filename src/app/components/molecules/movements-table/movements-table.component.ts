import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { TextInputComponent } from '../../../components/atoms/text-input/text-input.component';
import { SelectAtom, SelectOption } from '../../../components/atoms/select/select.component';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { InventoryService } from '../../../services/inventory.service';

@Component({
  selector: 'app-movements-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    FormsModule,
    TextInputComponent,
    SelectAtom,
  ],
  template: `
    <div class="flex flex-col">
      <!-- Filters -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 p-6 pb-4 min-w-0">
        <div class="flex flex-wrap items-center gap-3 min-w-0">
          <ui-select placeholder="Tipo" [options]="filterTypeOptions" [value]="filterType()" (valueChange)="filterType.set($event); applyFilters()" class="!w-[140px]" />

          <div class="flex items-center gap-2">
            <ui-text-input icon="search" [value]="filterUser()" (valueChange)="onUserInput($event)" placeholder="Filtrar por usuario" class="!w-[200px]" />
            @if (filterUser()) {
              <button (click)="clearUserFilter()" class="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors !bg-white !shadow-none" type="button">
                <mat-icon class="!text-[18px] !w-auto !h-auto text-gray-500">close</mat-icon>
              </button>
            }
          </div>
        </div>

        <span class="sm:ml-auto text-xs text-gray-400 font-bold uppercase tracking-widest whitespace-nowrap">
          {{ totalItems() }} registros
        </span>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table mat-table [dataSource]="inventoryService.movements()" class="w-full">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">ID</th>
            <td mat-cell *matCellDef="let movement" class="!text-gray-500 font-mono text-xs">{{movement.id}}</td>
          </ng-container>

          <ng-container matColumnDef="product">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Producto</th>
            <td mat-cell *matCellDef="let movement" class="font-bold text-gray-900 text-sm">{{movement.product}}</td>
          </ng-container>

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Tipo</th>
            <td mat-cell *matCellDef="let movement">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full flex items-center justify-center" [class]="getTypeBg(movement.type)">
                  <mat-icon class="!text-[18px] !w-auto !h-auto" [class]="getTypeColor(movement.type)">
                    {{getTypeIcon(movement.type)}}
                  </mat-icon>
                </div>
                <span class="text-sm font-medium">{{movement.type === 'In' ? 'Entrada' : 'Salida'}}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Cantidad</th>
            <td mat-cell *matCellDef="let movement" class="font-bold text-sm">{{movement.quantity}}</td>
          </ng-container>

          <ng-container matColumnDef="origin">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Origen</th>
            <td mat-cell *matCellDef="let movement" class="text-gray-500 text-sm">{{movement.origin}}</td>
          </ng-container>

          <ng-container matColumnDef="destination">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Destino</th>
            <td mat-cell *matCellDef="let movement" class="text-gray-500 text-sm">{{movement.destination}}</td>
          </ng-container>

          <ng-container matColumnDef="operator">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Usuario</th>
            <td mat-cell *matCellDef="let movement" class="text-gray-500 text-sm">{{movement.operator}}</td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Fecha</th>
            <td mat-cell *matCellDef="let movement" class="text-gray-500 text-sm">{{movement.date}}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50 transition-colors"></tr>

          @if (inventoryService.movements().length === 0) {
            <tr class="mat-row">
              <td class="mat-cell text-center py-12 text-gray-400 font-medium" [attr.colspan]="displayedColumns.length">
                <div class="flex flex-col items-center gap-3">
                  <mat-icon class="!text-4xl !w-auto !h-auto text-gray-200">inventory_2</mat-icon>
                  <span>No se encontraron movimientos</span>
                </div>
              </td>
            </tr>
          }
        </table>
      </div>

      <!-- Paginator -->
      <mat-paginator
        [length]="totalItems()"
        [pageSize]="pageSize()"
        [pageIndex]="pageIndex() - 1"
        [pageSizeOptions]="[5, 10, 25, 50]"
        (page)="onPageChange($event)"
        class="!border-t !border-gray-50"
        showFirstLastButtons
      ></mat-paginator>
    </div>
  `,
  styles: [`
    :host { display: block; }
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
export class MovementsTableMolecule implements OnInit, OnDestroy {
  inventoryService = inject(InventoryService);
  displayedColumns: string[] = ['id', 'product', 'type', 'quantity', 'origin', 'destination', 'operator', 'date'];

  filterType = signal('');

  filterTypeOptions: SelectOption[] = [
    { value: '', label: 'Todos' },
    { value: 'In', label: 'Entrada' },
    { value: 'Out', label: 'Salida' },
  ];
  filterUser = signal('');
  pageSize = signal(10);
  pageIndex = signal(1);
  totalItems = signal(0);
  sortBy = signal('date');
  sortOrder = signal<'ASC' | 'DESC'>('DESC');

  private userInput$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.userInput$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.applyFilters();
    });

    this.loadPage();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onUserInput(value: string) {
    this.filterUser.set(value);
    this.userInput$.next(value);
  }

  clearUserFilter() {
    this.filterUser.set('');
    this.userInput$.next('');
  }

  loadPage() {
    this.inventoryService.loadMovements({
      page: this.pageIndex(),
      limit: this.pageSize(),
      sortBy: this.sortBy(),
      order: this.sortOrder(),
      type: this.filterType() || undefined,
    }).subscribe({
      next: (res) => {
        this.totalItems.set(res.meta.total);
      },
    });
  }

  applyFilters() {
    this.pageIndex.set(1);
    this.loadPage();
  }

  onPageChange(event: PageEvent) {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex + 1);
    this.loadPage();
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'In': return 'south_west';
      case 'Out': return 'north_east';
      default: return 'help';
    }
  }

  getTypeBg(type: string): string {
    switch (type) {
      case 'In': return 'bg-green-50';
      case 'Out': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'In': return '!text-green-600';
      case 'Out': return '!text-red-600';
      default: return '!text-gray-600';
    }
  }
}
