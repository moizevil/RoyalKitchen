import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Receipt,
  Percent,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Calendar,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { AnalyticsSummary, PeriodFilter } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const { authFetch } = useAuth();
  const [period, setPeriod] = useState<PeriodFilter>('THIS_MONTH');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      let url = `/api/analytics/dashboard?period=${period}`;
      if (period === 'CUSTOM' && customStart && customEnd) {
        url += `&startDate=${customStart}&endDate=${customEnd}`;
      }

      const res = await authFetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load dashboard analytics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const kpis = data?.kpis;
  const health = data?.businessHealth;

  const healthColorMap: Record<string, { bg: string; text: string; border: string; label: string }> = {
    PRETTY: {
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-400',
      border: 'border-emerald-500/50',
      label: 'PRETTY (EXCELLENT)',
    },
    GOOD: {
      bg: 'bg-teal-950/60',
      text: 'text-teal-400',
      border: 'border-teal-500/50',
      label: 'GOOD (STABLE)',
    },
    WATCH: {
      bg: 'bg-amber-950/60',
      text: 'text-amber-400',
      border: 'border-amber-500/50',
      label: 'WATCH (MONITOR CLOSELY)',
    },
    NEEDS_ATTENTION: {
      bg: 'bg-rose-950/60',
      text: 'text-rose-400',
      border: 'border-rose-500/50',
      label: 'NEEDS ATTENTION',
    },
  };

  const healthConfig = health ? healthColorMap[health.status] || healthColorMap.GOOD : healthColorMap.GOOD;

  return (
    <div className="space-y-8">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            EXECUTIVE DASHBOARD
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time financial performance and kitchen operations for Royal Kitchen
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-300">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
              id="dashboard-period-select"
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="PREVIOUS_MONTH">Previous Month</option>
              <option value="CUSTOM">Custom Range</option>
            </select>
          </div>

          {period === 'CUSTOM' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1 text-xs text-white"
              />
              <span className="text-xs text-zinc-500">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1 text-xs text-white"
              />
              <button
                onClick={fetchDashboardData}
                className="px-3 py-1 bg-amber-500 text-zinc-950 rounded-xl font-bold text-xs"
              >
                Apply
              </button>
            </div>
          )}

          <button
            onClick={fetchDashboardData}
            title="Refresh"
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Business Health Card */}
      {health && (
        <div className={`p-6 rounded-3xl border ${healthConfig.bg} ${healthConfig.border} shadow-2xl space-y-3`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-950/80 flex items-center justify-center">
                <Sparkles className={`w-5 h-5 ${healthConfig.text}`} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Business Health Assessment
                </span>
                <h2 className={`text-xl font-black ${healthConfig.text}`}>{healthConfig.label}</h2>
              </div>
            </div>

            <div className="text-xs text-zinc-300 font-semibold bg-zinc-950/60 px-4 py-2 rounded-xl border border-zinc-800">
              Profit Margin:{' '}
              <strong className="text-amber-400 font-bold">{(kpis?.profitMargin ?? 0).toFixed(1)}%</strong>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
            {health.explanation}
          </p>
        </div>
      )}

      {/* KEY FINANCIAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Total Revenue
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            Rs. {(kpis?.totalRevenue || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center gap-1">
            <span>Completed deliveries in period</span>
          </div>
        </div>

        {/* Product Buying Cost */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Product Buying Cost
            </span>
            <div className="p-2 rounded-xl bg-red-500/10 text-rose-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-200">
            Rs. {(kpis?.totalProductBuyingCost || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500">
            Raw food materials (50% formula)
          </div>
        </div>

        {/* Product Profit */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Product Profit (Gross)
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            Rs. {(kpis?.productProfit || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500">
            Revenue minus product costs
          </div>
        </div>

        {/* Other Business Expenses */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Other Business Expenses
            </span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-orange-400">
            Rs. {(kpis?.otherBusinessExpenses || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500">
            Gas, electricity, packaging, marketing
          </div>
        </div>

        {/* FINAL BUSINESS PROFIT (HERO CARD) */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-900 border-2 border-amber-500/60 shadow-2xl space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> FINAL BUSINESS PROFIT (NET)
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black">
              Margin: {(kpis?.profitMargin || 0).toFixed(1)}%
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white">
            Rs. {(kpis?.finalBusinessProfit || 0).toLocaleString()}
          </div>
          <p className="text-xs text-zinc-300">
            Net take-home profit = Product Profit (Rs. {(kpis?.productProfit || 0).toLocaleString()}) -
            Expenses (Rs. {(kpis?.otherBusinessExpenses || 0).toLocaleString()})
          </p>
        </div>

        {/* Orders Count & Breakdown */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Orders Volume
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{kpis?.totalOrders || 0} Orders</div>
          <div className="grid grid-cols-3 gap-1 text-[10px] text-zinc-400 pt-1 border-t border-zinc-800">
            <div>
              <span className="text-emerald-400 font-bold block">{kpis?.completedOrders || 0}</span>
              Completed
            </div>
            <div>
              <span className="text-amber-400 font-bold block">{kpis?.pendingOrders || 0}</span>
              Pending
            </div>
            <div>
              <span className="text-rose-400 font-bold block">{kpis?.cancelledOrders || 0}</span>
              Cancelled
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Average Order Value
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            Rs. {Math.round(kpis?.averageOrderValue || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500">Average ticket per completed order</div>
        </div>
      </div>

      {/* TARGET & BUDGET PROGRESS BARS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Profit Target */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wide">
                Profit Target Progress
              </h3>
            </div>
            <span className="text-xs font-black text-amber-400">
              {(kpis?.profitTargetProgress || 0).toFixed(1)}% Achieved
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
              <span>Current Profit: Rs. {(kpis?.finalBusinessProfit || 0).toLocaleString()}</span>
              <span>Target: Rs. {(kpis?.profitTarget || 60000).toLocaleString()}</span>
            </div>
            <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.max(0, kpis?.profitTargetProgress || 0))}%`,
                }}
              />
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center justify-between">
            <span>
              Remaining to target: Rs.{' '}
              {Math.max(
                0,
                (kpis?.profitTarget || 60000) - (kpis?.finalBusinessProfit || 0)
              ).toLocaleString()}
            </span>
            {(kpis?.profitTargetProgress || 0) >= 100 && (
              <span className="text-emerald-400 font-bold uppercase">Target Achieved! 🎉</span>
            )}
          </div>
        </div>

        {/* Monthly Expense Budget */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-orange-400" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wide">
                Expense Budget Tracking
              </h3>
            </div>
            <span
              className={`text-xs font-black uppercase ${
                (kpis?.expenseBudgetProgress || 0) > 100
                  ? 'text-rose-400'
                  : (kpis?.expenseBudgetProgress || 0) > 85
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {(kpis?.expenseBudgetProgress || 0).toFixed(1)}% Used
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
              <span>Used: Rs. {(kpis?.otherBusinessExpenses || 0).toLocaleString()}</span>
              <span>Budget: Rs. {(kpis?.expenseBudget || 50000).toLocaleString()}</span>
            </div>
            <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${
                  (kpis?.expenseBudgetProgress || 0) > 100
                    ? 'bg-rose-500'
                    : (kpis?.expenseBudgetProgress || 0) > 85
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{
                  width: `${Math.min(100, Math.max(0, kpis?.expenseBudgetProgress || 0))}%`,
                }}
              />
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center justify-between">
            <span>
              Remaining Budget: Rs.{' '}
              {Math.max(
                0,
                (kpis?.expenseBudget || 50000) - (kpis?.otherBusinessExpenses || 0)
              ).toLocaleString()}
            </span>
            <span
              className={`font-bold ${
                (kpis?.otherBusinessExpenses || 0) > (kpis?.expenseBudget || 50000)
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`}
            >
              {(kpis?.otherBusinessExpenses || 0) > (kpis?.expenseBudget || 50000)
                ? 'OVER BUDGET'
                : 'WITHIN BUDGET'}
            </span>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue & Profit Trend */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              Revenue & Profit Timeline
            </h3>
            <p className="text-xs text-zinc-400">Daily performance over selected period</p>
          </div>

          <div className="h-72 w-full">
            {data?.charts?.revenueOverTime && data.charts.revenueOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.charts.revenueOverTime}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#3f3f46',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue (Rs.)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="Product Profit (Rs.)"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                No revenue records in this timeframe.
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              Sales by Menu Category
            </h3>
            <p className="text-xs text-zinc-400">Revenue contribution per department</p>
          </div>

          <div className="h-72 w-full">
            {data?.charts?.categoryBreakdown && data.charts.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.categoryBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis type="number" stroke="#71717a" fontSize={11} />
                  <YAxis
                    dataKey="category"
                    type="category"
                    stroke="#71717a"
                    fontSize={11}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#3f3f46',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Category Revenue (Rs.)"
                    fill="#f59e0b"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                No category sales recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BEST SELLERS & ITEMS TO WATCH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Best Sellers */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Best Sellers (Excludes Cancelled)
            </h3>
            <p className="text-xs text-zinc-400">Top revenue generating menu dishes</p>
          </div>

          <div className="divide-y divide-zinc-800">
            {(data?.bestSellers || []).length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No sales recorded yet.</p>
            ) : (
              data?.bestSellers.map((item, idx) => (
                <div key={item.productId} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 text-amber-400 font-black text-[11px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white">{item.productName}</div>
                      <div className="text-zinc-500 text-[11px]">
                        {item.quantitySold} orders • Profit: Rs. {item.profit.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-amber-400">
                      Rs. {item.revenue.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-zinc-500">Revenue</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Items to Watch */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Items To Watch
            </h3>
            <p className="text-xs text-zinc-400">
              Dishes with lower sales volume or profit margins for attention
            </p>
          </div>

          <div className="divide-y divide-zinc-800">
            {(data?.itemsToWatch || []).length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">All menu dishes are performing smoothly.</p>
            ) : (
              data?.itemsToWatch.map((item) => (
                <div key={item.productId} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{item.productName}</div>
                    <div className="text-zinc-500 text-[11px]">
                      Sold: {item.quantitySold} units • Margin: {item.profitMargin.toFixed(1)}%
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      item.status === 'PRETTY'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                        : item.status === 'GOOD'
                        ? 'bg-teal-950 text-teal-400 border border-teal-500/40'
                        : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
