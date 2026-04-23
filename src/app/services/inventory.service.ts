import { Injectable, signal } from '@angular/core';

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
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private _stock = signal<StockItem[]>([
    { id: '1', name: 'Laptop Pro 14', sku: 'LAP-001', category: 'Electrónica', quantity: 45, minStock: 10, maxStock: 100, unit: 'unidades', status: 'In Stock' },
    { id: '2', name: 'Monitor 27" 4K', sku: 'MON-002', category: 'Electrónica', quantity: 8, minStock: 10, maxStock: 50, unit: 'unidades', status: 'Low Stock' },
    { id: '3', name: 'Teclado Mecánico', sku: 'TEC-003', category: 'Accesorios', quantity: 0, minStock: 5, maxStock: 30, unit: 'unidades', status: 'Out of Stock' },
    { id: '4', name: 'Mouse Inalámbrico', sku: 'MOU-004', category: 'Accesorios', quantity: 120, minStock: 20, maxStock: 200, unit: 'unidades', status: 'In Stock' },
  ]);

  private _movements = signal<Movement[]>([
    { id: 'M-101', date: '2026-04-20', type: 'In', product: 'Laptop Pro 14', quantity: 20, origin: 'Proveedor', destination: 'Almacén Principal' },
    { id: 'M-102', date: '2026-04-21', type: 'Transfer', product: 'Monitor 27" 4K', quantity: 5, origin: 'Almacén Principal', destination: 'Centro de Distribución' },
    { id: 'M-103', date: '2026-04-22', type: 'Out', product: 'Mouse Inalámbrico', quantity: 15, origin: 'Centro de Distribución', destination: 'Cliente Final' },
  ]);

  public stock = this._stock.asReadonly();
  public movements = this._movements.asReadonly();

  addProduct(product: StockItem) {
    this._stock.update(items => [...items, product]);
  }

  updateProduct(updatedProduct: StockItem) {
    this._stock.update(items => items.map(item => item.id === updatedProduct.id ? updatedProduct : item));
  }
}
