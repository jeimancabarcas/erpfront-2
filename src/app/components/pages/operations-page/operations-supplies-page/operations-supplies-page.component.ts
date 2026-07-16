import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { BreadcrumbMolecule } from '../../../../components/molecules/breadcrumb/breadcrumb.component';
import { SupplyService } from '../../../../services/supply.service';
import { Supply } from '../../../../models/supply.model';
import { SupplyFormMolecule } from '../../../../components/molecules/supply-form/supply-form.component';
import { ConfirmDeleteDialogOrganism, ConfirmDeleteData } from '../../../../components/organisms/confirm-delete-dialog/confirm-delete-dialog.component';
import { QueryParams } from '../../../../models/pagination.model';
import { ButtonAtom } from '../../../../components/atoms/button/button.component';
import { TextInputComponent } from '../../../../components/atoms/text-input/text-input.component';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS } from '../../../../shared/constants/dialog.config';

@Component({
  selector: 'app-operations-supplies-page',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbMolecule,
    ButtonAtom,
    TextInputComponent,
    CurrencyPipe
  ],
  template: `
    <app-breadcrumb 
      [items]="[
        { label: 'Operaciones', link: '/operaciones/insumos' },
        { label: 'Insumos' }
      ]" 
    />

    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Insumos</h1>
        <p class="text-gray-500 dark:text-gray-400 font-medium">Gestiona los insumos utilizados en los servicios.</p>
      </div>
      <ui-button 
        variant="primary"
        (clicked)="openSupplyDialog()"
      >
        <span class="material-icons mr-2">add</span>
        Nuevo Insumo
      </ui-button>
    </header>

    <!-- Barra de Filtros -->
    <div class="bg-white dark:bg-gray-900 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ui-text-input icon="search" placeholder="Buscar por nombre..." [value]="nameFilter()" (valueChange)="nameFilter.set($event); debouncedFilter()" />
      </div>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-100 dark:border-gray-800">
            <th class="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-left">Nombre</th>
            <th class="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-left">Descripción</th>
            <th class="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody>
          @for (supply of supplies(); track supply.id) {
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800">
              <td class="px-6 py-5">
                <div class="font-bold text-gray-900 dark:text-gray-100">{{ supply.nombre }}</div>
              </td>
              <td class="px-6 py-5">
                <div class="text-sm text-gray-600 dark:text-gray-400">{{ supply.descripcion || '—' }}</div>
              </td>
              <td class="px-6 py-5 text-right">
                <ui-button variant="icon" (clicked)="openSupplyDialog(supply)" ariaLabel="Editar insumo">
                  <span class="material-icons">edit</span>
                </ui-button>
                <ui-button variant="icon" (clicked)="confirmDelete(supply)" ariaLabel="Eliminar insumo">
                  <span class="material-icons">delete</span>
                </ui-button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="3" class="p-12 text-center">
                <div class="flex flex-col items-center gap-4">
                  <span class="material-icons text-5xl text-gray-200 dark:text-gray-600">inventory_2</span>
                  <h3 class="text-lg font-bold text-gray-400 dark:text-gray-500">No se encontraron insumos</h3>
                  <p class="text-sm text-gray-300 dark:text-gray-600 max-w-xs">Aún no has registrado insumos o los filtros aplicados no coinciden.</p>
                  <ui-button variant="primary" (clicked)="openSupplyDialog()">
                    <span class="material-icons mr-2">add</span>
                    Registrar Primer Insumo
                  </ui-button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>

      <div class="flex items-center justify-between px-6 py-4 border-t border-gray-50 dark:border-gray-800">
        <div class="flex items-center gap-2">
          <ui-button variant="ghost" size="sm" [disabled]="pageIndex() <= 1" (clicked)="onPageChange({pageIndex: pageIndex() - 2, pageSize: pageSize(), length: meta()?.total || 0})">
            Anterior
          </ui-button>
          <span class="text-xs font-bold text-gray-400 dark:text-gray-500">
            Página {{ pageIndex() }} de {{ totalPages() }}
          </span>
          <ui-button variant="ghost" size="sm" [disabled]="pageIndex() >= totalPages()" (clicked)="onPageChange({pageIndex: pageIndex(), pageSize: pageSize(), length: meta()?.total || 0})">
            Siguiente
          </ui-button>
        </div>
        <select (change)="onPageSizeChange($event)" class="text-xs font-bold text-gray-500 dark:text-gray-400 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 focus:outline-none">
          <option value="5">5 / pág</option>
          <option value="10" selected>10 / pág</option>
          <option value="25">25 / pág</option>
          <option value="100">100 / pág</option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class OperationsSuppliesPageComponent implements OnInit {
  private dialog = inject(MatDialog);
  private supplyService = inject(SupplyService);

  // Señales de datos
  supplies = this.supplyService.supplies;
  meta = this.supplyService.meta;

  // Filtros
  nameFilter = signal('');

  // Paginación y Orden
  pageSize = signal(10);
  pageIndex = signal(1);

  totalPages = computed(() => Math.max(1, Math.ceil((this.meta()?.total || 0) / this.pageSize())));

  private filterTimeout: ReturnType<typeof setTimeout> | null = null;

  private pendingDeleteSupplyId: string | null = null;

  ngOnInit() {
    this.loadData();
  }

  protected debouncedFilter() {
    if (this.filterTimeout) clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => {
      this.pageIndex.set(1);
      this.loadData();
    }, 400);
  }

  loadData() {
    const params: QueryParams = {
      page: this.pageIndex(),
      limit: this.pageSize(),
      name: this.nameFilter() || ''
    };
    this.supplyService.loadSupplies(params).subscribe();
  }

  onPageChange(event: any) {
    if (event.pageSize) this.pageSize.set(event.pageSize);
    if (event.pageIndex !== undefined) this.pageIndex.set(event.pageIndex + 1);
    this.loadData();
  }

  onPageSizeChange(event: Event) {
    const size = (event.target as HTMLSelectElement).value;
    this.pageSize.set(parseInt(size));
    this.pageIndex.set(1);
    this.loadData();
  }

  openSupplyDialog(supply?: Supply) {
    const ref = this.dialog.open(SupplyFormMolecule, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.sm,
      panelClass: DIALOG_PANEL_CLASS,
      data: { supply },
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }

  confirmDelete(supply: Supply) {
    this.pendingDeleteSupplyId = supply.id;
    const ref = this.dialog.open(ConfirmDeleteDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.sm,
      panelClass: DIALOG_PANEL_CLASS,
      data: {
        title: '¿Eliminar insumo?',
        message: 'Estás a punto de eliminar el insumo',
        itemName: supply.nombre,
        confirmText: 'Sí, eliminar definitivamente'
      } as ConfirmDeleteData,
    });
    ref.afterClosed().subscribe((result) => {
      const id = this.pendingDeleteSupplyId;
      this.pendingDeleteSupplyId = null;
      if (result && id) {
        this.supplyService.deleteSupply(id).subscribe(() => this.loadData());
      }
    });
  }
}
