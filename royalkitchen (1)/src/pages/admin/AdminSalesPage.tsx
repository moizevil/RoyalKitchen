import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Percent,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { AnalyticsSummary, PeriodFilter } from '../../types';

export const AdminSalesPage: React.FC = () => {
  const { authFetch } = useAuth();
  const [period, setPeriod] = useState<PeriodFilter>('THIS_MONTH');
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/analytics/sales?period=${period}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load sales analytics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [period]);

  const kpis = data?.kpis;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            SALES & REVENUE INTELLIGENCE
          </h1>
          <p className="text-xs text-zinc-400">
            In-depth analysis of revenue, product margins, and cash flow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-300">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="PREVIOUS_MONTH">Previous Month</option>
            </select>
          </div>

          <button
            onClick={fetchSales}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Financial Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Total Sales Revenue</span>
          <div className="text-2xl font-black text-white">
            Rs. {(kpis?.totalRevenue || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-zinc-500">Gross customer billings</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Product Buying Cost</span>
          <div className="text-2xl font-black text-rose-400">
            Rs. {(kpis?.totalProductBuyingCost || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-zinc-500">Inventory & meat overhead</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Product Gross Profit</span>
          <div className="text-2xl font-black text-emerald-400">
            Rs. {(kpis?.productProfit || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-zinc-500">50% gross profit formula</span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-zinc-900 border-2 border-amber-500/50 space-y-2">
          <span className="text-[10px] uppercase font-black text-amber-400">Final Net Profit</span>
          <div className="text-2xl font-black text-white">
            Rs. {(kpis?.finalBusinessProfit || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-zinc-300">
            Margin: {(kpis?.profitMargin || 0).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Revenue by Category Bar Chart */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white uppercase tracking-wide">
          Sales Volume by Category
        </h3>

        <div className="h-72 w-full">
          {data?.charts?.categoryBreakdown && data.charts.categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="category" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="revenue" name="Revenue (Rs.)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
              No sales data recorded in this period.
            </div>
          )}
        </div>
      </div>

      {/* Top Performers Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wide">
          Top Performing Menu Items
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase text-[10px] border-b border-zinc-800">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Dish Name</th>
                <th className="p-3 text-center">Units Sold</th>
                <th className="p-3 text-right">Revenue Generated</th>
                <th className="p-3 text-right">Product Profit</th>
                <th className="p-3 text-right">Profit Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {(data?.bestSellers || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-zinc-500">
                    No sales data available.
                  </td>
                </tr>
              ) : (
                data?.bestSellers.map((item, idx) => (
                  <tr key={item.productId} className="hover:bg-zinc-800/40">
                    <td className="p-3 font-mono font-bold text-amber-400">#{idx + 1}</td>
                    <td className="p-3 font-bold text-white">{item.productName}</td>
                    <td className="p-3 text-center font-mono">{item.quantitySold}</td>
                    <td className="p-3 text-right font-bold text-white">
                      Rs. {item.revenue.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      Rs. {item.profit.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono text-zinc-400">
                      {kpis?.totalRevenue && kpis.totalRevenue > 0
                        ? ((item.revenue / kpis.totalRevenue) * 100).toFixed(1)
                        : 0}
                      %
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
