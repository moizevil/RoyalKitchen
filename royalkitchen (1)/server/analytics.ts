import { db } from './db';
import { Order, Expense } from './types';

export interface DateFilterRange {
  startDate: Date;
  endDate: Date;
  prevStartDate: Date;
  prevEndDate: Date;
  label: string;
}

export function parseDateFilter(
  filterType: string,
  customStart?: string,
  customEnd?: string
): DateFilterRange {
  const now = new Date();
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);

  let startDate: Date;
  let endDate: Date = endOfDay(now);
  let prevStartDate: Date;
  let prevEndDate: Date;

  switch (filterType) {
    case 'today': {
      startDate = startOfDay(now);
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      prevStartDate = startOfDay(yesterday);
      prevEndDate = endOfDay(yesterday);
      break;
    }
    case 'yesterday': {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      startDate = startOfDay(yesterday);
      endDate = endOfDay(yesterday);

      const dayBefore = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      prevStartDate = startOfDay(dayBefore);
      prevEndDate = endOfDay(dayBefore);
      break;
    }
    case '7days': {
      startDate = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
      const prevPeriodEnd = new Date(startDate.getTime() - 1);
      prevStartDate = startOfDay(new Date(prevPeriodEnd.getTime() - 6 * 24 * 60 * 60 * 1000));
      prevEndDate = endOfDay(prevPeriodEnd);
      break;
    }
    case 'thisMonth': {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    }
    case 'previousMonth': {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
      prevEndDate = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
      break;
    }
    case 'custom': {
      startDate = customStart ? startOfDay(new Date(customStart)) : startOfDay(new Date(now.getTime() - 30 * 24 * 3600 * 1000));
      endDate = customEnd ? endOfDay(new Date(customEnd)) : endOfDay(now);
      const spanMs = endDate.getTime() - startDate.getTime();
      prevEndDate = new Date(startDate.getTime() - 1);
      prevStartDate = new Date(prevEndDate.getTime() - spanMs);
      break;
    }
    case '30days':
    default: {
      startDate = startOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));
      const prevPeriodEnd = new Date(startDate.getTime() - 1);
      prevStartDate = startOfDay(new Date(prevPeriodEnd.getTime() - 29 * 24 * 60 * 60 * 1000));
      prevEndDate = endOfDay(prevPeriodEnd);
      break;
    }
  }

  return {
    startDate,
    endDate,
    prevStartDate,
    prevEndDate,
    label: filterType,
  };
}

