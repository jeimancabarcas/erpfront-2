import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { PaginatedMeta, QueryParams } from '../models/pagination.model';
import { Customer, CreateCustomerDto, UpdateCustomerDto, CreditPortfolio, RecordPaymentDto, PaymentRecord, PaymentReceiptDto } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/customers`;

  private _customers = signal<Customer[]>([]);
  public customers = this._customers.asReadonly();

  private _meta = signal<PaginatedMeta | null>(null);
  public meta = this._meta.asReadonly();

  loadCustomers(params?: QueryParams): Observable<any> {
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
        this._customers.set(data);
        this._meta.set(meta);
      })
    );
  }

  createCustomer(dto: CreateCustomerDto): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, dto).pipe(
      tap(newCustomer => {
        this._customers.update(items => [newCustomer, ...items]);
      })
    );
  }

  updateCustomer(id: string, dto: UpdateCustomerDto): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/${id}`, dto).pipe(
      tap(updatedCustomer => {
        this._customers.update(items => 
          items.map(item => item.id === id ? updatedCustomer : item)
        );
      })
    );
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._customers.update(items => items.filter(item => item.id !== id));
      })
    );
  }

  getCustomerById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  getCustomerStats(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/stats`);
  }

  // === Credit Portfolio Methods ===

  getCustomerCredit(id: string): Observable<CreditPortfolio> {
    return this.http.get<CreditPortfolio>(`${this.apiUrl}/${id}/credit`);
  }

  setCustomerCredit(id: string, dto: { creditLimit: number | null; paymentTermsDays?: number }): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/${id}/credit`, dto);
  }

  recordPayment(id: string, dto: RecordPaymentDto): Observable<{ newBalance: number; invoiceStatus: string; paymentRecord: PaymentRecord }> {
    return this.http.post<{ newBalance: number; invoiceStatus: string; paymentRecord: PaymentRecord }>(
      `${this.apiUrl}/${id}/credit/payment`, dto
    );
  }

  getPaymentHistory(id: string, invoiceId?: string, page: number = 1, limit: number = 10): Observable<{ data: PaymentRecord[]; meta: { total: number; page: number; lastPage: number; limit: number } }> {
    const params: any = {};
    if (invoiceId) params.invoiceId = invoiceId;
    if (page) params.page = page;
    if (limit) params.limit = limit;
    return this.http.get<{ data: PaymentRecord[]; meta: { total: number; page: number; lastPage: number; limit: number } }>(`${this.apiUrl}/${id}/credit/payments`, { params });
  }

  getPaymentReceipt(customerId: string, paymentId: string): Observable<PaymentReceiptDto> {
    return this.http.get<PaymentReceiptDto>(`${this.apiUrl}/${customerId}/payments/${paymentId}/receipt`);
  }

  getPaymentReceiptPdf(customerId: string, paymentId: string): Observable<{ pdf: string }> {
    return this.http.get<{ pdf: string }>(`${this.apiUrl}/${customerId}/payments/${paymentId}/receipt/pdf`);
  }
}
