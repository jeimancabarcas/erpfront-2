import { Component, inject, input, output, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { CreditPortfolio, CreditStatus } from '../../../models/customer.model';
import { ButtonAtom } from '../../atoms/button/button.component';

@Component({
  selector: 'app-credit-portfolio',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ButtonAtom],
  template: `
    <div class="bg-white rounded-[28px] border border-gray-100 shadow-sm p-6 space-y-5">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <span class="material-icons">account_balance</span>
          </div>
          <div>
            <h3 class="font-black text-gray-900 text-sm">Portafolio de Crédito</h3>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Límite y saldo</p>
          </div>
        </div>
        @if (creditLimit() !== null) {
          <div class="flex items-center gap-2">
            <ui-button variant="outline" size="sm" (clicked)="configureCredit.emit()">
              <span class="material-icons text-[16px]">edit</span>
              Editar límite
            </ui-button>
            <ui-button variant="outline" size="sm" (clicked)="recordPayment.emit()">
              <span class="material-icons text-[16px]">payments</span>
              Registrar Pago
            </ui-button>
          </div>
        }
      </div>

      <!-- Credit Limit Warning Banner -->
      @if (showWarning()) {
        <div class="p-4 bg-amber-50 border border-amber-200 rounded-[20px] flex items-start gap-3">
          <span class="material-icons text-amber-600 text-sm mt-0.5">warning_amber</span>
          <div>
            <p class="text-xs font-black text-amber-800 uppercase tracking-wider">Límite de crédito excedido</p>
            <p class="text-[11px] text-amber-700 mt-0.5">
              El saldo actual ({{ currentBalance() | currency }}) supera el límite asignado ({{ creditLimit() | currency }}).
            </p>
          </div>
        </div>
      }

      @if (creditLimit() !== null) {
        <!-- Credit Info Grid -->
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-gray-50 rounded-[20px] space-y-1">
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Límite de Crédito</span>
            <p class="font-black text-gray-900 text-lg">{{ creditLimit() | currency }}</p>
          </div>
          <div class="p-4 bg-gray-50 rounded-[20px] space-y-1">
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Saldo Actual</span>
            <p class="font-black text-gray-900 text-lg">{{ currentBalance() | currency }}</p>
          </div>
          <div class="p-4 bg-gray-50 rounded-[20px] space-y-1">
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Crédito Disponible</span>
            <p class="font-black text-gray-900 text-lg">{{ availableCredit() | currency }}</p>
          </div>
          <div class="p-4 bg-gray-50 rounded-[20px] space-y-1">
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Utilización</span>
            <p class="font-black text-gray-900 text-lg">{{ utilizationPercent() }}%</p>
          </div>
        </div>

        <!-- Utilization Bar -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Uso del crédito</span>
            <span class="text-xs font-black" [class.text-emerald-600]="utilizationPercent() <= 70"
                  [class.text-amber-600]="utilizationPercent() > 70 && utilizationPercent() <= 90"
                  [class.text-red-600]="utilizationPercent() > 90">
              {{ utilizationPercent() }}%
            </span>
          </div>
          <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500"
                 [style.width.%]="Math.min(utilizationPercent(), 100)"
                 [class.bg-emerald-500]="utilizationPercent() <= 70"
                 [class.bg-amber-500]="utilizationPercent() > 70 && utilizationPercent() <= 90"
                 [class.bg-red-500]="utilizationPercent() > 90">
            </div>
          </div>
        </div>

        <!-- Credit Status Badge -->
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Estado:</span>
          <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                [class.bg-emerald-50]="creditStatus() === 'GOOD'"
                [class.text-emerald-600]="creditStatus() === 'GOOD'"
                [class.bg-amber-50]="creditStatus() === 'OVERDUE'"
                [class.text-amber-600]="creditStatus() === 'OVERDUE'"
                [class.bg-red-50]="creditStatus() === 'BLOCKED'"
                [class.text-red-600]="creditStatus() === 'BLOCKED'">
            {{ creditStatusLabel() }}
          </span>
          @if (paymentTermsDays(); as days) {
            <span class="text-[10px] text-gray-400 ml-auto">Plazo: {{ days }} días</span>
          }
        </div>
      } @else {
        <!-- No credit limit state -->
        <div class="p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div class="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
            <span class="material-icons text-gray-400">credit_card_off</span>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-bold text-gray-500">Sin límite de crédito asignado</p>
            <p class="text-xs text-gray-400 max-w-xs">Este cliente no tiene un límite de crédito configurado.</p>
          </div>
          <ui-button variant="outline" size="sm" (clicked)="configureCredit.emit()">
            <span class="material-icons text-[16px]">credit_score</span>
            Configurar Crédito
          </ui-button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class CreditPortfolioOrganism {
  // Make Math available in template
  protected Math = Math;

  portfolio = input<CreditPortfolio | null>(null);

  creditLimit = computed(() => this.portfolio()?.creditLimit ?? null);
  currentBalance = computed(() => this.portfolio()?.currentBalance ?? 0);
  availableCredit = computed(() => this.portfolio()?.availableCredit ?? null);
  utilizationPercent = computed(() => this.portfolio()?.utilizationPercent ?? 0);
  creditStatus = computed<CreditStatus>(() => this.portfolio()?.creditStatus ?? 'GOOD');
  paymentTermsDays = computed(() => this.portfolio()?.paymentTermsDays ?? 30);

  showWarning = computed(() => {
    const limit = this.creditLimit();
    const balance = this.currentBalance();
    return limit !== null && balance > limit;
  });

  creditStatusLabel = computed(() => {
    const status = this.creditStatus();
    switch (status) {
      case 'GOOD': return 'Al Día';
      case 'OVERDUE': return 'Vencido';
      case 'BLOCKED': return 'Bloqueado';
      default: return status;
    }
  });

  recordPayment = output<void>();
  configureCredit = output<void>();
}
