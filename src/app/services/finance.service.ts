import { Injectable, signal, computed } from '@angular/core';
import { FinanceInvoice, AdjustmentNote, FinancialMetric, FinanceCustomer, FinanceProduct } from '../models/finance.model';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  // Mock Customers Catalog
  private _customers = signal<FinanceCustomer[]>([
    { id: 'C-001', name: 'Limpiezas Industriales S.A.', taxId: '900.111.222-3', email: 'contabilidad@limpiezas.com', phone: '300 123 4567', address: 'Calle 100 #15-20' },
    { id: 'C-002', name: 'Dotaciones Médicas Corp', taxId: '860.000.999-1', email: 'ventas@dotaciones.co', phone: '315 999 8877', address: 'Carrera 7 #72-10' },
    { id: 'C-003', name: 'Alimentos Saludables Ltda', taxId: '800.555.444-0', email: 'facturacion@alimentos.com', phone: '320 444 5566', address: 'Avenida Chile #11-45' }
  ]);

  // Mock Products/Services Catalog
  private _catalog = signal<FinanceProduct[]>([
    { id: 'P-001', name: 'Mantenimiento Preventivo Mensual', price: 1200000, taxRate: 0.19, category: 'Service' },
    { id: 'P-002', name: 'Kit de Papelería Administrativa', price: 45000, taxRate: 0.19, category: 'Product' },
    { id: 'P-003', name: 'Servicio de Desinfección Profunda', price: 350000, taxRate: 0.19, category: 'Service' },
    { id: 'P-004', name: 'Consultoría en Procesos', price: 2500000, taxRate: 0.19, category: 'Service' },
    { id: 'P-005', name: 'Paquete de Insumos de Aseo', price: 85000, taxRate: 0.19, category: 'Product' }
  ]);

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

  // Read-only signals
  public invoices = this._invoices.asReadonly();
  public adjustments = this._adjustments.asReadonly();
  public customers = this._customers.asReadonly();
  public catalog = this._catalog.asReadonly();

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

  updateInvoiceStatus(invoiceId: string, status: 'Paid' | 'Sent' | 'Draft' | 'Overdue') {
    this._invoices.update(items => 
      items.map(inv => inv.id === invoiceId ? { ...inv, status } : inv)
    );
  }
}
