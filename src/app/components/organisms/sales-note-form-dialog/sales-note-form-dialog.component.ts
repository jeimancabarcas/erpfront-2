import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormArray, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';
import { Invoice } from '../../../models/invoice.model';
import { ButtonAtom } from '../../atoms/button/button.component';
import { SalesNoteService } from '../../../services/sales-note.service';
import { CreateSalesNoteDto } from '../../../models/sales-note.model';

export interface SalesNoteDialogData {
  invoice: Invoice;
  returnedQuantities?: Record<string, number>; // productId → already returned qty
  adjustedPrices?: Record<string, number>; // productId → current price after previous NC adjustments
}

@Component({
  selector: 'app-sales-note-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule,
    MatSlideToggleModule,
    CurrencyPipe,
    ButtonAtom,
    TextInputComponent,
    SelectAtom,
    TextareaComponent
  ],
  template: `
    <div class="relative overflow-hidden rounded-[32px] bg-white flex flex-col max-h-[95vh] w-full max-w-[850px] shadow-2xl">
      <!-- Background Glow Decoration -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
      
      <div class="p-8 relative z-10 overflow-y-auto custom-scrollbar">
        <header class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <mat-icon class="!text-[24px] !w-6 !h-6">assignment_late</mat-icon>
            </div>
             <div>
              <h2 class="text-xl font-black text-gray-900 tracking-tight !m-0 leading-tight">{{ dialogTitle() }}</h2>
              <p class="text-gray-400 text-[10px] font-semibold uppercase tracking-widest mt-1">Factura {{ data.invoice.invoiceNumber }}</p>
            </div>
          </div>
          <ui-button variant="icon" (clicked)="dialogRef.close()" ariaLabel="Cerrar diálogo" class="!text-gray-400">
            <span class="material-icons">close</span>
          </ui-button>
        </header>

        <form [formGroup]="noteForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ui-select label="Tipo de Nota" [options]="noteTypeOptions" [formControl]="noteForm.controls.noteType" />

            <ui-select label="Concepto de Corrección" [options]="correctionOptions()" [formControl]="noteForm.controls.correctionConceptCode" />
          </div>

          <!-- Electronic toggle -->
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                <mat-icon>rocket_launch</mat-icon>
              </div>
              <div>
                <p class="text-xs font-black text-gray-900">Nota Electrónica (DIAN)</p>
                <p class="text-[10px] text-gray-400 font-bold uppercase">
                  {{ isElectronic() ? 'Se emitirá ante la DIAN' : 'Solo local — sin validez fiscal electrónica' }}
                </p>
              </div>
            </div>
            <mat-slide-toggle [checked]="isElectronic()" (change)="isElectronic.set($event.checked)"
              [disabled]="!data.invoice.isElectronic" color="primary"></mat-slide-toggle>
          </div>

          @if (!data.invoice.isElectronic) {
            <div class="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
              <span class="material-icons text-blue-500 mt-0.5 text-[18px]">info</span>
              <p class="text-xs text-blue-700 leading-relaxed">
                La factura de referencia es <strong>manual</strong>. Las notas electrónicas solo pueden emitirse para facturas electrónicas.
                El toggle está deshabilitado.
              </p>
            </div>
          }

          <!-- Observation -->
          <ui-textarea formControlName="observation" label="Observación / Justificación" placeholder="Indique la justificación de este ajuste..." [rows]="3" />

          <!-- Scenario Info Message -->
          @if (scenarioInfo(); as info) {
            <div class="flex items-start gap-3 rounded-xl px-4 py-3" [class.bg-amber-50]="info.type === 'warning'" [class.border]="info.type === 'warning'" [class.border-amber-200]="info.type === 'warning'" [class.bg-blue-50]="info.type === 'info'" [class.border]="info.type === 'info'" [class.border-blue-200]="info.type === 'info'" [class.bg-green-50]="info.type === 'success'" [class.border]="info.type === 'success'" [class.border-green-200]="info.type === 'success'">
              <span class="material-icons mt-0.5 text-[18px]" [class.text-amber-500]="info.type === 'warning'" [class.text-blue-500]="info.type === 'info'" [class.text-green-500]="info.type === 'success'">{{ info.icon }}</span>
              <p class="text-xs leading-relaxed" [class.text-amber-700]="info.type === 'warning'" [class.text-blue-700]="info.type === 'info'" [class.text-green-700]="info.type === 'success'">{{ info.message }}</p>
            </div>
          }

          <!-- Items Selection Table (Scenarios A, B, C, F) -->
          @if (showItemsTable()) {
            <div class="space-y-3 animate-in fade-in duration-300">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Selección de Productos</label>

              @if (skippedProductsNote(); as note) {
                <div class="text-[10px] text-gray-400 ml-1">{{ note }}</div>
              }

              <div class="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <th class="py-3 px-4 text-center w-12">Activo</th>
                      <th class="py-3 px-4">Producto</th>
                      <th class="py-3 px-4 text-center w-32">Stock Disponible</th>
                      @if (scenario() === 'A') {
                        <th class="py-3 px-4 text-center w-28">Cant. Devolver</th>
                      }
                      @if (scenario() === 'B' || scenario() === 'C') {
                        <th class="py-3 px-4 text-center w-28">Nuevo Precio</th>
                      }
                      @if (scenario() === 'F') {
                        <th class="py-3 px-4 text-center w-28">Precio Corregido</th>
                      }
                      <th class="py-3 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (itemForm of itemsFormArray.controls; track $index) {
                      <tr class="border-b border-gray-50 last:border-0" [formGroup]="asFormGroup(itemForm)">
                        <td class="py-3 px-4 text-center">
                          <mat-checkbox formControlName="selected" color="primary"></mat-checkbox>
                        </td>
                        <td class="py-3 px-4">
                          <div class="flex flex-col">
                            <span class="text-xs font-bold text-gray-900 leading-tight">{{ itemForm.value.name }}</span>
                            <span class="text-[9px] text-gray-400">SKU: {{ itemForm.value.codeReference }}</span>
                          </div>
                        </td>
                        <td class="py-3 px-4 text-center text-xs font-medium text-gray-500">
                          <div>{{ itemForm.value.originalQty }} de {{ getOriginalQty(itemForm) }}</div>
                          @if (isPriceAdjusted(itemForm)) {
                            <div class="text-[9px] text-indigo-500 font-bold">P/U ajustado: {{ itemForm.value.unitPrice | currency }}</div>
                          } @else {
                            <div class="text-[9px] text-gray-400">{{ itemForm.value.unitPrice | currency }} c/u</div>
                          }
                        </td>
                        @if (scenario() === 'A') {
                          <td class="py-1 px-1 text-center">
                            <ui-text-input type="number" formControlName="quantity" />
                          </td>
                        }
                        @if (scenario() === 'B' || scenario() === 'C' || scenario() === 'F') {
                          <td class="py-1 px-1 text-center">
                            <ui-text-input type="number" formControlName="price" />
                            @if (scenario() === 'B' || scenario() === 'C') {
                              <div class="text-[9px] mt-0.5" [class.text-green-600]="Number(itemForm.value.price) > 0 && Number(itemForm.value.price) < itemForm.value.unitPrice" [class.text-red-500]="Number(itemForm.value.price) >= itemForm.value.unitPrice">
                                {{ Number(itemForm.value.price) > 0 ? (itemForm.value.unitPrice - Number(itemForm.value.price) | currency) + ' de descuento' : '' }}
                              </div>
                            }
                            @if (scenario() === 'F') {
                              <div class="text-[9px] mt-0.5" [class.text-green-600]="Number(itemForm.value.price) > itemForm.value.unitPrice" [class.text-red-500]="Number(itemForm.value.price) > 0 && Number(itemForm.value.price) <= itemForm.value.unitPrice">
                                {{ Number(itemForm.value.price) > itemForm.value.unitPrice ? '+' + (Number(itemForm.value.price) - itemForm.value.unitPrice | currency) + ' adicional' : '' }}
                              </div>
                            }
                          </td>
                        }
                        <td class="py-3 px-4 text-right font-black text-xs text-gray-900">
                          {{ calculateItemSubtotal(itemForm) | currency }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- Scenario D: Total Annulment - just confirmation -->
          @if (scenario() === 'D') {
            <div class="p-6 bg-red-50/50 rounded-[24px] border border-red-100/50 space-y-3 animate-in fade-in duration-300">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm">
                  <mat-icon>warning_amber</mat-icon>
                </div>
                <div>
                  <p class="text-xs font-black text-gray-900">Anulación Total de Factura</p>
                  <p class="text-[10px] text-gray-500 font-medium">Se revertirá el 100% de los valores, inventario e impuestos. La factura quedará <strong>ANULADA</strong>.</p>
                </div>
              </div>
              <div class="flex justify-between items-center pt-2">
                <span class="text-xs font-bold text-gray-500">Total a Reversar</span>
                <span class="text-xl font-black text-red-600">{{ Number(data.invoice.totalAmount) | currency }}</span>
              </div>
            </div>
          }

          <!-- Scenario E: Financial Interest - simple amount + description -->
          @if (scenario() === 'E') {
            <div class="p-6 bg-blue-50/50 rounded-[24px] border border-blue-100/50 space-y-4 animate-in fade-in duration-300">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
                  <mat-icon>account_balance</mat-icon>
                </div>
                <div>
                  <p class="text-xs font-black text-gray-900">Intereses Financieros</p>
                  <p class="text-[10px] text-gray-500 font-medium">Cargo por mora o interés financiero — no afecta inventario</p>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ui-text-input label="Monto del Interés" type="number" icon="attach_money" placeholder="0.00"
                  [formControl]="noteForm.controls.financialAmount" />
                <ui-text-input label="Descripción del Concepto" icon="description" placeholder="Ej: Interés por mora en pago"
                  [formControl]="noteForm.controls.financialDescription" />
              </div>
            </div>
          }

          <!-- Dynamic Totals Summary -->
          <div class="p-6 bg-indigo-50/50 rounded-[24px] border border-indigo-100/50 flex justify-between items-center group transition-all hover:bg-indigo-50 animate-in zoom-in duration-300">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                <mat-icon>calculate</mat-icon>
              </div>
              <div>
                <p class="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Total de la Nota</p>
                <p class="text-xs text-gray-500 font-medium italic">Valor neto a validar electrónicamente</p>
              </div>
            </div>
            <span class="text-2xl font-black text-indigo-600 tabular-nums">
              {{ noteTotalAmount() | currency }}
            </span>
          </div>

          <!-- Error message -->
          @if (errorMsg()) {
            <div class="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-medium">
              <mat-icon class="text-red-500">error</mat-icon>
              <div class="flex-1">{{ errorMsg() }}</div>
              <button mat-icon-button (click)="errorMsg.set(null)" class="!text-red-400 scale-75" type="button">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          }

          <!-- Dialog Actions -->
          <div class="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button mat-button type="button" [disabled]="loading()" class="!rounded-full !px-8 !h-12 !font-bold text-gray-500" (click)="dialogRef.close()">
              Descartar
            </button>
            <button mat-flat-button color="primary" type="submit" 
              [disabled]="noteForm.invalid || loading() || noteTotalAmount() <= 0"
              class="!rounded-full !px-12 !h-12 !bg-indigo-600 !font-black shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center min-w-[180px]">
              @if (loading()) {
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              } @else {
                <mat-icon>send</mat-icon>
              }
              <span class="ml-2">{{ loading() ? 'Procesando DIAN...' : 'Emitir Nota DIAN' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 10px;
    }
  `]
})
export class SalesNoteFormDialogOrganism implements OnInit {
  private fb = inject(FormBuilder);
  private salesNoteService = inject(SalesNoteService);

