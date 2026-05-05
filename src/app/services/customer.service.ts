import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { PaginatedMeta, QueryParams } from '../models/pagination.model';
import { Customer, CreateCustomerDto, UpdateCustomerDto } from '../models/customer.model';

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
}
