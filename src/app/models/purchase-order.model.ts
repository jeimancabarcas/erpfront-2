import { Supplier } from './supplier.model';
import { Product } from './product.model';

export type PurchaseOrderStatus = 'DRAFT' | 'SENT' | 'IN_TRANSIT' | 'CANCELLED';

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
  status: PurchaseOrderStatus;
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

export interface UpdatePurchaseOrderStatusDto {
  status: PurchaseOrderStatus;
}
