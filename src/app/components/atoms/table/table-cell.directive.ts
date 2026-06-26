import { Directive, Input, TemplateRef } from '@angular/core';

/**
 * Marks an <ng-template> as the custom cell renderer for a specific table column.
 *
 * Usage:
 *   <ng-template uiTableCell="status" let-item>
 *     <app-status-tag [label]="item.status" />
 *   </ng-template>
 */
@Directive({
  selector: '[uiTableCell]',
  standalone: true,
})
export class TableCellDirective {
  @Input('uiTableCell') column: string = '';

  constructor(public readonly template: TemplateRef<any>) {}
}
