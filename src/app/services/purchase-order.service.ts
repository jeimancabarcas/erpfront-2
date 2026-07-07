import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { type Observable, tap } from 'rxjs';
import type { PaginatedMeta, QueryParams } from '../models/pagination.model';
import type {
  PurchaseOrder,
  PurchaseOrderSupportDocument,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
} from '../models/purchase-order.model';

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/purchase-orders`;

  private _orders = signal<PurchaseOrder[]>([]);
  public orders = this._orders.asReadonly();

  private _meta = signal<PaginatedMeta | null>(null);
  public meta = this._meta.asReadonly();

  loadOrders(params?: QueryParams): Observable<any> {
    const queryParams: any = {};
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams[key] = params[key];
        }
      });
    }

    return this.http.get<any>(this.apiUrl, { params: queryParams }).pipe(
      tap((response: any) => {
        const data = response.data || response.items || (Array.isArray(response) ? response : []);
        const meta = response.meta || null;
        this._orders.set(data);
        this._meta.set(meta);
      }),
    );
  }

  createOrder(dto: CreatePurchaseOrderDto): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(this.apiUrl, dto).pipe(
      tap((newOrder) => {
        this._orders.update((items) => [newOrder, ...items]);
      }),
    );
  }

  updateOrder(id: string, dto: UpdatePurchaseOrderDto): Observable<PurchaseOrder> {
    return this.http.patch<PurchaseOrder>(`${this.apiUrl}/${id}`, dto).pipe(
      tap((updatedOrder) => {
        this._orders.update((items) => items.map((item) => (item.id === id ? updatedOrder : item)));
      }),
    );
  }

  deleteOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._orders.update((items) => items.filter((item) => item.id !== id));
      }),
    );
  }

  completeOrder(id: string, file?: File): Observable<PurchaseOrder> {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    return this.http.post<PurchaseOrder>(`${this.apiUrl}/${id}/complete`, formData).pipe(
      tap((updatedOrder) => {
        this._orders.update((items) => items.map((item) => (item.id === id ? updatedOrder : item)));
      }),
    );
  }

  cancelOrder(id: string): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.apiUrl}/${id}/cancel`, {}).pipe(
      tap((updatedOrder) => {
        this._orders.update((items) => items.map((item) => (item.id === id ? updatedOrder : item)));
      }),
    );
  }

  emitSupportDocument(id: string): Observable<PurchaseOrderSupportDocument> {
    return this.http.post<PurchaseOrderSupportDocument>(
      `${this.apiUrl}/${id}/support-document`,
      {},
    );
  }

  downloadSupportDocumentPdf(
    id: string,
  ): Observable<{ pdfBase64Encoded: string; fileName: string }> {
    return this.http.get<{ pdfBase64Encoded: string; fileName: string }>(
      `${this.apiUrl}/${id}/support-document/pdf`,
    );
  }
}
