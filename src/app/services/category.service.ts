import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { PaginatedResponse, PaginatedMeta, QueryParams } from '../models/pagination.model';

export interface InventoryCategory {
  id: string; // UUID
  name: string;
  description?: string;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/inventory/categories`;

  // Estado reactivo para las categorías
  private _categories = signal<InventoryCategory[]>([]);
  public categories = this._categories.asReadonly();

  // Estado reactivo para los metadatos de paginación
  private _meta = signal<PaginatedMeta | null>(null);
  public meta = this._meta.asReadonly();

  /**
   * Carga la lista completa de categorías desde el servidor con filtros, orden y paginación
   */
  loadCategories(params?: QueryParams): Observable<PaginatedResponse<InventoryCategory>> {
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
        // Handle both { data: [...] } and { items: [...] } or direct array [...]
        const data = response.data || response.items || (Array.isArray(response) ? response : []);
        const meta = response.meta || null;
        
        this._categories.set(data);
        this._meta.set(meta);
      })
    );
  }

  /**
   * Obtiene una categoría por su ID
   */
  getCategoryById(id: string): Observable<InventoryCategory> {
    return this.http.get<InventoryCategory>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva categoría
   */
  createCategory(dto: CreateCategoryDto): Observable<InventoryCategory> {
    return this.http.post<InventoryCategory>(this.apiUrl, dto).pipe(
      tap(newCategory => {
        this._categories.update(items => [...items, newCategory]);
      })
    );
  }

  /**
   * Actualiza una categoría existente
   */
  updateCategory(id: string, dto: UpdateCategoryDto): Observable<InventoryCategory> {
    return this.http.patch<InventoryCategory>(`${this.apiUrl}/${id}`, dto).pipe(
      tap(updatedCategory => {
        this._categories.update(items => 
          items.map(item => item.id === id ? updatedCategory : item)
        );
      })
    );
  }

  /**
   * Elimina una categoría
   */
  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._categories.update(items => items.filter(item => item.id !== id));
      })
    );
  }
}
