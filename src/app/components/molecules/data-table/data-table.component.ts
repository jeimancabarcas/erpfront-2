import {
  Component,
  input,
  output,
  signal,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonAtom } from '../../atoms/button/button.component';
import { SkeletonAtom } from '../../atoms/skeleton/skeleton.component';

export interface ColumnDef {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

@Component({
  selector: 'ui-data-table',
  standalone: true,
  imports: [CommonModule, ButtonAtom, SkeletonAtom],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './data-table.component.scss',
  template: `
    <div class="table-wrapper">
      @if (loading()) {
        <table class="data-table" role="table" aria-busy="true">
          <thead>
            <tr>
              @for (col of columns(); track col.key) {
                <th
                  scope="col"
                  role="columnheader"
                  [style.width]="col.width"
                >
                  {{ col.label }}
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of [].constructor(5); track $index) {
              <tr>
                @for (col of columns(); track col.key) {
                  <td><ui-skeleton variant="table-row" /></td>
                }
              </tr>
            }
          </tbody>
        </table>
      } @else if (data().length === 0) {
        <div class="data-table__empty">
          <p>{{ emptyMessage() }}</p>
        </div>
      } @else {
        <table class="data-table" role="table">
          <thead>
            <tr>
              @if (selectable()) {
                <th scope="col" class="data-table__checkbox-col">
                  <input
                    type="checkbox"
                    [checked]="allSelected()"
                    (change)="toggleSelectAll($event)"
                    aria-label="Seleccionar todos"
                  />
                </th>
              }
              @for (col of columns(); track col.key) {
                <th
                  scope="col"
                  role="columnheader"
                  [style.width]="col.width"
                  [class.data-table__sortable]="col.sortable"
                  [attr.aria-sort]="getAriaSort(col.key)"
                  (click)="col.sortable && onSortChange(col.key)"
                >
                  {{ col.label }}
                  @if (col.sortable) {
                    <span class="data-table__sort-icon">
                      @if (sortBy() === col.key) {
                        {{ sortOrder() === 'ASC' ? '\u25B2' : '\u25BC' }}
                      } @else {
                        \u25B2\u25BC
                      }
                    </span>
                  }
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of currentPageData(); track $index; let rowIdx = $index) {
              <tr
                class="data-table__row"
                (click)="onRowClick(row)"
                [class.data-table__row--selected]="isSelected(rowIdx)"
              >
                @if (selectable()) {
                  <td class="data-table__checkbox-col">
                    <input
                      type="checkbox"
                      [checked]="isSelected(rowIdx)"
                      (change)="toggleRowSelection(rowIdx)"
                      [attr.aria-label]="'Seleccionar fila ' + (rowIdx + 1)"
                    />
                  </td>
                }
                @for (col of columns(); track col.key) {
                  <td>{{ row[col.key] }}</td>
                }
              </tr>
            }
          </tbody>
        </table>

        <div class="data-table__paginator">
          <ui-button
            variant="ghost"
            size="sm"
            [disabled]="displayPage() <= 1"
            (clicked)="goToPage(displayPage() - 2)"
          >
            Anterior
          </ui-button>

          <span class="data-table__page-info">
            Página {{ displayPage() }} de {{ totalPages() }}
          </span>

          <ui-button
            variant="ghost"
            size="sm"
            [disabled]="displayPage() >= totalPages()"
            (clicked)="goToPage(displayPage())"
          >
            Siguiente
          </ui-button>
        </div>
      }
    </div>
  `
})
export class DataTableMolecule {
  columns = input<ColumnDef[]>([]);
  data = input<any[]>([]);
  loading = input(false);
  sortBy = input<string>('');
  sortOrder = input<'ASC' | 'DESC'>('ASC');
  selectable = input(false);
  emptyMessage = input<string>('No se encontraron datos.');
  // External (server-side) pagination
  total = input<number | null>(null);
  page = input<number>(0);

  sortChange = output<{ column: string; order: 'ASC' | 'DESC' }>();
  rowClick = output<any>();
  selectionChange = output<any[]>();
  pageChange = output<number>();
  pageSizeChange = output<number>();

  currentPage = signal(0);
  pageSize = signal(10);

  selectedRows = signal<Set<number>>(new Set());

  /** Whether pagination is controlled externally (server-side) */
  private isExternalPagination = computed(() => this.total() !== null);

  totalPages = computed(() => {
    if (this.isExternalPagination()) {
      return Math.max(1, Math.ceil((this.total() ?? 0) / this.pageSize()));
    }
    return Math.max(1, Math.ceil(this.data().length / this.pageSize()));
  });

  currentPageData = computed(() => {
    if (this.isExternalPagination()) return this.data();
    const start = this.currentPage() * this.pageSize();
    return this.data().slice(start, start + this.pageSize());
  });

  /** Current display page (1-indexed for display in external mode) */
  displayPage = computed(() => {
    if (this.isExternalPagination()) return this.page() + 1;
    return this.currentPage() + 1;
  });

  allSelected = computed(() => {
    const count = this.currentPageData().length;
    return count > 0 && this.selectedRows().size === count;
  });

  getAriaSort(columnKey: string): string | null {
    if (this.sortBy() !== columnKey) return null;
    return this.sortOrder() === 'ASC' ? 'ascending' : 'descending';
  }

  onSortChange(columnKey: string): void {
    const isSameColumn = this.sortBy() === columnKey;
    const newOrder = isSameColumn
      ? (this.sortOrder() === 'ASC' ? 'DESC' : 'ASC')
      : 'ASC';
    this.sortChange.emit({ column: columnKey, order: newOrder });
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    if (this.isExternalPagination()) {
      this.pageChange.emit(page);
    } else {
      this.currentPage.set(page);
    }
  }

  isSelected(rowIndex: number): boolean {
    const actualIndex = this.currentPage() * this.pageSize() + rowIndex;
    return this.selectedRows().has(actualIndex);
  }

  toggleRowSelection(rowIndex: number): void {
    const actualIndex = this.currentPage() * this.pageSize() + rowIndex;
    this.selectedRows.update(prev => {
      const next = new Set(prev);
      if (next.has(actualIndex)) {
        next.delete(actualIndex);
      } else {
        next.add(actualIndex);
      }
      return next;
    });
    this.emitSelection();
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const start = this.currentPage() * this.pageSize();
    const end = start + this.currentPageData().length;

    this.selectedRows.update(prev => {
      const next = new Set(prev);
      for (let i = start; i < end; i++) {
        if (checked) {
          next.add(i);
        } else {
          next.delete(i);
        }
      }
      return next;
    });
    this.emitSelection();
  }

  private emitSelection(): void {
    const selected = Array.from(this.selectedRows()).map(i => this.data()[i]);
    this.selectionChange.emit(selected);
  }
}
