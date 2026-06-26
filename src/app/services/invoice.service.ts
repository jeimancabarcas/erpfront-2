import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { PaginatedMeta, QueryParams } from '../models/pagination.model';
import { Invoice, CreateInvoiceDto } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/sales/invoices`;

  // Estado reactivo para las facturas
  private _invoices = signal<Invoice[]>([]);
  public invoices = this._invoices.asReadonly();

  // Estado reactivo para los metadatos de paginación
  private _meta = signal<PaginatedMeta | null>(null);
  public meta = this._meta.asReadonly();

  /**
   * Carga la lista de facturas desde el servidor con filtros y paginación
   */
  loadInvoices(params?: QueryParams): Observable<any> {
    const queryParams: any = {};
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams[key] = params[key];
        }
      });
    }

    return this.http.get<any>(this.apiUrl, { params: queryParams }).pipe(
      tap((response: any) => {
        const data = response.data || response.items || (Array.isArray(response) ? response : []);
        const meta = response.meta || null;
        
        this._invoices.set(data);
        this._meta.set(meta);
      })
    );
  }

  /**
   * Obtiene el detalle completo de una factura por su ID
   */
  getInvoiceById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva factura (Venta)
   */
  createInvoice(dto: CreateInvoiceDto): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, dto).pipe(
      tap(newInvoice => {
        this._invoices.update(items => [newInvoice, ...items]);
      })
    );
  }

  /**
   * Obtiene estadísticas financieras (KPIs) para el dashboard
   */
  getFinancialStats(): Observable<any> {
    const statsUrl = `${environment.apiUrl}/sales/stats/financial`;
    return this.http.get<any>(statsUrl);
  }

  /**
   * Busca facturas manuales por número (para enlazar con emisión electrónica)
   */
  searchManualBills(number: string): Observable<any[]> {
    const searchUrl = `${environment.apiUrl}/sales/invoices/search`;
    return this.http.get<any[]>(searchUrl, { params: { number } });
  }

  /**
   * Obtiene el PDF con historial de una factura (manuales generan historial, electrónicas PDF local con notas)
   */
  getInvoicePdf(id: string): Observable<{ pdfBase64Encoded: string; fileName: string }> {
    return this.http.get<{ pdfBase64Encoded: string; fileName: string }>(`${this.apiUrl}/${id}/pdf`);
  }

  /**
   * Obtiene el PDF oficial de la DIAN para facturas electrónicas
   */
  getInvoiceDianPdf(id: string): Observable<{ pdfBase64Encoded: string; fileName: string }> {
    return this.http.get<{ pdfBase64Encoded: string; fileName: string }>(`${this.apiUrl}/${id}/dian-pdf`);
  }

  /**
   * Emite electrónicamente una factura manual post-hoc (POST /sales/invoices/:id/emit)
   */
  emitInvoice(id: string): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/${id}/emit`, {});
  }
}
