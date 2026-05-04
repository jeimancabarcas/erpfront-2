import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';

export interface InventoryCategory {
  id: string; // UUID
  name: string;
  description?: string;
  productCount?: number; // Opcional, dependiendo de si el backend lo retorna
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

  /**
   * Carga la lista completa de categorías desde el servidor
   */
  loadCategories(): Observable<InventoryCategory[]> {
    return this.http.get<InventoryCategory[]>(this.apiUrl).pipe(
      tap(categories => this._categories.set(categories))
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