  public dialogRef = inject(MatDialogRef<SalesNoteFormDialogOrganism>);
  public data: SalesNoteDialogData = inject(MAT_DIALOG_DATA);

  loading = signal(false);
  errorMsg = signal<string | null>(null);
  isElectronic = signal(this.data.invoice.isElectronic ?? false);
  Number = Number; // Expose Number for template

  // Current scenario derived from correctionConceptCode
  scenario = computed<'A' | 'B' | 'C' | 'D' | 'E' | 'F' | null>(() => {
    this.manualTrigger(); // Re-evaluate on form changes
    const type = this.noteForm.get('noteType')?.value;
    const code = this.noteForm.get('correctionConceptCode')?.value;
    if (!code) return null;

    if (type === 'credit') {
      if (code === '1' || code === '5') return 'A';  // Partial return / Others
      if (code === '2') return 'D';                    // Total annulment
      if (code === '3') return 'B';                    // Discount
      if (code === '4') return 'C';                    // Price correction
    } else {
      if (code === '1') return 'E';                    // Financial interest
      if (code === '2' || code === '3' || code === '4') return 'F'; // Undercharge / Others
    }
    return null;
  });

  // Whether to show the items table
  showItemsTable = computed(() => {
    const s = this.scenario();
    return s === 'A' || s === 'B' || s === 'C' || s === 'F';
  });

