import type { Supplier } from './supplier.model';
import type { Product } from './product.model';

export interface PurchaseOrderItem {
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  observations: string;
  supplierId: string;
  supplier: Supplier;
  items: PurchaseOrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  orderDate: string;
  observations?: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
}

export interface UpdatePurchaseOrderDto {
  orderDate?: string;
  observations?: string;
}
