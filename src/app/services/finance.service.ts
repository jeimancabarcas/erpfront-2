import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FinanceInvoice, AdjustmentNote, FinancialMetric, FinanceCustomer, FinanceProduct, FinanceDocumentDto, FinanceDocumentsResponse, CreateElectronicBillPayload, CreateElectronicBillResponse, CreateElectronicCreditNotePayload, CreateElectronicCreditNoteResponse } from '../models/finance.model';
import { SalesNoteService } from './sales-note.service';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaginatedMeta } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/finance`;
  private salesNoteService = inject(SalesNoteService);

  // Mock Customers Catalog — populated from backend
  private _customers = signal<FinanceCustomer[]>([]);

  // Mock Products/Services Catalog — populated from backend
  private _catalog = signal<FinanceProduct[]>([]);

  private _meta = signal<PaginatedMeta | null>(null);
  public meta = this._meta.asReadonly();

  public loading = signal(false);
  public error = signal<string | null>(null);

  private _bills = signal<FinanceInvoice[]>([]);
  private _creditNotes = signal<FinanceInvoice[]>([]);

  private _invoices = computed(() => [...this._bills(), ...this._creditNotes()]);

  private _adjustments = signal<AdjustmentNote[]>([]);

  // Factus paginated table data (currently displayed page)
  private _factusTableData = signal<FinanceInvoice[]>([]);
  public factusTableData = this._factusTableData.asReadonly();

  private _factusTotal = signal<number>(0);
  public factusTotal = this._factusTotal.asReadonly();

  // Read-only signals
  public invoices = this._invoices;
  public adjustments = this._adjustments.asReadonly();
  public customers = this._customers.asReadonly();
  public catalog = this._catalog.asReadonly();

  // Metrics
  public metrics = computed<FinancialMetric[]>(() => {
    // Filter out cancelled invoices to get only active billing
    const activeInvoices = this._invoices().filter(inv => inv.status?.toUpperCase() !== 'CANCELLED');
    const totalSales = activeInvoices.reduce((acc, inv) => acc + inv.total, 0);

    // Filter credit notes only
    const creditNotes = this._adjustments().filter(adj => adj.type === 'Credit');

    const totalCredit = creditNotes.reduce((acc, adj) => acc + adj.amount, 0);

    // Impacto neto de las notas de ajuste: las notas de crédito reducen el saldo
    const netAdjustments = -totalCredit;

    // Saldo pendiente por cobrar: Facturación Total - Notas de Crédito
    const pendingCollection = totalSales - totalCredit;
    
    return [
      { label: 'Facturación Total', value: totalSales, trend: 12.5, icon: 'account_balance_wallet', color: 'indigo' },
      { label: 'Notas Aplicadas', value: netAdjustments, trend: -2.3, icon: 'request_quote', color: 'amber' },
      { label: 'Pendiente Cobro', value: pendingCollection, trend: 5.1, icon: 'pending_actions', color: 'emerald' }
    ];
  });

  addInvoice(invoice: FinanceInvoice) {
    this._bills.update(items => [invoice, ...items]);
  }

  addAdjustment(adjustment: AdjustmentNote) {
    this._adjustments.update(items => [adjustment, ...items]);
  }

  updateInvoiceStatus(invoiceId: string, status: 'Paid' | 'Sent' | 'Draft' | 'Overdue') {
    this._bills.update(items => 
      items.map(inv => inv.id === invoiceId ? { ...inv, status } : inv)
    );
  }

  loadBills(params?: { identification?: string; names?: string; number?: string; status?: string; startDate?: string; endDate?: string; page?: number; perPage?: number }): void {
    this.loading.set(true);
    this.error.set(null);
    const queryParams: any = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          queryParams[key] = value;
        }
      });
    }

    this.http.get<FinanceDocumentsResponse>(`${this.apiUrl}/bills`, { params: queryParams }).pipe(
      tap({
        next: (response) => {
          const mapped = response.data.map((dto) => this.mapDocumentToInvoice(dto));
          this._bills.set(mapped);
          this._factusTableData.set(mapped);
          this._factusTotal.set(response.meta.total);
          this._meta.set(response.meta);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message || err?.message || 'Error al cargar facturas desde Factus');
          this.loading.set(false);
        }
      })
    ).subscribe();
  }

  loadCreditNotes(params?: { identification?: string; names?: string; number?: string; status?: string; startDate?: string; endDate?: string; page?: number; perPage?: number }): void {
    this.loading.set(true);
    this.error.set(null);
    const queryParams: any = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          queryParams[key] = value;
        }
      });
    }

    this.http.get<FinanceDocumentsResponse>(`${this.apiUrl}/credit-notes`, { params: queryParams }).pipe(
      tap({
        next: (response) => {
          const mapped = response.data.map((dto) => this.mapDocumentToInvoice(dto));
          this._creditNotes.set(mapped);
          this._factusTableData.set(mapped);
          this._factusTotal.set(response.meta.total);
          this._meta.set(response.meta);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message || err?.message || 'Error al cargar notas crédito desde Factus');
          this.loading.set(false);
        }
      })
    ).subscribe();
  }

  private mapDocumentToInvoice(dto: FinanceDocumentDto): FinanceInvoice {
    return {
      id: dto.number || dto.reference_code || dto.id,
      dbId: dto.reference_code || dto.id,
      customerName: dto.customer?.names || dto.clientName || '',
      customerTaxId: dto.customer?.identification || dto.clientIdentification || '',
      date: dto.created_at || dto.createdAt || '',
      dueDate: dto.created_at || dto.createdAt || '',
      subtotal: parseFloat(dto.total || '0'),
      tax: 0,
      total: parseFloat(dto.total || '0'),
      status: dto.is_validated ? 'Paid' : 'Sent',
      electronicId: dto.reference_code || dto.id,
      isElectronic: true,
      items: [],
      type: dto.type,
      raw: dto,
    };
  }

  createElectronicBill(payload: CreateElectronicBillPayload): Observable<CreateElectronicBillResponse> {
    return this.http.post<CreateElectronicBillResponse>(`${this.apiUrl}/electronic-bills`, payload);
  }

  createElectronicCreditNote(payload: CreateElectronicCreditNotePayload): Observable<CreateElectronicCreditNoteResponse> {
    return this.http.post<CreateElectronicCreditNoteResponse>(
      `${this.apiUrl}/electronic-bills/credit-note`,
      payload,
    );
  }

  loadAdjustments(): Observable<any> {
    return this.salesNoteService.getNotes().pipe(
      tap((res: any) => {
        const creditNotes = res.creditNotes || [];

        const mappedCredits = creditNotes.map((note: any) => this.mapBackendNoteToAdjustment(note, 'Credit'));

        const allAdjustments = [...mappedCredits];
        this._adjustments.set(allAdjustments);

        // Map and update local invoices state with the note's invoices
        const associatedInvoices = allAdjustments
          .map((adj: any) => (adj as any).mappedInvoice)
          .filter(Boolean) as FinanceInvoice[];
          
        this._bills.update(invs => {
          const existingIds = new Set(invs.map(i => i.id));
          const newInvs = associatedInvoices.filter((i: any) => !existingIds.has(i.id));
          return [...invs, ...newInvs];
        });
      })
    );
  }

  private mapBackendNoteToAdjustment(note: any, type: 'Credit'): AdjustmentNote {
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

  /** Look up the local invoice ID behind a Factus document number */
  lookupLocalInvoiceId(documentNumber: string): Observable<{ invoiceId: string | null } | null> {
    return this.http.get<{ invoiceId: string | null } | null>(
      `${this.apiUrl}/electronic-bills/by-document/${encodeURIComponent(documentNumber)}`,
    );
  }
}