  // Scenario info message
  scenarioInfo = computed<{ message: string; icon: string; type: string } | null>(() => {
    const s = this.scenario();
    switch (s) {
      case 'A': return { icon: 'assignment_return', message: 'Devolución parcial: seleccione los productos y la cantidad a devolver. Se restaurará inventario y se recalcularán impuestos proporcionalmente.', type: 'info' };
      case 'B': return { icon: 'discount', message: 'Descuento comercial: indique el nuevo precio por producto (menor al original). No afecta inventario. Los impuestos se recalculan proporcionalmente.', type: 'warning' };
      case 'C': return { icon: 'price_change', message: 'Corrección de precio (sobrecargo): indique el precio corregido (menor al original). No afecta inventario.', type: 'warning' };
      case 'D': return { icon: 'warning', message: 'Anulación total: se revertirá el 100% de valores, inventario e impuestos. La factura quedará anulada.', type: 'warning' };
      case 'E': return { icon: 'account_balance', message: 'Intereses financieros: ingrese el monto del interés. No afecta inventario. Usa tasa de interés configurable.', type: 'info' };
      case 'F': return { icon: 'trending_up', message: 'Corrección por undercharge: indique el precio corregido (mayor al original). No afecta inventario. Los impuestos se recalculan sobre el diferencial.', type: 'warning' };
      default: return null;
    }
  });

