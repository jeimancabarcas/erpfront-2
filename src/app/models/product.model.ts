import { InventoryCategory } from '../services/category.service';

export interface Product {
  id: string; // UUID
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  categoryId: string | null;
  category: InventoryCategory; // Objeto de la categoría relacionada
  averagePurchasePrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  categoryId?: string | null;
}

export interface UpdateProductDto {
  name?: string;
  sku?: string;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  categoryId?: string | null;
}
