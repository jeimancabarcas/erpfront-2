export interface MonthStats {
  totalSales: number;
  totalCost: number;
  profit: number;
}

export interface FinancialStats {
  currentMonth: MonthStats;
  previousMonth: MonthStats;
  comparison: {
    difference: number;
    percentage: number;
    trend: 'UP' | 'DOWN';
  };
}

export interface TopProductItem {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}
