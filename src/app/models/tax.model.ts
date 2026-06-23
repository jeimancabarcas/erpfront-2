export interface Tax {
  id: string;
  name: string;
  code: string;
  percentage: number;
  type: 'percentage' | 'fixed';
  isPurchase: boolean;
  isSell: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

