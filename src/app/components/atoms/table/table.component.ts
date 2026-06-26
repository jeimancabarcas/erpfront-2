import { Component, input, output, contentChildren, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableCellDirective } from './table-cell.directive';

export interface TableColumn {
  /** Data property key */
  key: string;
  /** Column header text */
  header: string;
  /** Text alignment (default: left) */
  align?: 'left' | 'center' | 'right';
  /** CSS width (e.g. '120px', '10%') */
  width?: string;
  /** Show sort indicator and emit sortChange on header click */
  sortable?: boolean;
}

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [CommonModule, TableCellDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ui-table__wrapper">
      <table class="ui-table">
        <!-- Header -->
        <thead>
          <tr class="ui-table__head-row">
            @for (col of columns(); track col.key) {
              <th
                class="ui-table__head-cell"
                [class.ui-table__head-cell--sortable]="col.sortable"
                [class.ui-table__head-cell--left]="col.align === 'left' || !col.align"
                [class.ui-table__head-cell--center]="col.align === 'center'"
                [class.ui-table__head-cell--right]="col.align === 'right'"
                [style.width]="col.width ?? null"
                (click)="col.sortable ? onSort(col) : null"
              >
                {{ col.header }}
                @if (col.sortable) {
                  <span class="material-icons ui-table__sort-icon">unfold_more</span>
                }
              </th>
            }
          </tr>
        </thead>

        <!-- Body -->
        <tbody>
          @if (loading()) {
            <!-- Skeleton rows -->
            @for (s of skeletonRows; track $index) {
              <tr class="ui-table__row">
                @for (col of columns(); track col.key) {
                  <td class="ui-table__cell">
                    <div class="ui-table__skeleton"></div>
                  </td>
                }
              </tr>
            }
          } @else if (!data().length) {
            <!-- Empty state -->
            <tr>
              <td [attr.colspan]="columns().length" class="ui-table__empty">
                <div class="ui-table__empty-content">
                  @if (emptyIcon()) {
                    <span class="material-icons ui-table__empty-icon">{{ emptyIcon() }}</span>
                  }
                  <p class="ui-table__empty-text">{{ emptyMessage() }}</p>
                  <ng-content select="[empty]" />
                </div>
              </td>
            </tr>
          } @else {
            <!-- Data rows -->
            @for (row of data(); track row; let i = $index) {
              <tr
                class="ui-table__row"
                [class.ui-table__row--clickable]="clickable()"
                (click)="onRowClick(row)"
                (keydown.enter)="onRowClick(row)"
              >
                @for (col of columns(); track col.key) {
                  <td
                    class="ui-table__cell"
                    [class.ui-table__cell--left]="col.align === 'left' || !col.align"
                    [class.ui-table__cell--center]="col.align === 'center'"
                    [class.ui-table__cell--right]="col.align === 'right'"
                  >
                    @let cellTemplate = getTemplate(col.key);
                    @if (cellTemplate) {
                      <ng-container
                        *ngTemplateOutlet="cellTemplate; context: { $implicit: row, index: i }"
                      />
                    } @else {
                      {{ row[col.key] }}
                    }
                  </td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
  styleUrl: './table.component.scss',
})
export class TableComponent {
  // ── Inputs ──
  readonly columns = input.required<TableColumn[]>();
  readonly data = input.required<any[]>();
  readonly loading = input(false);
  readonly emptyMessage = input('No se encontraron registros');
  readonly emptyIcon = input('inventory_2');
  readonly clickable = input(false);

  // ── Outputs ──
  readonly sortChange = output<{ column: string }>();
  readonly rowClick = output<any>();

  // ── Cell templates ──
  private readonly cellDirectives = contentChildren(TableCellDirective);

  /** Skeleton rows shown during loading */
  protected readonly skeletonRows = Array.from({ length: 5 });

  /** Find the custom template for a column, if any */
  protected getTemplate(columnKey: string) {
    const directive = this.cellDirectives().find((d) => d.column === columnKey);
    return directive?.template ?? null;
  }

  protected onSort(col: TableColumn): void {
    this.sortChange.emit({ column: col.key });
  }

  protected onRowClick(row: any): void {
    this.rowClick.emit(row);
  }
}
