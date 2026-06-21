import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';

export interface StockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface Movement {
  id: string;
  date: string;
  type: 'In' | 'Out' | 'Transfer';
  product: string;
  quantity: number;
  origin: string;
  destination: string;
  operator?: string;
}


@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/inventory/movements`;

  private _stock = signal<StockItem[]>([
    { id: '1', name: 'Laptop Pro 14', sku: 'LAP-001', category: 'Electrónica', quantity: 45, minStock: 10, maxStock: 100, unit: 'unidades', status: 'In Stock' },
    { id: '2', name: 'Monitor 27" 4K', sku: 'MON-002', category: 'Electrónica', quantity: 8, minStock: 10, maxStock: 50, unit: 'unidades', status: 'Low Stock' },
    { id: '3', name: 'Teclado Mecánico', sku: 'TEC-003', category: 'Accesorios', quantity: 0, minStock: 5, maxStock: 30, unit: 'unidades', status: 'Out of Stock' },
    { id: '4', name: 'Mouse Inalámbrico', sku: 'MOU-004', category: 'Accesorios', quantity: 120, minStock: 20, maxStock: 200, unit: 'unidades', status: 'In Stock' },
  ]);

  private _movements = signal<Movement[]>([]);

  public stock = this._stock.asReadonly();
  public movements = this._movements.asReadonly();

  loadMovements(): Observable<Movement[]> {
    return this.http.get<Movement[]>(this.apiUrl).pipe(
      tap(data => this._movements.set(data))
    );
  }

  addProduct(product: StockItem) {
    this._stock.update(items => [...items, product]);
  }

  updateProduct(updatedProduct: StockItem) {
    this._stock.update(items => items.map(item => item.id === updatedProduct.id ? updatedProduct : item));
  }
}
