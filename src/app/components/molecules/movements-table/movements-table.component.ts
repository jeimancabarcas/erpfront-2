import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TextInputComponent } from '../../../components/atoms/text-input/text-input.component';
import { SelectAtom, SelectOption } from '../../../components/atoms/select/select.component';
import { ButtonAtom } from '../../../components/atoms/button/button.component';
import { TableComponent, TableColumn } from '../../../components/atoms/table/table.component';
import { TableCellDirective } from '../../../components/atoms/table/table-cell.directive';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { InventoryService } from '../../../services/inventory.service';

@Component({
  selector: 'app-movements-table',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatIconModule,
    TextInputComponent,
    SelectAtom,
    ButtonAtom,
    TableComponent,
    TableCellDirective,
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
              <button (click)="clearUserFilter()" class="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors !bg-white !shadow-none" type="button">
                <mat-icon class="!text-[18px] !w-auto !h-auto text-gray-500 dark:text-gray-400">close</mat-icon>
              </button>
            }
          </div>
        </div>

        <span class="sm:ml-auto text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest whitespace-nowrap">
          {{ totalItems() }} registros
        </span>
      </div>

      <!-- Table -->
      <ui-table
        [columns]="tableColumns"
        [data]="inventoryService.movements()"
        [loading]="false"
        emptyMessage="No se encontraron movimientos"
        emptyIcon="sync_alt"
      >
        <ng-template uiTableCell="type" let-movement>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center" [class]="getTypeBg(movement.type)">
              <mat-icon class="!text-[18px] !w-auto !h-auto" [class]="getTypeColor(movement.type)">
                {{getTypeIcon(movement.type)}}
              </mat-icon>
            </div>
            <span class="text-sm font-medium">{{movement.type === 'In' ? 'Entrada' : 'Salida'}}</span>
          </div>
        </ng-template>

        <ng-template uiTableCell="date" let-movement>
          <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{{movement.date | date:'dd/MM/yyyy HH:mm:ss'}}</span>
        </ng-template>

        <ng-template uiTableCell="quantity" let-movement>
          <span class="font-bold text-sm dark:text-gray-100">{{movement.quantity}}</span>
        </ng-template>
      </ui-table>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-6 py-4 border-t border-gray-50 dark:border-gray-800">
        <div class="flex items-center gap-2">
          <ui-button
            variant="ghost"
            size="sm"
            [disabled]="pageIndex() <= 1"
            (clicked)="goToPage(pageIndex() - 1)"
          >
            Anterior
          </ui-button>
          <span class="text-xs font-bold text-gray-400 dark:text-gray-500">
            Página {{ pageIndex() }} de {{ totalPages() }}
          </span>
          <ui-button
            variant="ghost"
            size="sm"
            [disabled]="pageIndex() >= totalPages()"
            (clicked)="goToPage(pageIndex() + 1)"
          >
            Siguiente
          </ui-button>
        </div>
        <select
          [value]="pageSize()"
          (change)="onPageSizeChange($event)"
          class="text-xs font-bold text-gray-500 dark:text-gray-400 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 focus:outline-none"
        >
          <option value="5">5 / pág</option>
          <option value="10">10 / pág</option>
          <option value="25">25 / pág</option>
          <option value="50">50 / pág</option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class MovementsTableMolecule implements OnInit, OnDestroy {
  inventoryService = inject(InventoryService);

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

  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));

  protected tableColumns: TableColumn[] = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'product', header: 'Producto' },
    { key: 'type', header: 'Tipo', align: 'center', width: '120px' },
    { key: 'quantity', header: 'Cantidad', align: 'right', width: '100px' },
    { key: 'origin', header: 'Origen' },
    { key: 'destination', header: 'Destino' },
    { key: 'operator', header: 'Usuario' },
    { key: 'date', header: 'Fecha', align: 'right', width: '160px' },
  ];

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

  goToPage(page: number) {
    this.pageIndex.set(page);
    this.loadPage();
  }

  onPageSizeChange(event: Event) {
    const size = parseInt((event.target as HTMLSelectElement).value);
    this.pageSize.set(size);
    this.pageIndex.set(1);
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
      case 'In': return 'bg-green-50 dark:bg-green-900/20';
      case 'Out': return 'bg-red-50 dark:bg-red-900/20';
      default: return 'bg-gray-50 dark:bg-gray-800';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'In': return '!text-green-600 dark:!text-green-400';
      case 'Out': return '!text-red-600 dark:!text-red-400';
      default: return '!text-gray-600 dark:!text-gray-400';
    }
  }
}