  dialogTitle = computed(() => {
    const s = this.scenario();
    const type = this.noteForm.get('noteType')?.value;
    const prefix = type === 'credit' ? 'Nota Crédito' : 'Nota Débito';
    switch (s) {
      case 'A': return `${prefix} — Devolución Parcial`;
      case 'B': return `${prefix} — Descuento Comercial`;
      case 'C': return `${prefix} — Corrección de Precio`;
      case 'D': return `${prefix} — Anulación Total`;
      case 'E': return `${prefix} — Intereses Financieros`;
      case 'F': return `${prefix} — Corrección por Undercharge`;
      default: return `Emitir ${prefix}`;
    }
  });

  /** Returns the ORIGINAL invoice quantity for an item form (before any returns). */
  getOriginalQty(itemForm: any): number {
    const productId = itemForm.get('productId')?.value;
    if (!productId || !this.data.invoice?.items) return itemForm.get('originalQty')?.value || 0;
    const invoiceItem = this.data.invoice.items.find(i => i.productId === productId);
    return invoiceItem ? Number(invoiceItem.quantity) : itemForm.get('originalQty')?.value || 0;
  }

  /** Whether the price was adjusted by a previous NC (discount/correction). */
  isPriceAdjusted(itemForm: any): boolean {
    const productId = itemForm.get('productId')?.value;
    if (!productId || !this.data.invoice?.items) return false;
    const invoiceItem = this.data.invoice.items.find(i => i.productId === productId);
    if (!invoiceItem) return false;
    return Number(itemForm.get('unitPrice')?.value) !== Number(invoiceItem.unitPrice);
  }

  /** Shows a note when some products were fully returned and hidden. */
  skippedProductsNote = computed<string | null>(() => {
    if (!this.data.returnedQuantities || !this.data.invoice?.items) return null;
    const totalReturned = Object.keys(this.data.returnedQuantities).length;
    if (totalReturned === 0) return null;
    const skipped = this.data.invoice.items.filter(item => {
      const returned = this.data.returnedQuantities![item.productId] || 0;
      return Number(item.quantity) - returned <= 0;
    });
    if (skipped.length === 0) return null;
    return `${skipped.length} producto(s) completamente devuelto(s) — no se muestran.`;
  });

  noteForm = this.fb.group({
    noteType: ['credit', Validators.required],
    correctionConceptCode: ['2', Validators.required],
    observation: ['', Validators.required],
    financialAmount: [0],
    financialDescription: [''],
    items: this.fb.array([])
  });

  noteType = signal<'credit' | 'debit'>('credit');

  noteTypeOptions: SelectOption[] = [
    { value: 'credit', label: 'Nota de Crédito (Anular / Devolver)' },
    { value: 'debit', label: 'Nota de Débito (Cobro adicional)' },
  ];

  correctionOptions = computed<SelectOption[]>(() => {
    if (this.noteType() === 'credit') {
      return [
        { value: '1', label: '1 - Devolución parcial de los bienes' },
        { value: '2', label: '2 - Anulación total de factura' },
        { value: '3', label: '3 - Rebaja o descuento parcial' },
        { value: '4', label: '4 - Ajuste de precio' },
        { value: '5', label: '5 - Otros' },
      ];
    }
    return [
      { value: '1', label: '1 - Intereses' },
      { value: '2', label: '2 - Gastos por cobrar' },
      { value: '3', label: '3 - Cambio del valor' },
      { value: '4', label: '4 - Otros' },
    ];
  });

