import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Printer,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  FileText,
  DollarSign,
  Receipt,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { PeriodFilter } from '../../types';

export const AdminReportsPage: React.FC = () => {
  const { authFetch } = useAuth();
  const [period, setPeriod] = useState<PeriodFilter>('THIS_MONTH');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/analytics/reports?period=${period}`);
      if (res.ok) {
        const json = await res.json();
        setReport(json);
      }
    } catch (e) {
      console.error('Failed to load financial reports', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period]);

  const handlePrint = () => {
    window.print();
  };

  const comparisons = report?.comparisons || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            EXECUTIVE FINANCIAL REPORTS
          </h1>
          <p className="text-xs text-zinc-400">
            Comparative performance statements and variance analysis
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
              <option value="TODAY">Today vs Yesterday</option>
              <option value="LAST_7_DAYS">Last 7 Days vs Prior 7</option>
              <option value="LAST_30_DAYS">Last 30 Days vs Prior 30</option>
              <option value="THIS_MONTH">This Month vs Prev Month</option>
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>

          <button
            onClick={fetchReport}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Variance & Period Comparison Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 bg-zinc-950 border-b border-zinc-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">
            Variance Comparison vs Previous Period
          </h3>
          <p className="text-xs text-zinc-400">
            Comparing current active window against equal previous timeframe
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 text-zinc-400 font-bold uppercase text-[10px] border-b border-zinc-800">
              <tr>
                <th className="p-4">Key Metric</th>
                <th className="p-4 text-right">Current Period</th>
                <th className="p-4 text-right">Previous Period</th>
                <th className="p-4 text-right">Net Change</th>
                <th className="p-4 text-right">% Change</th>
                <th className="p-4 text-center">Trend Direction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {comparisons.map((c: any) => {
                const isPositive = c.change > 0;
                const isZero = c.change === 0;
                return (
                  <tr key={c.metric} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4 font-bold text-white">{c.metric}</td>
                    <td className="p-4 text-right font-black font-mono text-white">
                      {c.format === 'currency' ? `Rs. ${c.current.toLocaleString()}` : c.current}
                    </td>
                    <td className="p-4 text-right font-mono text-zinc-400">
                      {c.format === 'currency' ? `Rs. ${c.previous.toLocaleString()}` : c.previous}
                    </td>
                    <td
                      className={`p-4 text-right font-bold font-mono ${
                        isZero
                          ? 'text-zinc-500'
                          : isPositive
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {c.format === 'currency' ? `Rs. ${c.change.toLocaleString()}` : c.change}
                    </td>
                    <td
                      className={`p-4 text-right font-bold font-mono ${
                        isZero
                          ? 'text-zinc-500'
                          : isPositive
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {c.percentChange.toFixed(1)}%
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.direction === 'UP'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                            : c.direction === 'DOWN'
                            ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {c.direction === 'UP' && <ArrowUp className="w-3 h-3" />}
                        {c.direction === 'DOWN' && <ArrowDown className="w-3 h-3" />}
                        {c.direction === 'NO_CHANGE' && <Minus className="w-3 h-3" />}
                        {c.direction}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Income Statement Summary */}
      <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              PRO FORMA INCOME STATEMENT
            </h3>
            <p className="text-xs text-zinc-400">
              Royal Kitchen Sargodha • Cash Basis Accounting
            </p>
          </div>
          <span className="px-3 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono text-xs font-bold">
            Period: {period.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Revenue */}
          <div className="flex justify-between items-center py-2 text-zinc-300 font-bold border-b border-zinc-800">
            <span>Gross Delivered Sales Revenue</span>
            <span className="text-white font-mono text-sm">
              Rs. {(report?.current?.totalRevenue || 0).toLocaleString()}
            </span>
          </div>

          {/* Cost of Goods Sold */}
          <div className="flex justify-between items-center py-2 text-zinc-400 pl-4 border-b border-zinc-800/60">
            <span>Less: Raw Food Product Buying Costs (50% Standard)</span>
            <span className="text-rose-400 font-mono">
              (Rs. {(report?.current?.totalProductBuyingCost || 0).toLocaleString()})
            </span>
          </div>

          {/* Gross Profit */}
          <div className="flex justify-between items-center py-2 text-emerald-400 font-black border-b border-zinc-800">
            <span>GROSS PRODUCT PROFIT</span>
            <span className="font-mono text-sm">
              Rs. {(report?.current?.productProfit || 0).toLocaleString()}
            </span>
          </div>

          {/* Operating Overheads */}
          <div className="flex justify-between items-center py-2 text-zinc-400 pl-4 border-b border-zinc-800/60">
            <span>Less: Other Operating Expenses (Gas, Power, Packaging, Deliveries)</span>
            <span className="text-orange-400 font-mono">
              (Rs. {(report?.current?.otherBusinessExpenses || 0).toLocaleString()})
            </span>
          </div>

          {/* Net Profit */}
          <div className="flex justify-between items-center py-3 bg-zinc-950/80 px-4 rounded-xl border border-amber-500/40 text-base font-black text-white">
            <span className="text-amber-400">FINAL NET BUSINESS PROFIT</span>
            <span className="text-amber-400 font-mono text-lg">
              Rs. {(report?.current?.finalBusinessProfit || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
