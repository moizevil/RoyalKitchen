export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  costPercentage: number; // e.g. 50
  imageUrl: string;
  available: boolean;
  featured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  displayOrder: number;
  visible: boolean;
  createdAt: string;
}

export interface OrderItemSnapshot {
  id: string;
  orderId: string;
  productId: string;
  productNameSnapshot: string;
  sellingPriceSnapshot: number;
  buyingCostSnapshot: number;
  profitPerUnitSnapshot: number;
  quantity: number;
  lineRevenue: number;
  lineBuyingCost: number;
  lineProfit: number;
  imageUrlSnapshot?: string;
}

export type OrderStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Order {
  id: string;
  orderNumber: string; // e.g. RK-2026-0001
  customerId?: string;
  customerUsername?: string;
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
  // Internal financial fields (never sent to customer API)
  totalBuyingCost?: number;
  totalProfit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category:
    | 'Gas'
    | 'Electricity'
    | 'Packaging'
    | 'Delivery'
    | 'Marketing'
    | 'Maintenance'
    | 'Equipment'
    | 'Ingredients'
    | 'Other';
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  restaurantName: string;
  tagline?: string;
  location?: string;
  whatsappNumber: string;
  whatsappInternational: string;
  serviceArea: string;
  openingTime: string; // "14:00"
  closingTime: string; // "00:00"
  timezone: string; // "Asia/Karachi"
  deliveryCharge: number;
  currency: string; // "Rs."
  defaultCostPercentage: number; // 50
  expenseBudget: number; // 50000
  profitTarget: number; // 60000
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  fullName?: string;
  phone?: string;
  area?: string;
  address?: string;
  passwordHash: string;
  role: 'admin' | 'customer';
  createdAt: string;
  updatedAt?: string;
}

export interface AdminSession {
  token: string;
  userId: string;
  username: string;
  createdAt: string;
  expiresAt: string;
}

export interface CustomerSession {
  token: string;
  userId: string;
  username: string;
  role: 'customer';
  createdAt: string;
  expiresAt: string;
}
