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
  taxIds: string[];
  taxes?: { id: string; name: string; code: string; percentage: number; type: string; }[];
  averagePurchasePrice: number;
  sellingPrice: number;
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
  taxIds?: string[];
}

export interface UpdateProductDto {
  name?: string;
  sku?: string;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  categoryId?: string | null;
  taxIds?: string[];
  adjustmentReason?: string;
}
