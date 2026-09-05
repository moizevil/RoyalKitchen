import React, { useState, useEffect } from 'react';
import { Target, Receipt, CheckCircle, AlertTriangle, Sparkles, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export const AdminTargetsPage: React.FC = () => {
  const { authFetch } = useAuth();
  const { settings, refreshSettings } = useStore();

  const [profitTarget, setProfitTarget] = useState<number>(60000);
  const [expenseBudget, setExpenseBudget] = useState<number>(50000);
  const [analytics, setAnalytics] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setProfitTarget(settings.profitTarget || 60000);
      setExpenseBudget(settings.expenseBudget || 50000);
    }
  }, [settings]);

  const fetchCurrentProgress = async () => {
    try {
      const res = await authFetch('/api/analytics/dashboard?period=THIS_MONTH');
      if (res.ok) {
        const json = await res.json();
        setAnalytics(json.kpis);
      }
    } catch (e) {
      console.error('Failed to load target analytics', e);
    }
  };

  useEffect(() => {
    fetchCurrentProgress();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await authFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profitTarget: Number(profitTarget),
          expenseBudget: Number(expenseBudget),
        }),
      });

      if (res.ok) {
        setMessage('Targets and budgets updated successfully!');
        await refreshSettings();
        await fetchCurrentProgress();
      } else {
        setMessage('Failed to update targets.');
      }
    } catch {
      setMessage('Error updating targets.');
    } finally {
      setSaving(false);
    }
  };

  const currentProfit = analytics?.finalBusinessProfit || 0;
  const currentExpenses = analytics?.otherBusinessExpenses || 0;

  const profitProgress = profitTarget > 0 ? (currentProfit / profitTarget) * 100 : 0;
  const expenseProgress = expenseBudget > 0 ? (currentExpenses / expenseBudget) * 100 : 0;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">
          TARGETS & BUDGET PLANNING
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Set financial goals and monitor monthly profit benchmarks and spending limits
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Visual Live Benchmarks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profit Target Card */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400">
                  Monthly Profit Target
                </span>
                <h3 className="text-lg font-black text-white">
                  Rs. {profitTarget.toLocaleString()}
                </h3>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                profitProgress >= 100
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                  : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              {profitProgress >= 100 ? 'TARGET ACHIEVED 🎉' : `${profitProgress.toFixed(1)}%`}
            </span>
          </div>

          <div>
            <div className="h-3 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(0, profitProgress))}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-400 mt-2">
              <span>Current Month: Rs. {currentProfit.toLocaleString()}</span>
              <span>
                To Go: Rs. {Math.max(0, profitTarget - currentProfit).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Expense Budget Card */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400">
                  Monthly Expense Budget
                </span>
                <h3 className="text-lg font-black text-white">
                  Rs. {expenseBudget.toLocaleString()}
                </h3>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                expenseProgress > 100
                  ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                  : expenseProgress > 85
                  ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {expenseProgress > 100
                ? 'OVER BUDGET'
                : expenseProgress > 85
                ? 'NEAR BUDGET'
                : 'WITHIN BUDGET'}
            </span>
          </div>

          <div>
            <div className="h-3 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${
                  expenseProgress > 100
                    ? 'bg-rose-500'
                    : expenseProgress > 85
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, expenseProgress))}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-400 mt-2">
              <span>Used: Rs. {currentExpenses.toLocaleString()}</span>
              <span>
                Remaining: Rs. {Math.max(0, expenseBudget - currentExpenses).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-6">
        <h3 className="text-lg font-bold text-white uppercase tracking-wide">
          Update Targets Configuration
        </h3>

        <form onSubmit={handleSave} className="space-y-5 text-xs max-w-xl">
          <div>
            <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Monthly Profit Target (Rs.)
            </label>
            <input
              type="number"
              required
              min={1000}
              step={1000}
              value={profitTarget}
              onChange={(e) => setProfitTarget(Number(e.target.value))}
              id="profit-target-input"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-amber-400 font-bold text-sm focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              The benchmark net profit you aim to generate after all product buying costs and overheads.
            </p>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Monthly Expense Budget Ceiling (Rs.)
            </label>
            <input
              type="number"
              required
              min={1000}
              step={1000}
              value={expenseBudget}
              onChange={(e) => setExpenseBudget(Number(e.target.value))}
              id="expense-budget-input"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-orange-400 font-bold text-sm focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              The maximum allowable operational spending for gas, electricity, packaging, and repairs.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            id="save-targets-btn"
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Target Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};
