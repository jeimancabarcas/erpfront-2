import { Component, inject, signal, computed, type OnInit, type OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  type FormGroup,
  type ValidatorFn,
  type AbstractControl,
} from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Subject, type Subscription, distinctUntilChanged, debounceTime } from 'rxjs';
import { SupplyService } from '../../../services/supply.service';
import type { Supply } from '../../../models/supply.model';
import { ButtonAtom } from '../../atoms/button/button.component';
import { SelectAtom, type SelectOption } from '../../atoms/select/select.component';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { SupplyFormMolecule } from '../../molecules/supply-form/supply-form.component';
import { DIALOG_DEFAULTS, DIALOG_WIDTHS, DIALOG_PANEL_CLASS } from '../../../shared/constants/dialog.config';

// ── Interfaces ──

export interface SupplySelectionDialogData {
  mode: 'add' | 'edit';
  lineItem?: {
    supplyId: string;
    name: string;
    quantity: number;
  };
  index?: number;
}

export interface SupplySelectionDialogResult {
  supplyId: string;
  name: string;
  quantity: number;
}

/**
 * Validates that quantity is at least 1.
 */
function minQuantityValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: unknown } | null => {
    const qty = control.value;
    if (qty != null && qty < 1) {
      return { min: { min: 1, actual: qty } };
    }
    return null;
  };
}

@Component({
  selector: 'app-supply-selection-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CurrencyPipe,
    ButtonAtom,
    SelectAtom,
    TextInputComponent,
  ],
  template: `
    <div class="flex flex-col h-full max-h-[90vh] p-8 bg-white dark:bg-gray-900">
      <!-- Header -->
      <header class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400"
          >
            <span class="material-icons !text-3xl">inventory_2</span>
          </div>
          <div>
            <h2
              class="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight !m-0"
            >
              {{ isEditMode() ? 'Editar Insumo' : 'Añadir Insumo' }}
            </h2>
            <p
              class="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1"
            >
              {{ subtitle() }}
            </p>
          </div>
        </div>
        <ui-button variant="icon" (clicked)="onCancel()" ariaLabel="Cerrar diálogo">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <div class="flex-1 overflow-y-auto custom-scrollbar">
        @if (loading()) {
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        } @else {
          <form [formGroup]="form" class="space-y-6">
            <!-- Supply Selector -->
            @if (isEditMode()) {
              <div class="flex flex-col gap-1.5">
                <label
                  class="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
                >
                  Insumo <span class="text-red-500">*</span>
                </label>
                <div
                  class="w-full h-14 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center"
                >
                  <span class="text-sm font-bold text-gray-900 dark:text-gray-100">{{
                    selectedSupply()?.nombre ?? dialogData?.lineItem?.name ?? ''
                  }}</span>
                </div>
              </div>
            } @else {
              <ui-select
                label="Insumo"
                placeholder="Seleccionar insumo..."
                [options]="supplyOptions()"
                [formControl]="$any(supplyIdCtrl)"
                [searchable]="true"
                [loading]="isLoadingSupplies()"
                [required]="true"
                emptyText="No se encontraron insumos"
                footerLabel="Crear nuevo insumo"
                (searchChange)="onSupplySearch($event)"
                (footerAction)="onCreateNewSupply()"
              />
            }

            <!-- Quantity Input -->
            <div>
              <ui-text-input
                type="number"
                label="Cantidad"
                [formControl]="$any(quantityCtrl)"
                [required]="true"
                [error]="quantityError()"
              />
              @if (quantityError()) {
                <p
                  class="text-xs text-red-500 dark:text-red-400 font-medium mt-1"
                >
                  {{ quantityError() }}
                </p>
              }
            </div>
          </form>
        }
      </div>

      <!-- Footer -->
      <footer
        class="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700"
      >
        <ui-button variant="outline" (clicked)="onCancel()">Cancelar</ui-button>
        <ui-button
          variant="primary"
          data-testid="save-btn"
          [disabled]="form.invalid || loading()"
          (clicked)="onSave()"
          >{{ isEditMode() ? 'Guardar Cambios' : 'Añadir Insumo' }}</ui-button
        >
      </footer>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f8fafc;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #cbd5e1;
      }
    `,
  ],
})
export class SupplySelectionDialogComponent implements OnInit, OnDestroy {
  private dialogRef = inject(
    MatDialogRef<SupplySelectionDialogComponent, SupplySelectionDialogResult | undefined>,
  );
  protected dialogData = inject<SupplySelectionDialogData>(MAT_DIALOG_DATA, { optional: true });
  private fb = inject(FormBuilder);
  private supplyService = inject(SupplyService);
  private matDialog = inject(MatDialog);

  // State signals
  loading = signal(false);
  isLoadingSupplies = signal(false);
  selectedSupply = signal<Supply | null>(null);
  private supplySearch$ = new Subject<string>();

