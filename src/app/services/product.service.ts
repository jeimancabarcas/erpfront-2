import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { PaginatedResponse, PaginatedMeta, QueryParams } from '../models/pagination.model';
import { Product, CreateProductDto, UpdateProductDto } from '../models/product.model';
import { InventoryBatch } from '../models/inventory-batch.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/inventory/products`;

  // Estado reactivo para los productos
  private _products = signal<Product[]>([]);
  public products = this._products.asReadonly();

  // Estado reactivo para los metadatos de paginación
  private _meta = signal<PaginatedMeta | null>(null);
  public meta = this._meta.asReadonly();

  /**
   * Carga la lista completa de productos desde el servidor con filtros, orden y paginación
   */
  loadProducts(params?: QueryParams): Observable<any> {
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
        
        this._products.set(data);
        this._meta.set(meta);
      })
    );
  }

  /**
   * Obtiene un producto por su ID
   */
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo producto
   */
  createProduct(dto: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, dto).pipe(
      tap(newProduct => {
        this._products.update(items => [newProduct, ...items]);
      })
    );
  }

  /**
   * Actualiza un producto existente
   */
  updateProduct(id: string, dto: UpdateProductDto): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}`, dto).pipe(
      tap(updatedProduct => {
        this._products.update(items => 
          items.map(item => item.id === id ? updatedProduct : item)
        );
      })
    );
  }

  /**
   * Elimina un producto
   */
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._products.update(items => items.filter(item => item.id !== id));
      })
    );
  }

  /**
   * Obtiene el historial de ingresos (lotes) de un producto
   */
  getProductBatches(id: string): Observable<InventoryBatch[]> {
    return this.http.get<InventoryBatch[]>(`${this.apiUrl}/${id}/batches`);
  }
}