  get itemsFormArray(): FormArray {
    return this.noteForm.get('items') as FormArray;
  }

  ngOnInit() {
    this.setupItemsForm();

    this.noteForm.get('noteType')?.valueChanges.subscribe(val => {
      const type = val as 'credit' | 'debit';
      this.noteType.set(type);
      const conceptCode = type === 'credit' ? '2' : '1';
      this.noteForm.get('correctionConceptCode')?.setValue(conceptCode);
    });

    // Sync disabled states when scenario changes
    this.noteForm.get('correctionConceptCode')?.valueChanges.subscribe(() => {
      this.syncItemDisabledStates();
    });
  }

  setupItemsForm() {
    this.itemsFormArray.clear();
    if (this.data.invoice && this.data.invoice.items) {
      const returned = this.data.returnedQuantities || {};
      const adjusted = this.data.adjustedPrices || {};

      this.data.invoice.items.forEach(item => {
        const productId = item.productId;
        const alreadyReturned = productId ? Number(returned[productId] || 0) : 0;
        const originalQty = Number(item.quantity);
        const remainingQty = Math.max(0, originalQty - alreadyReturned);

        // Skip fully returned products
        if (remainingQty <= 0) return;

        // Use adjusted price if a previous NC changed it, otherwise use original
        const effectivePrice = productId && adjusted[productId] != null
          ? adjusted[productId]
          : Number(item.unitPrice);

        this.itemsFormArray.push(
          this.fb.group({
            selected: [true],
            codeReference: [item.product?.sku || item.productId],
            productId: [productId],
            name: [item.product?.name || 'Producto'],
            originalQty: [remainingQty],
            unitPrice: [effectivePrice],
            quantity: [remainingQty > 0 ? Math.min(remainingQty, item.quantity) : 0, [Validators.required, Validators.min(0.01)]],
            price: [effectivePrice, [Validators.required, Validators.min(0)]]
          })
        );
      });
    }
    this.syncItemDisabledStates();
  }

  /** Enable/disable quantity/price controls based on current scenario */
  private syncItemDisabledStates(): void {
    const s = this.scenario();
    this.itemsFormArray.controls.forEach(control => {
      const qtyCtrl = control.get('quantity');
      const priceCtrl = control.get('price');
      if (qtyCtrl) {
        if (s === 'A') qtyCtrl.enable({ emitEvent: false });
        else qtyCtrl.disable({ emitEvent: false });
      }
      if (priceCtrl) {
        if (s === 'B' || s === 'C' || s === 'F') priceCtrl.enable({ emitEvent: false });
        else priceCtrl.disable({ emitEvent: false });
      }
    });
  }

  asFormGroup(control: any): FormGroup {
    return control as FormGroup;
  }

  calculateItemSubtotal(itemForm: any): number {
    const isSelected = itemForm.get('selected')?.value;
    if (!isSelected) return 0;

    const s = this.scenario();
    if (s === 'A') {
      const qty = Number(itemForm.get('quantity')?.value || 0);
      return qty * Number(itemForm.get('unitPrice')?.value || 0);
    }
    if (s === 'B' || s === 'C') {
      const prc = Number(itemForm.get('price')?.value || 0);
      return (Number(itemForm.get('unitPrice')?.value || 0) - prc) * Number(itemForm.get('originalQty')?.value || 0);
    }
    if (s === 'F') {
      const prc = Number(itemForm.get('price')?.value || 0);
      return (prc - Number(itemForm.get('unitPrice')?.value || 0)) * Number(itemForm.get('originalQty')?.value || 0);
    }
    return 0;
  }

  noteTotalAmount = computed(() => {
    this.manualTrigger();
    const s = this.scenario();
    if (!s) return 0;

    // D: full invoice total
    if (s === 'D') return Number(this.data.invoice.totalAmount) || 0;

    // E: financial amount
    if (s === 'E') return Number(this.noteForm.get('financialAmount')?.value || 0);

    // A, B, C, F: sum of selected items
    let sum = 0;
    this.itemsFormArray.controls.forEach(control => {
      sum += this.calculateItemSubtotal(control);
    });
    return sum;
  });

  manualTrigger = signal(0);