export function computeDashboardAnalytics(
  filterType = '30days',
  customStart?: string,
  customEnd?: string
) {
  const range = parseDateFilter(filterType, customStart, customEnd);
  const allOrders = db.getOrders(true); // Full access with financial snapshots
  const allExpenses = db.getExpenses();
  const settings = db.getSettings();
  const allProducts = db.getProducts(true);

  // Filter orders in current range
  const currentOrders = allOrders.filter((o) => {
    const d = new Date(o.createdAt);
    return d >= range.startDate && d <= range.endDate;
  });

  // Filter orders in previous range for period comparison
  const prevOrders = allOrders.filter((o) => {
    const d = new Date(o.createdAt);
    return d >= range.prevStartDate && d <= range.prevEndDate;
  });

  // Filter expenses in current range
  const currentExpenses = allExpenses.filter((e) => {
    const d = new Date(e.date);
    return d >= range.startDate && d <= range.endDate;
  });

  const prevExpenses = allExpenses.filter((e) => {
    const d = new Date(e.date);
    return d >= range.prevStartDate && d <= range.prevEndDate;
  });

  // Status-based breakdown for current period
  const totalOrdersCount = currentOrders.length;
  const completedOrders = currentOrders.filter((o) => o.status === 'DELIVERED');
  const pendingOrders = currentOrders.filter((o) =>
    ['NEW', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)
  );
  const cancelledOrders = currentOrders.filter((o) => o.status === 'CANCELLED');

  // Completed Financials (EXCLUDING CANCELLED ORDERS!)
  // In addition to delivered, confirmed/preparing/out for delivery count as active line revenue
  const validFinancialOrders = currentOrders.filter((o) => o.status !== 'CANCELLED');

  // Calculate Revenue (Subtotal: selling price of food items)
  const totalRevenue = validFinancialOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const totalProductBuyingCost = validFinancialOrders.reduce(
    (sum, o) => sum + (o.totalBuyingCost || 0),
    0
  );
  const productProfit = validFinancialOrders.reduce((sum, o) => sum + (o.totalProfit || 0), 0);

  const totalOtherExpenses = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
  const finalBusinessProfit = productProfit - totalOtherExpenses;

  const averageOrderValue =
    completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;
  const profitMargin =
    totalRevenue > 0 ? Number(((productProfit / totalRevenue) * 100).toFixed(1)) : 0;

  // Previous Period Financials for Comparison
  const prevValidOrders = prevOrders.filter((o) => o.status !== 'CANCELLED');
  const prevRevenue = prevValidOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const prevProfit = prevValidOrders.reduce((sum, o) => sum + (o.totalProfit || 0), 0);
  const prevExpensesTotal = prevExpenses.reduce((sum, e) => sum + e.amount, 0);

  const calcChange = (curr: number, prev: number) => {
    if (prev === 0) {
      if (curr === 0) return { changePct: 0, trend: 'NO CHANGE' as const };
      return { changePct: 100, trend: 'UP' as const };
    }
    const pct = Math.round(((curr - prev) / prev) * 100);
    return {
      changePct: Math.abs(pct),
      trend: pct > 0 ? ('UP' as const) : pct < 0 ? ('DOWN' as const) : ('NO CHANGE' as const),
    };
  };

  const revenueComparison = calcChange(totalRevenue, prevRevenue);
  const orderComparison = calcChange(validFinancialOrders.length, prevValidOrders.length);
  const profitComparison = calcChange(productProfit, prevProfit);
  const expenseComparison = calcChange(totalOtherExpenses, prevExpensesTotal);

  // Profit Target & Budget
  const profitTarget = settings.profitTarget || 60000;
  const targetProgressPct = Math.round((productProfit / profitTarget) * 100);
  const targetRemaining = Math.max(0, profitTarget - productProfit);
  const targetStatus = targetProgressPct >= 100 ? 'TARGET ACHIEVED' : 'IN PROGRESS';

  const expenseBudget = settings.expenseBudget || 50000;
  const expensePercentageUsed = Math.round((totalOtherExpenses / expenseBudget) * 100);
  const expenseRemaining = Math.max(0, expenseBudget - totalOtherExpenses);
  const expenseStatus =
    expensePercentageUsed > 100
      ? 'OVER BUDGET'
      : expensePercentageUsed >= 90
      ? 'BUDGET FULL'
      : 'WITHIN BUDGET';

  // Business Health Calculation
  let businessHealth: 'PRETTY' | 'GOOD' | 'WATCH' | 'NEEDS ATTENTION' = 'GOOD';
  let healthExplanation = '';

  if (targetProgressPct >= 80 && expensePercentageUsed <= 75 && cancelledOrders.length <= 3) {
    businessHealth = 'PRETTY';
    healthExplanation =
      "Sales are exceptionally strong, expenses are well contained, and you're comfortably on track to surpass your profit target.";
  } else if (targetProgressPct >= 50 && expensePercentageUsed <= 85) {
    businessHealth = 'GOOD';
    healthExplanation =
      'Healthy sales and stable product margins. Expenses are balanced and aligned with the operational budget.';
  } else if (expensePercentageUsed > 90 || targetProgressPct < 35 || cancelledOrders.length > 5) {
    businessHealth = 'WATCH';
    healthExplanation =
      'Expenses are approaching the designated monthly budget limit, or profit progress requires steady sales momentum.';
  } else {
    businessHealth = 'NEEDS ATTENTION';
    healthExplanation =
      'Operating expenses exceed current targets or order cancellation rate is high. Immediate cost review recommended.';
  }

  // Best Sellers (Exclude cancelled orders)
  const productStatsMap: Record<
    string,
    {
      productId: string;
      productName: string;
      imageUrl: string;
      category: string;
      quantitySold: number;
      revenue: number;
      buyingCost: number;
      profit: number;
      profitMargin: number;
    }
  > = {};

  // Initialize with all products
  allProducts.forEach((p) => {
    productStatsMap[p.id] = {
      productId: p.id,
      productName: p.name,
      imageUrl: p.imageUrl,
      category: p.category,
      quantitySold: 0,
      revenue: 0,
      buyingCost: 0,
      profit: 0,
      profitMargin: 0,
    };
  });

  validFinancialOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!productStatsMap[item.productId]) {
        productStatsMap[item.productId] = {
          productId: item.productId,
          productName: item.productNameSnapshot,
          imageUrl: item.imageUrlSnapshot || '',
          category: 'General',
          quantitySold: 0,
          revenue: 0,
          buyingCost: 0,
          profit: 0,
          profitMargin: 0,
        };
      }
      const st = productStatsMap[item.productId];
      st.quantitySold += item.quantity;
      st.revenue += item.lineRevenue;
      st.buyingCost += item.lineBuyingCost;
      st.profit += item.lineProfit;
    });
  });

  const productPerformanceList = Object.values(productStatsMap).map((item) => {
    item.profitMargin =
      item.revenue > 0 ? Number(((item.profit / item.revenue) * 100).toFixed(1)) : 0;
    return item;
  });

  // Sort best sellers by quantity sold desc
  const bestSellers = [...productPerformanceList]
    .filter((p) => p.quantitySold > 0)
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 10);

  // Items to watch (low volume or low margin)
  const itemsToWatch = [...productPerformanceList]
    .filter((p) => p.quantitySold < 15 || p.profitMargin < 45)
    .sort((a, b) => a.quantitySold - b.quantitySold)
    .slice(0, 8)
    .map((item) => {
      let watchStatus: 'PRETTY' | 'GOOD' | 'WATCH' = 'WATCH';
      if (item.quantitySold >= 10 && item.profitMargin >= 45) {
        watchStatus = 'PRETTY';
      } else if (item.quantitySold >= 5) {
        watchStatus = 'GOOD';
      }
      return {
        ...item,
        status: watchStatus,
      };
    });

  // Time-series Chart Data (grouped by day)
  const timeSeriesMap: Record<
    string,
    { date: string; revenue: number; orders: number; profit: number; expenses: number }
  > = {};

  // Build daily timeline between start and end
  const curDay = new Date(range.startDate);
  while (curDay <= range.endDate) {
    const key = curDay.toISOString().split('T')[0];
    timeSeriesMap[key] = {
      date: key,
      revenue: 0,
      orders: 0,
      profit: 0,
      expenses: 0,
    };
    curDay.setDate(curDay.getDate() + 1);
  }

  validFinancialOrders.forEach((o) => {
    const key = o.createdAt.split('T')[0];
    if (timeSeriesMap[key]) {
      timeSeriesMap[key].revenue += o.subtotal || 0;
      timeSeriesMap[key].profit += o.totalProfit || 0;
      timeSeriesMap[key].orders += 1;
    }
  });

  currentExpenses.forEach((e) => {
    const key = e.date.split('T')[0];
    if (timeSeriesMap[key]) {
      timeSeriesMap[key].expenses += e.amount;
    }
  });

  const timeSeriesData = Object.values(timeSeriesMap).sort((a, b) => a.date.localeCompare(b.date));

  // Category breakdown
  const categorySalesMap: Record<string, { category: string; revenue: number; profit: number; quantity: number }> = {};
  validFinancialOrders.forEach((order) => {
    order.items.forEach((item) => {
      const prod = allProducts.find((p) => p.id === item.productId);
      const cat = prod?.category || 'Other';
      if (!categorySalesMap[cat]) {
        categorySalesMap[cat] = { category: cat, revenue: 0, profit: 0, quantity: 0 };
      }
      categorySalesMap[cat].revenue += item.lineRevenue;
      categorySalesMap[cat].profit += item.lineProfit;
      categorySalesMap[cat].quantity += item.quantity;
    });
  });

  const categorySales = Object.values(categorySalesMap).sort((a, b) => b.revenue - a.revenue);

  return {
    period: {
      filterType,
      startDate: range.startDate.toISOString(),
      endDate: range.endDate.toISOString(),
    },
    kpis: {
      totalOrders: totalOrdersCount,
      completedOrders: completedOrders.length,
      pendingOrders: pendingOrders.length,
      cancelledOrders: cancelledOrders.length,
      totalRevenue,
      totalProductBuyingCost,
      productProfit,
      totalOtherExpenses,
      finalBusinessProfit,
      averageOrderValue,
      profitMargin,
    },
    comparison: {
      revenue: revenueComparison,
      orders: orderComparison,
      profit: profitComparison,
      expenses: expenseComparison,
    },
    targets: {
      profitTarget,
      targetProgressPct,
      targetRemaining,
      targetStatus,
      expenseBudget,
      expensePercentageUsed,
      expenseRemaining,
      expenseStatus,
    },
    businessHealth: {
      status: businessHealth,
      explanation: healthExplanation,
      profitMargin,
    },
    bestSellers,
    itemsToWatch,
    productPerformance: productPerformanceList,
    categorySales,
    timeSeriesData,
  };
}
