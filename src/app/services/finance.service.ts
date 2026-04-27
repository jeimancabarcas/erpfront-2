import { Injectable, signal, computed } from '@angular/core';
import { FinanceInvoice, AdjustmentNote, FinancialMetric } from '../models/finance.model';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  // In-memory state for mock demonstration
  private _invoices = signal<FinanceInvoice[]>([
    {
      id: 'FE-1001',
      customerName: 'Limpiezas Industriales S.A.',
      customerTaxId: '900.111.222-3',
      date: '2026-04-20',
      dueDate: '2026-05-20',
      status: 'Paid',
      subtotal: 1000000,
      tax: 190000,
      total: 1190000,
      electronicId: 'cufe-abcd-1234',
      items: [
        { id: '1', description: 'Servicio de mantenimiento', quantity: 1, unitPrice: 1000000, taxRate: 0.19, total: 1190000 }
      ]
    },
    {
      id: 'FE-1002',
      customerName: 'Dotaciones Médicas Corp',
      customerTaxId: '860.000.999-1',
      date: '2026-04-25',
      dueDate: '2026-05-25',
      status: 'Sent',
      subtotal: 500000,
      tax: 95000,
      total: 595000,
      electronicId: 'cufe-efgh-5678',
      items: [
        { id: '2', description: 'Papelería y oficina', quantity: 10, unitPrice: 50000, taxRate: 0.19, total: 595000 }
      ]
    }
  ]);

  private _adjustments = signal<AdjustmentNote[]>([
    {
      id: 'NC-500',
      type: 'Credit',
      invoiceId: 'FE-1001',
      date: '2026-04-22',
      reason: 'Devolución parcial de servicio',
      amount: 200000,
      status: 'Applied',
      electronicId: 'cude-9999-xxxx'
    }
  ]);

  // Read-only signals for components
  public invoices = this._invoices.asReadonly();
  public adjustments = this._adjustments.asReadonly();

  // Metrics
  public metrics = computed<FinancialMetric[]>(() => {
    const totalSales = this._invoices().reduce((acc, inv) => acc + inv.total, 0);
    const totalAdjustments = this._adjustments().reduce((acc, adj) => acc + adj.amount, 0);
    
    return [
      { label: 'Facturación Total', value: totalSales, trend: 12.5, icon: 'account_balance_wallet', color: 'indigo' },
      { label: 'Notas Aplicadas', value: totalAdjustments, trend: -2.3, icon: 'request_quote', color: 'amber' },
      { label: 'Pendiente Cobro', value: totalSales - totalAdjustments, trend: 5.1, icon: 'pending_actions', color: 'emerald' }
    ];
  });

  addInvoice(invoice: FinanceInvoice) {
    this._invoices.update(items => [invoice, ...items]);
  }

  addAdjustment(adjustment: AdjustmentNote) {
    this._adjustments.update(items => [adjustment, ...items]);
  }

  updateInvoiceStatus(id: string, status: FinanceInvoice['status']) {
    this._invoices.update(items => items.map(inv => 
      inv.id === id ? { ...inv, status } : inv
    ));
  }
}
