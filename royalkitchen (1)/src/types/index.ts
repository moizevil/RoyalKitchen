export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  available: boolean;
  featured: boolean;
  displayOrder: number;
  // Admin-only fields:
  costPercentage?: number;
  buyingCost?: number;
  profitPerUnit?: number;
  profitMargin?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  visible?: boolean;
  active?: boolean;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItemSnapshot {
  id: string;
  orderId: string;
  productId: string;
  productNameSnapshot: string;
  sellingPriceSnapshot: number;
  buyingCostSnapshot?: number;
  profitPerUnitSnapshot?: number;
  quantity: number;
  lineRevenue: number;
  lineBuyingCost?: number;
  lineProfit?: number;
  imageUrlSnapshot?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  area: string;
  address: string;
  notes?: string;
  paymentMethod: 'Cash on Delivery';
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status: OrderStatus;
  items: OrderItemSnapshot[];
  totalBuyingCost?: number;
  totalProfit?: number;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'GAS'
  | 'ELECTRICITY'
  | 'PACKAGING'
  | 'DELIVERY'
  | 'MARKETING'
  | 'MAINTENANCE'
  | 'EQUIPMENT'
  | 'INGREDIENTS'
  | 'OTHER'
  | 'Gas'
  | 'Electricity'
  | 'Packaging'
  | 'Delivery'
  | 'Marketing'
  | 'Maintenance'
  | 'Equipment'
  | 'Ingredients'
  | 'Other';

export interface Expense {
  id: string;
  name?: string;
  title?: string;
  amount: number;
  category: ExpenseCategory | string;
  date: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreSettings {
  restaurantName: string;
  tagline?: string;
  location?: string;
  whatsappNumber: string;
  whatsappInternational: string;
  serviceArea: string;
  openingTime: string;
  closingTime: string;
  openingTimeFormatted?: string;
  closingTimeFormatted?: string;
  timezone?: string;
  deliveryCharge: number;
  currency: string;
  isOpen: boolean;
  closedMessage?: string;
  // Admin-only fields:
  defaultCostPercentage?: number;
  expenseBudget?: number;
  profitTarget?: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  details?: string;
  description?: string;
  performedBy?: string;
  actor?: string;
  createdAt?: string;
  timestamp?: string;
}

export type PeriodFilter =
  | 'TODAY'
  | 'YESTERDAY'
  | 'LAST_7_DAYS'
  | 'LAST_30_DAYS'
  | 'THIS_MONTH'
  | 'PREVIOUS_MONTH'
  | 'CUSTOM';

export interface AnalyticsSummary {
  period?: {
    filterType: string;
    startDate: string;
    endDate: string;
  };
  kpis: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders?: number;
    totalRevenue: number;
    totalProductBuyingCost: number;
    productProfit: number;
    otherBusinessExpenses?: number;
    totalOtherExpenses?: number;
    finalBusinessProfit: number;
    averageOrderValue: number;
    profitMargin: number;
  };
  comparison?: {
    revenue?: { changePct: number; trend: 'UP' | 'DOWN' | 'NO CHANGE' };
    orders?: { changePct: number; trend: 'UP' | 'DOWN' | 'NO CHANGE' };
    profit?: { changePct: number; trend: 'UP' | 'DOWN' | 'NO CHANGE' };
    expenses?: { changePct: number; trend: 'UP' | 'DOWN' | 'NO CHANGE' };
  };
  targets?: {
    profitTarget: number;
    targetProgressPct: number;
    targetRemaining: number;
    targetStatus: string;
    expenseBudget: number;
    expensePercentageUsed: number;
    expenseRemaining: number;
    expenseStatus: 'WITHIN BUDGET' | 'BUDGET FULL' | 'OVER BUDGET';
  };
  businessHealth?: {
    status: 'PRETTY' | 'GOOD' | 'WATCH' | 'NEEDS ATTENTION';
    explanation: string;
    profitMargin: number;
  };
  bestSellers: {
    productId: string;
    productName: string;
    imageUrl?: string;
    category: string;
    quantitySold: number;
    revenue: number;
    buyingCost?: number;
    profit: number;
    profitMargin?: number;
  }[];
  charts?: {
    dailyRevenue?: { date: string; revenue: number; profit: number }[];
    categoryBreakdown?: { category: string; revenue: number }[];
  };
  comparisons?: {
    metric: string;
    current: number;
    previous: number;
    change: number;
    percentChange: number;
    direction: 'UP' | 'DOWN' | 'NO_CHANGE';
    format: 'currency' | 'number';
  }[];
}

export type AnalyticsData = AnalyticsSummary;