  // Computed: supply options for ui-select (reads from service reactive signal)
  supplyOptions = computed<SelectOption[]>(() =>
    this.supplyService.supplies().map((s) => ({
      value: s.id,
      label: s.nombre,
    })),
  );

  // Computed: quantity validation error messages
  quantityError = computed(() => {
    this.quantityErrorTrigger();
    const errors = this.form?.controls['quantity'].errors;
    if (!errors) return '';
    if (errors['min']) return 'La cantidad debe ser al menos 1';
    if (errors['required']) return 'La cantidad es requerida';
    return '';
  });

  isEditMode = signal(false);

  // Subtitle based on context
  subtitle = computed(() => {
    if (this.isEditMode()) return 'Modificar línea de insumo';
    return 'Seleccionar insumo para el servicio';
  });

  // Subscriptions
  private supplySearchSub: Subscription | null = null;
  private supplyIdSub: Subscription | null = null;
  private quantityErrorTrigger = signal(0);

  // ── Form ──
  form: FormGroup = this.fb.group({
    supplyId: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1), minQuantityValidator()]],
  });

  // Typed form control accessors for strict template checking
  get supplyIdCtrl() {
    return this.form.get('supplyId')!;
  }
  get quantityCtrl() {
    return this.form.get('quantity')!;
  }

  ngOnInit() {
    // Supply search with debounce
    this.supplySearchSub = this.supplySearch$.pipe(debounceTime(300)).subscribe((query) => {
      this.isLoadingSupplies.set(true);
      this.supplyService.loadSupplies({ search: query || undefined, limit: 50 }).subscribe({
        next: () => this.isLoadingSupplies.set(false),
        error: () => this.isLoadingSupplies.set(false),
      });
    });

    // Initial load — always fetch fresh supplies
    this.loading.set(true);
    this.supplyService.loadSupplies({ limit: 100 }).subscribe({
      next: () => {
        this.loading.set(false);
        this.applyDialogData();
      },
      error: () => {
        this.loading.set(false);
      },
    });

    // Subscribe to supply selection changes (ui-select updates the form control)
    this.supplyIdSub = this.form.controls['supplyId'].valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((supplyId: string) => {
        if (supplyId && !this.isEditMode()) {
          this.selectSupply(supplyId);
        }
      });

    // Trigger error recomputation when quantity validity changes
    this.form.controls['quantity'].statusChanges.subscribe(() => {
      this.quantityErrorTrigger.update((v) => v + 1);
    });
    this.form.controls['quantity'].valueChanges.subscribe(() => {
      this.quantityErrorTrigger.update((v) => v + 1);
    });
  }

  ngOnDestroy() {
    this.supplySearchSub?.unsubscribe();
    this.supplyIdSub?.unsubscribe();
  }

  private applyDialogData() {
    const data = this.dialogData;
    if (!data) return;

    if (data.mode === 'edit' && data.lineItem) {
      this.isEditMode.set(true);
      this.form.patchValue({
        supplyId: data.lineItem.supplyId,
        quantity: data.lineItem.quantity,
      });

      // Find and lock the supply
      const supply =
        this.supplyService.supplies().find((s) => s.id === data.lineItem!.supplyId) ?? null;
      this.selectedSupply.set(supply);

      // Disable supplyId in edit mode
      this.form.controls['supplyId'].disable();
    }
  }

  selectSupply(supplyId: string) {
    const supply = this.supplyService.supplies().find((s) => s.id === supplyId) ?? null;
    this.selectedSupply.set(supply);
    this.form.controls['supplyId'].setValue(supplyId);

    if (supply) {
      // Reset quantity to 1
      this.form.controls['quantity'].setValue(1);
    }
  }

  onSupplySearch(query: string) {
    this.supplySearch$.next(query);
  }

  onCreateNewSupply() {
    const ref = this.matDialog.open(SupplyFormMolecule, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.md,
      panelClass: DIALOG_PANEL_CLASS,
      data: {},
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.supplyService.loadSupplies({ limit: 100 }).subscribe({
          next: () => {
            const options = this.supplyOptions();
            if (options.length > 0) {
              this.selectSupply(options[0].value);
            }
          },
        });
      }
    });
  }

  onSave() {
    if (this.form.invalid) return;

    const supplyIdControl = this.form.controls['supplyId'];
    const supplyId = this.isEditMode()
      ? (this.dialogData?.lineItem?.supplyId ?? '')
      : supplyIdControl.value;

    const supply = this.selectedSupply();
    const result: SupplySelectionDialogResult = {
      supplyId: supplyId ?? '',
      name: supply?.nombre ?? this.dialogData?.lineItem?.name ?? '',
      quantity: Number(this.form.controls['quantity'].value),
    };
    this.dialogRef.close(result);
  }

  onCancel() {
    this.dialogRef.close(undefined);
  }
}