  constructor() {
    this.noteForm.valueChanges.subscribe(() => {
      this.manualTrigger.update(n => n + 1);
    });
  }

  onSubmit() {
    const s = this.scenario();
    if (!s) return;
    if (s === 'D' && this.noteForm.get('correctionConceptCode')?.value !== '2') return;
    if (s !== 'D' && s !== 'E' && this.itemsFormArray.controls.every(c => !c.get('selected')?.value)) {
      this.errorMsg.set('Debe seleccionar al menos un ítem.');
      return;
    }

    // Validate quantity doesn't exceed original (Scenario A)
    if (s === 'A') {
      let invalid = false;
      this.itemsFormArray.controls.forEach(control => {
        if (control.get('selected')?.value) {
          const qty = Number(control.get('quantity')?.value || 0);
          const original = Number(control.get('originalQty')?.value || 0);
          if (qty > original) {
            invalid = true;
          }
        }
      });
      if (invalid) {
        this.errorMsg.set('La cantidad a devolver no puede exceder la cantidad original de la factura.');
        this.loading.set(false);
        return;
      }
    }

    // Validate price < original (Scenarios B, C)
    if (s === 'B' || s === 'C') {
      let invalid = false;
      this.itemsFormArray.controls.forEach(control => {
        if (control.get('selected')?.value) {
          const price = Number(control.get('price')?.value || 0);
          const original = Number(control.get('unitPrice')?.value || 0);
          if (price <= 0 || price >= original) {
            invalid = true;
          }
        }
      });
      if (invalid) {
        this.errorMsg.set('El nuevo precio debe ser menor al precio original y mayor a cero.');
        this.loading.set(false);
        return;
      }
    }

    // Validate price > original (Scenario F)
    if (s === 'F') {
      let invalid = false;
      this.itemsFormArray.controls.forEach(control => {
        if (control.get('selected')?.value) {
          const price = Number(control.get('price')?.value || 0);
          const original = Number(control.get('unitPrice')?.value || 0);
          if (price <= original) {
            invalid = true;
          }
        }
      });
      if (invalid) {
        this.errorMsg.set('El precio corregido debe ser mayor al precio original.');
        this.loading.set(false);
        return;
      }
    }

    this.loading.set(true);
    this.errorMsg.set(null);

    const formValue = this.noteForm.value;
    const type = formValue.noteType as 'credit' | 'debit';
    const concept = formValue.correctionConceptCode || '2';

    // Map scenario type for backend
    const scenarioTypeMap: Record<string, string> = {
      'A': 'partial_return',
      'B': 'discount',
      'C': 'price_correction',
      'D': 'total_annulment',
      'E': 'financial_interest',
      'F': 'undercharge',
    };

    const payloadItems: any[] = [];

    if (s === 'A' || s === 'B' || s === 'C' || s === 'F') {
      this.itemsFormArray.controls.forEach(control => {
        if (control.get('selected')?.value) {
          const item: any = {
            codeReference: control.get('codeReference')?.value,
            quantity: s === 'A' ? Number(control.get('quantity')?.value) : Number(control.get('originalQty')?.value),
            productId: control.get('productId')?.value,
          };
          // For discount, overcharge, undercharge: send the new price
          if (s === 'B' || s === 'C' || s === 'F') {
            item.price = Number(control.get('price')?.value);
          }
          payloadItems.push(item);
        }
      });
    }

    const payload: CreateSalesNoteDto = {
      correctionConceptCode: concept,
      observation: formValue.observation || '',
      isElectronic: this.isElectronic(),
      scenarioType: scenarioTypeMap[s] || undefined,
      items: s === 'E' ? undefined : payloadItems,
    };

    // For scenario E (financial interest), add a virtual item
    if (s === 'E') {
      payload.items = [{
        codeReference: 'FINANCIAL',
        quantity: 1,
        price: Number(formValue.financialAmount || 0),
        // No productId — virtual item
      }];
    }

    const action$ = type === 'credit'
      ? this.salesNoteService.createCreditNote(this.data.invoice.id, payload)
      : this.salesNoteService.createDebitNote(this.data.invoice.id, payload);

    action$.subscribe({
      next: (response) => {
        this.loading.set(false);
        this.dialogRef.close({ success: true, type, note: response });
      },
      error: (err) => {
        this.loading.set(false);
        const errMsg = err.error?.message || err.message || 'Error desconocido al emitir nota.';
        this.errorMsg.set(errMsg);
      }
    });
  }
}
