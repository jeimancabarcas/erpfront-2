export interface InventoryBatch {
  id: string;
  productId: string;
  initialQuantity: number;
  remainingQuantity: number;
  purchasePrice: number;
  purchaseOrderId: string;
  createdAt: string;
}
