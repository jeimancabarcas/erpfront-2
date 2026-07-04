import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
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
  /** When true, the electronic toggle is forced ON and disabled */
  forceElectronic?: boolean;
  /** When set, restricts correction concept to this single code (e.g. '2' for total annulment) */
  forceCorrectionCode?: string;
  /** When true: submit routes to Factus endpoint, toggle forced ON */
  useFactusCreditNote?: boolean;
  /** Factus document number used as billNumber for Factus credit notes */
  billNumber?: string;
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
    MatDividerModule,
    CurrencyPipe,
    ButtonAtom,
    TextInputComponent,
    SelectAtom,
    TextareaComponent
  ],
  template: `
    <div class="relative overflow-hidden rounded-[32px] bg-white flex flex-col max-h-[95vh] w-full shadow-2xl">
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

            <ui-select label="Concepto de Corrección" [options]="correctionOptions" [formControl]="noteForm.controls.correctionConceptCode" />
          </div>

          <!-- Observation -->
          <ui-textarea formControlName="observation" label="Observación / Justificación" placeholder="Indique la justificación de este ajuste..." [rows]="3" />

          <!-- Scenario Info Message -->
          @if (scenarioInfo(); as info) {
            <div class="flex items-start gap-3 rounded-xl px-4 py-3" [class.bg-amber-50]="info.type === 'warning'" [class.border]="info.type === 'warning'" [class.border-amber-200]="info.type === 'warning'" [class.bg-blue-50]="info.type === 'info'" [class.border]="info.type === 'info'" [class.border-blue-200]="info.type === 'info'" [class.bg-green-50]="info.type === 'success'" [class.border]="info.type === 'success'" [class.border-green-200]="info.type === 'success'">
              <span class="material-icons mt-0.5 text-[18px]" [class.text-amber-500]="info.type === 'warning'" [class.text-blue-500]="info.type === 'info'" [class.text-green-500]="info.type === 'success'">{{ info.icon }}</span>
              <p class="text-xs leading-relaxed" [class.text-amber-700]="info.type === 'warning'" [class.text-blue-700]="info.type === 'info'" [class.text-green-700]="info.type === 'success'">{{ info.message }}</p>
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
  Number = Number; // Expose Number for template

  // Current scenario derived from correctionConceptCode — only 'D' (total annulment) remains
  scenario = computed<'D' | null>(() => {
    const code = this.noteForm.get('correctionConceptCode')?.value;
    if (code === '2') return 'D';
    return null;
  });

  // Whether to show the items table — always false for total annulment only
  showItemsTable = computed(() => false);

  // Scenario info message
  scenarioInfo = computed<{ message: string; icon: string; type: string } | null>(() => {
    const s = this.scenario();
    if (s === 'D') return { icon: 'warning', message: 'Anulación total: se revertirá el 100% de valores, inventario e impuestos. La factura quedará anulada.', type: 'warning' };
    return null;
  });

  dialogTitle = computed(() => {
    const s = this.scenario();
    if (s === 'D') return 'Nota Crédito — Anulación Total';
    return 'Emitir Nota Crédito';
  });

  noteForm = this.fb.group({
    noteType: ['credit', Validators.required],
    correctionConceptCode: [this.data.forceCorrectionCode || '2', Validators.required],
    observation: ['', Validators.required],
  });

  noteType = signal<'credit'>('credit');

  noteTypeOptions: SelectOption[] = [
    { value: 'credit', label: 'Nota de Crédito (Anular / Devolver)' },
  ];

  correctionOptions: SelectOption[] = [
    { value: '2', label: '2 - Anulación total de la factura' },
  ];

  ngOnInit() {
    this.noteForm.get('noteType')?.valueChanges.subscribe(() => {
      this.noteType.set('credit');
      this.noteForm.get('correctionConceptCode')?.setValue('2');
    });
  }

  noteTotalAmount = computed(() => {
    const s = this.scenario();
    if (s === 'D') return Number(this.data.invoice.totalAmount) || 0;
    return 0;
  });

  onSubmit() {
    const s = this.scenario();
    if (!s || s !== 'D') return;
    if (this.noteForm.get('correctionConceptCode')?.value !== '2') return;

    this.loading.set(true);
    this.errorMsg.set(null);

    const formValue = this.noteForm.value;
    const concept = formValue.correctionConceptCode || '2';

    const payload: CreateSalesNoteDto = {
      correctionConceptCode: concept,
      observation: formValue.observation || '',
      scenarioType: 'total_annulment',
    };

    this.salesNoteService.createCreditNote(this.data.invoice.id, payload).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.dialogRef.close({ success: true, type: 'credit', note: response });
      },
      error: (err) => {
        this.loading.set(false);
        const errMsg = err.error?.message || err.message || 'Error desconocido al emitir nota.';
        this.errorMsg.set(errMsg);
      },
    });
  }
}
