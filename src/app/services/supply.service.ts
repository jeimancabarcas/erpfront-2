import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { PaginatedResponse, PaginatedMeta, QueryParams } from '../models/pagination.model';
import { Supply, CreateSupplyDto, UpdateSupplyDto } from '../models/supply.model';

export type { Supply };

@Injectable({
  providedIn: 'root'
})
export class SupplyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/operational/insumos`;

  // Estado reactivo para los insumos
  private _supplies = signal<Supply[]>([]);
  public supplies = this._supplies.asReadonly();

  // Estado reactivo para los metadatos de paginación
  private _meta = signal<PaginatedMeta | null>(null);
  public meta = this._meta.asReadonly();

  /**
   * Carga la lista completa de insumos desde el servidor con filtros y paginación
   */
  loadSupplies(params?: QueryParams): Observable<any> {
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

        this._supplies.set(data);
        this._meta.set(meta);
      })
    );
  }

  /**
   * Crea un nuevo insumo
   */
  createSupply(dto: CreateSupplyDto): Observable<Supply> {
    return this.http.post<Supply>(this.apiUrl, dto).pipe(
      tap(newSupply => {
        this._supplies.update(items => [newSupply, ...items]);
      })
    );
  }

  /**
   * Actualiza un insumo existente
   */
  updateSupply(id: string, dto: UpdateSupplyDto): Observable<Supply> {
    return this.http.patch<Supply>(`${this.apiUrl}/${id}`, dto).pipe(
      tap(updatedSupply => {
        this._supplies.update(items =>
          items.map(item => item.id === id ? updatedSupply : item)
        );
      })
    );
  }

  /**
   * Elimina un insumo
   */
  deleteSupply(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._supplies.update(items => items.filter(item => item.id !== id));
      })
    );
  }
}
