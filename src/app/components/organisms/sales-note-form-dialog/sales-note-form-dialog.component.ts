import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Invoice } from '../../../models/invoice.model';
import { ButtonAtom } from '../../atoms/button/button.component';
import { SalesNoteService } from '../../../services/sales-note.service';
import { CreateSalesNoteDto } from '../../../models/sales-note.model';

export interface SalesNoteDialogData {
  invoice: Invoice;
}

@Component({
  selector: 'app-sales-note-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule,
    MatSlideToggleModule,
    CurrencyPipe,
    ButtonAtom
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
              <h2 class="text-xl font-black text-gray-900 tracking-tight !m-0 leading-tight">Emitir Nota Electrónica</h2>
              <p class="text-gray-400 text-[10px] font-semibold uppercase tracking-widest mt-1">Factura {{ data.invoice.invoiceNumber }}</p>
            </div>
          </div>
          <ui-button variant="icon" (clicked)="dialogRef.close()" ariaLabel="Cerrar diálogo" class="!text-gray-400">
            <span class="material-icons">close</span>
          </ui-button>
        </header>

        @if (errorMsg()) {
          <div class="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-medium mb-6">
            <mat-icon class="text-red-500">error</mat-icon>
            <div class="flex-1">{{ errorMsg() }}</div>
            <button mat-icon-button (click)="errorMsg.set(null)" class="!text-red-400 scale-75">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        }

        <form [formGroup]="noteForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Note Type (Credit / Debit) -->
            <div class="space-y-2">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Tipo de Nota</label>
              <mat-form-field appearance="outline" class="w-full !m-0">
                <mat-select formControlName="noteType">
                  <mat-option value="credit">Nota de Crédito (Anular / Devolver)</mat-option>
                  <mat-option value="debit">Nota de Débito (Cobro adicional)</mat-option>
                </mat-select>
                <mat-icon matPrefix class="mr-2 text-gray-400">compare_arrows</mat-icon>
              </mat-form-field>
            </div>

            <!-- Concept Code Selection -->
            <div class="space-y-2">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Concepto de Corrección</label>
              <mat-form-field appearance="outline" class="w-full !m-0">
                <mat-select formControlName="correctionConceptCode">
                  @if (noteType() === 'credit') {
                    <mat-option value="1">1 - Hábiles de anulación de factura</mat-option>
                    <mat-option value="2">2 - Anulación total de factura</mat-option>
                    <mat-option value="3">3 - Rebaja o descuento parcial</mat-option>
                    <mat-option value="4">4 - Ajuste de precio</mat-option>
                    <mat-option value="5">5 - Otros</mat-option>
                  } @else {
                    <mat-option value="1">1 - Intereses</mat-option>
                    <mat-option value="2">2 - Gastos por cobrar</mat-option>
                    <mat-option value="3">3 - Cambio del valor</mat-option>
                    <mat-option value="4">4 - Otros</mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix class="mr-2 text-gray-400">category</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <!-- Adjust Mode Toggle -->
          <div class="p-4 bg-gray-50 rounded-2xl flex justify-between items-center border border-gray-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                <mat-icon>{{ isPartial() ? 'rule' : 'check_circle' }}</mat-icon>
              </div>
              <div>
                <p class="text-xs font-black text-gray-900">Ajuste Parcial</p>
                <p class="text-[10px] text-gray-400 font-bold uppercase">
                  {{ isPartial() ? 'Acreditar/Debitar items seleccionados' : 'Acreditar/Debitar totalidad de factura' }}
                </p>
              </div>
            </div>
            <mat-slide-toggle formControlName="isPartial" color="primary"></mat-slide-toggle>
          </div>

          <!-- Observation -->
          <div class="space-y-2">
            <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Observación / Justificación</label>
            <mat-form-field appearance="outline" class="w-full !m-0">
              <textarea matInput formControlName="observation" rows="3" placeholder="Indique la justificación de este ajuste..."></textarea>
              <mat-icon matPrefix class="mr-2 text-gray-400">edit_note</mat-icon>
            </mat-form-field>
          </div>

          <!-- Advanced Testing Config -->
          <div class="p-5 bg-slate-50/80 rounded-[24px] border border-slate-100 space-y-4">
            <div class="flex justify-between items-center cursor-pointer select-none" (click)="showAdvanced.set(!showAdvanced())">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-500 shadow-sm">
                  <mat-icon class="transition-transform duration-300" [class.rotate-180]="showAdvanced()">settings</mat-icon>
                </div>
                <div>
                  <p class="text-xs font-black text-slate-900">Configuración Avanzada de Pruebas</p>
                  <p class="text-[10px] text-slate-400 font-bold uppercase">Sobrescribir factura de referencia y rangos de numeración (Factus V2)</p>
                </div>
              </div>
              <button mat-icon-button type="button" class="!text-slate-400">
                <mat-icon>{{ showAdvanced() ? 'expand_less' : 'expand_more' }}</mat-icon>
              </button>
            </div>

            @if (showAdvanced()) {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <!-- Bill Number Override -->
                <div class="space-y-2">
                  <label class="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Factura de Referencia en Factus</label>
                  <mat-form-field appearance="outline" class="w-full !m-0">
                    <input matInput formControlName="billNumber" placeholder="Ej: SETP990003670" />
                    <mat-icon matPrefix class="mr-2 text-slate-400">receipt</mat-icon>
                    <mat-hint class="!text-[9px] !leading-normal !text-slate-400">
                      Por defecto usa la factura local. Útil en Sandbox si la factura original no existe en la plataforma de Factus.
                    </mat-hint>
                  </mat-form-field>
                </div>

                <!-- Numbering Range ID Override -->
                <div class="space-y-2">
                  <label class="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">ID Rango de Numeración</label>
                  <mat-form-field appearance="outline" class="w-full !m-0">
                    <input matInput type="number" formControlName="numberingRangeId" placeholder="Autodetectar..." />
                    <mat-icon matPrefix class="mr-2 text-slate-400">pin</mat-icon>
                    <mat-hint class="!text-[9px] !leading-normal !text-slate-400">
                      Opcional. Si se deja en blanco se resolverá dinámicamente llamando a la API de Factus (Notas Crédito: 390, Notas Débito: 391).
                    </mat-hint>
                  </mat-form-field>
                </div>
              </div>
            }
          </div>

          <!-- Items Selection Table -->
          @if (isPartial()) {
            <div class="space-y-3 animate-in fade-in duration-300">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Selección y Ajuste de Ítems</label>
              
              <div class="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <th class="py-3 px-4 text-center w-12">Activo</th>
                      <th class="py-3 px-4">Producto</th>
                      <th class="py-3 px-4 text-center w-24">Original</th>
                      <th class="py-3 px-4 text-center w-28">Cant. Ajuste</th>
                      <th class="py-3 px-4 text-center w-28">Precio Ajuste</th>
                      <th class="py-3 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (itemForm of itemsFormArray.controls; track $index) {
                      <tr class="border-b border-gray-50 last:border-0" [formGroup]="asFormGroup(itemForm)">
                        <!-- Checkbox -->
                        <td class="py-3 px-4 text-center">
                          <mat-checkbox formControlName="selected" color="primary"></mat-checkbox>
                        </td>
                        <!-- Name & SKU -->
                        <td class="py-3 px-4">
                          <div class="flex flex-col">
                            <span class="text-xs font-bold text-gray-900 leading-tight">{{ itemForm.value.name }}</span>
                            <span class="text-[9px] text-gray-400">SKU: {{ itemForm.value.codeReference }}</span>
                          </div>
                        </td>
                        <!-- Original Qty -->
                        <td class="py-3 px-4 text-center text-xs font-medium text-gray-500">
                          {{ itemForm.value.originalQty }}
                        </td>
                        <!-- Adjusted Qty Input -->
                        <td class="py-2 px-2 text-center">
                          <input 
                            type="number" 
                            formControlName="quantity" 
                            min="0.01" 
                            [max]="itemForm.value.originalQty" 
                            step="any"
                            class="w-20 text-center py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 font-bold"
                          />
                        </td>
                        <!-- Adjusted Price Input -->
                        <td class="py-2 px-2 text-center">
                          <input 
                            type="number" 
                            formControlName="price" 
                            min="0" 
                            step="any"
                            class="w-24 text-center py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 font-bold"
                          />
                        </td>
                        <!-- Subtotal -->
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
  showAdvanced = signal(false);

  noteForm = this.fb.group({
    noteType: ['credit', Validators.required],
    correctionConceptCode: ['2', Validators.required], // Anulación total por defecto para notas crédito
    observation: ['', Validators.required],
    isPartial: [false],
    billNumber: [''],
    numberingRangeId: [null as number | null],
    items: this.fb.array([])
  });

  noteType = signal<'credit' | 'debit'>('credit');
  isPartial = signal<boolean>(false);

  get itemsFormArray(): FormArray {
    return this.noteForm.get('items') as FormArray;
  }

  ngOnInit() {
    this.setupItemsForm();

    // Listen to changes in noteType to adjust default concept code
    this.noteForm.get('noteType')?.valueChanges.subscribe(val => {
      const type = val as 'credit' | 'debit';
      this.noteType.set(type);
      // Set default concept code
      const conceptCode = type === 'credit' ? '2' : '1';
      this.noteForm.get('correctionConceptCode')?.setValue(conceptCode);
    });

    // Listen to changes in isPartial
    this.noteForm.get('isPartial')?.valueChanges.subscribe(val => {
      this.isPartial.set(!!val);
      if (val) {
        // Ensure at least one item remains selected, or trigger validations as needed
      }
    });
  }

  setupItemsForm() {
    this.itemsFormArray.clear();
    if (this.data.invoice && this.data.invoice.items) {
      this.data.invoice.items.forEach(item => {
        this.itemsFormArray.push(
          this.fb.group({
            selected: [true],
            codeReference: [item.product?.sku || item.productId],
            name: [item.product?.name || 'Producto'],
            originalQty: [item.quantity],
            quantity: [item.quantity, [Validators.required, Validators.min(0.01), Validators.max(item.quantity)]],
            price: [item.unitPrice, [Validators.required, Validators.min(0)]]
          })
        );
      });
    }
  }

  asFormGroup(control: any): FormGroup {
    return control as FormGroup;
  }

  calculateItemSubtotal(itemForm: any): number {
    const isSelected = itemForm.get('selected')?.value;
    if (!isSelected && this.isPartial()) return 0;
    
    const qty = Number(itemForm.get('quantity')?.value || 0);
    const prc = Number(itemForm.get('price')?.value || 0);
    return qty * prc;
  }

  // Reactive Computed for dynamic total calculation
  noteTotalAmount = computed(() => {
    if (!this.isPartial()) {
      return Number(this.data.invoice.totalAmount);
    }
    
    // We need to calculate sum of selected items in the FormArray.
    // However, since computed uses signals, and form values aren't native signals,
    // we can calculate the total based on values inside form which changes.
    // To make this reactive, we can track valueChanges and bind it or calculate at render time.
    // To cleanly bridge form valueChanges and signals, we trigger a manual dependency tracking
    // or simply calculate total by querying form controls.
    // Let's do a trick: we define a local signal `manualTrigger` that updates on form change.
    this.manualTrigger(); 
    
    let sum = 0;
    this.itemsFormArray.controls.forEach(control => {
      sum += this.calculateItemSubtotal(control);
    });
    return sum;
  });

  manualTrigger = signal(0);

  constructor() {
    // Increment the manual trigger on form changes to force computed to re-evaluate
    this.noteForm.valueChanges.subscribe(() => {
      this.manualTrigger.update(n => n + 1);
    });
  }

  onSubmit() {
    if (this.noteForm.invalid) return;

    this.loading.set(true);
    this.errorMsg.set(null);

    const formValue = this.noteForm.value;
    const type = formValue.noteType as 'credit' | 'debit';
    const concept = formValue.correctionConceptCode || '2';
    const obs = formValue.observation || '';

    // Map items
    let payloadItems: any[] | undefined = undefined;
    if (formValue.isPartial) {
      payloadItems = [];
      this.itemsFormArray.controls.forEach(control => {
        if (control.get('selected')?.value) {
          const codeRef = control.get('codeReference')?.value;
          const qty = Number(control.get('quantity')?.value);
          const currentPrice = Number(control.get('price')?.value);
          
          const matchingInvoiceItem = this.data.invoice.items.find(
            ii => (ii.product?.sku === codeRef || ii.productId === codeRef)
          );
          
          const originalPrice = matchingInvoiceItem ? Number(matchingInvoiceItem.unitPrice) : 0;
          
          const itemPayload: any = {
            codeReference: codeRef,
            quantity: qty
          };
          
          // Omitir el envío del precio si no ha sido modificado respecto a la factura original,
          // permitiendo que el backend lo obtenga directamente de los ítems de la factura original.
          if (currentPrice !== originalPrice) {
            itemPayload.price = currentPrice;
          }
          
          payloadItems?.push(itemPayload);
        }
      });

      if (payloadItems.length === 0) {
        this.errorMsg.set('Debe seleccionar al menos un ítem para realizar un ajuste parcial.');
        this.loading.set(false);
        return;
      }
    }

    const payload: CreateSalesNoteDto = {
      correctionConceptCode: concept,
      observation: obs,
      billNumber: formValue.billNumber || undefined,
      numberingRangeId: formValue.numberingRangeId ? Number(formValue.numberingRangeId) : undefined,
      items: payloadItems
    };

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
        const errMsg = err.error?.message || err.message || 'Error desconocido al emitir nota electrónica.';
        this.errorMsg.set(errMsg);
      }
    });
  }
}
