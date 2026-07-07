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
  createdAt?: string;
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
  adjustmentNotes?: PurchaseOrderAdjustmentNote[];
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

export interface PurchaseOrderAdjustmentNote {
  id: string;
  referenceCode: string;
  noteNumber: string | null;
  cude?: string;
  correctionConceptCode: string;
  amount: number;
  observation?: string;
  qrUrl?: string;
  publicUrl?: string;
  items?: PurchaseOrderAdjustmentNoteItem[];
  createdAt: string;
}

export interface PurchaseOrderAdjustmentNoteItem {
  codeReference: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productId?: string;
  taxAmount: number;
  consumed: boolean;
}

export interface CreateAdjustmentNoteDto {
  correctionConceptCode: string;
  observation?: string;
}

export interface UpdatePurchaseOrderDto {
  orderDate?: string;
  observations?: string;
}
