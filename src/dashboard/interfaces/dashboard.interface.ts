export interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  activeDiscounts: number;
  totalRevenue: number;
  todayRevenue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

export interface RevenueByPeriod {
  period: string; // date or month
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  totalSold: number;
  revenue: number;
}

export interface OrdersByStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface RecentActivity {
  type: 'order' | 'customer' | 'product';
  title: string;
  description: string;
  timestamp: Date;
}
