import { Injectable, signal, computed, inject } from '@angular/core';
import { FinanceInvoice, AdjustmentNote, FinancialMetric, FinanceCustomer, FinanceProduct } from '../models/finance.model';
import { SalesNoteService } from './sales-note.service';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private salesNoteService = inject(SalesNoteService);

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

  private _adjustments = signal<AdjustmentNote[]>([]);


  // Read-only signals
  public invoices = this._invoices.asReadonly();
  public adjustments = this._adjustments.asReadonly();
  public customers = this._customers.asReadonly();
  public catalog = this._catalog.asReadonly();

  // Metrics
  public metrics = computed<FinancialMetric[]>(() => {
    // Filter out cancelled invoices to get only active billing
    const activeInvoices = this._invoices().filter(inv => inv.status?.toUpperCase() !== 'CANCELLED');
    const totalSales = activeInvoices.reduce((acc, inv) => acc + inv.total, 0);

    // Separar notas de crédito y débito
    const creditNotes = this._adjustments().filter(adj => adj.type === 'Credit');
    const debitNotes = this._adjustments().filter(adj => adj.type === 'Debit');

    const totalCredit = creditNotes.reduce((acc, adj) => acc + adj.amount, 0);
    const totalDebit = debitNotes.reduce((acc, adj) => acc + adj.amount, 0);

    // Impacto neto de las notas de ajuste: las notas de crédito reducen el saldo y las de débito lo aumentan
    const netAdjustments = totalCredit - totalDebit;

    // Saldo pendiente por cobrar: Facturación Total - Notas de Crédito + Notas de Débito
    const pendingCollection = totalSales - totalCredit + totalDebit;
    
    return [
      { label: 'Facturación Total', value: totalSales, trend: 12.5, icon: 'account_balance_wallet', color: 'indigo' },
      { label: 'Notas Aplicadas', value: netAdjustments, trend: -2.3, icon: 'request_quote', color: 'amber' },
      { label: 'Pendiente Cobro', value: pendingCollection, trend: 5.1, icon: 'pending_actions', color: 'emerald' }
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

  loadAdjustments(): Observable<any> {
    return this.salesNoteService.getNotes().pipe(
      tap((res: any) => {
        const creditNotes = res.creditNotes || [];
        const debitNotes = res.debitNotes || [];

        const mappedCredits = creditNotes.map((note: any) => this.mapBackendNoteToAdjustment(note, 'Credit'));
        const mappedDebits = debitNotes.map((note: any) => this.mapBackendNoteToAdjustment(note, 'Debit'));

        const allAdjustments = [...mappedCredits, ...mappedDebits];
        this._adjustments.set(allAdjustments);

        // Map and update local invoices state with the note's invoices
        const associatedInvoices = allAdjustments
          .map((adj: any) => (adj as any).mappedInvoice)
          .filter(Boolean) as FinanceInvoice[];
          
        this._invoices.update(invs => {
          const existingIds = new Set(invs.map(i => i.id));
          const newInvs = associatedInvoices.filter((i: any) => !existingIds.has(i.id));
          return [...invs, ...newInvs];
        });
      })
    );
  }

  private mapBackendNoteToAdjustment(note: any, type: 'Credit' | 'Debit'): AdjustmentNote {
    const invoiceNumber = note.invoice?.invoiceNumber || note.invoiceId;
    const mappedInvoice: FinanceInvoice = {
      id: invoiceNumber,
      dbId: note.invoice?.id || note.invoiceId,
      customerName: note.invoice?.customer?.name || 'Cliente Desconocido',
      customerTaxId: note.invoice?.customer?.documentNumber || 'N/A',
      date: note.invoice?.date || note.createdAt,
      dueDate: note.invoice?.date || note.createdAt,
      subtotal: parseFloat(note.invoice?.totalAmount || '0'),
      tax: 0,
      total: parseFloat(note.invoice?.totalAmount || '0'),
      status: 'Paid',
      items: []
    };

    return {
      id: note.noteNumber || note.referenceCode || note.id,
      dbId: note.id,
      type: type,
      invoiceId: invoiceNumber,
      date: note.createdAt,
      reason: note.observation || 'Sin justificación técnica',
      amount: typeof note.amount === 'string' ? parseFloat(note.amount) : note.amount,
      electronicId: note.cude || undefined,
      status: note.cude ? 'Electronic_Sent' : 'Applied',
      // Store mappedInvoice directly inside note object so detail component can render customer info easily
      mappedInvoice
    } as any;
  }
}

