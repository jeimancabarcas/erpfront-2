import type { Supplier } from './supplier.model';
import type { Product } from './product.model';

export type PurchaseOrderStatus = 'CREATED' | 'COMPLETED' | 'CANCELLED';

export interface PurchaseOrderSupportDocument {
  id: string;
  referenceCode: string;
  number: string | null;
  cude?: string;
  qrUrl?: string;
  publicUrl?: string;
}

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
  supportFileUrl?: string;
  supportDocuments?: PurchaseOrderSupportDocument[];
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
