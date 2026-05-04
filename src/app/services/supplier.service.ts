import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { PaginatedMeta, QueryParams } from '../models/pagination.model';
import { Supplier, CreateSupplierDto, UpdateSupplierDto } from '../models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/suppliers`;

  private _suppliers = signal<Supplier[]>([]);
  public suppliers = this._suppliers.asReadonly();

  private _meta = signal<PaginatedMeta | null>(null);
  public meta = this._meta.asReadonly();

  loadSuppliers(params?: QueryParams): Observable<any> {
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
        this._suppliers.set(data);
        this._meta.set(meta);
      })
    );
  }

  createSupplier(dto: CreateSupplierDto): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, dto).pipe(
      tap(newSupplier => {
        this._suppliers.update(items => [newSupplier, ...items]);
      })
    );
  }

  updateSupplier(id: string, dto: UpdateSupplierDto): Observable<Supplier> {
    return this.http.patch<Supplier>(`${this.apiUrl}/${id}`, dto).pipe(
      tap(updatedSupplier => {
        this._suppliers.update(items => 
          items.map(item => item.id === id ? updatedSupplier : item)
        );
      })
    );
  }

  deleteSupplier(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._suppliers.update(items => items.filter(item => item.id !== id));
      })
    );
  }
}
