import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Receipt,
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  X,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Expense, ExpenseCategory } from '../../types';

export const AdminExpensesPage: React.FC = () => {
  const { authFetch } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [budgetStatus, setBudgetStatus] = useState<any>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('GAS');
  const [amount, setAmount] = useState<number>(1000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const expenseCategories: ExpenseCategory[] = [
    'GAS',
    'ELECTRICITY',
    'PACKAGING',
    'DELIVERY',
    'MARKETING',
    'MAINTENANCE',
    'EQUIPMENT',
    'INGREDIENTS',
    'OTHER',
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expRes, budgetRes] = await Promise.all([
        authFetch('/api/expenses'),
        authFetch('/api/expenses/budget-status'),
      ]);

      if (expRes.ok) {
        const expData = await expRes.json();
        setExpenses(expData);
      }
      if (budgetRes.ok) {
        const bData = await budgetRes.json();
        setBudgetStatus(bData);
      }
    } catch (e) {
      console.error('Failed to load expenses', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setCategory('GAS');
    setAmount(1500);
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setTitle(exp.title);
    setCategory(exp.category);
    setAmount(exp.amount);
    setDate(exp.date);
    setNotes(exp.notes || '');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, expTitle: string) => {
    if (!window.confirm(`Delete expense record "${expTitle}"?`)) return;

    try {
      const res = await authFetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        fetchData(); // refresh budget
      }
    } catch (e) {
      console.error('Failed to delete expense', e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setModalError('Expense description/title is required.');
      return;
    }
    if (amount <= 0) {
      setModalError('Amount must be greater than zero.');
      return;
    }

    const payload = {
      title: title.trim(),
      category,
      amount: Number(amount),
      date,
      notes: notes.trim(),
    };

    try {
      let res: Response;
      if (editingId) {
        res = await authFetch(`/api/expenses/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await authFetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        setModalError(err.error || 'Failed to save expense.');
      }
    } catch {
      setModalError('Network error while saving expense.');
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesCat = selectedCategory === 'ALL' || e.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      (e.notes && e.notes.toLowerCase().includes(q));

    return matchesCat && matchesSearch;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            EXPENSE & BUDGET MANAGEMENT
          </h1>
          <p className="text-xs text-zinc-400">
            Log gas cylinders, electricity bills, packaging, and kitchen overheads
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          id="log-new-expense-btn"
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Log New Expense
        </button>
      </div>

      {/* Monthly Budget Card */}
      {budgetStatus && (
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Monthly Operating Budget Status
              </span>
              <h2 className="text-lg font-black text-white mt-0.5">
                Rs. {budgetStatus.totalUsed.toLocaleString()} Used of Rs.{' '}
                {budgetStatus.budget.toLocaleString()}
              </h2>
            </div>

            <span
              className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                budgetStatus.status === 'OVER_BUDGET'
                  ? 'bg-rose-950 text-rose-400 border border-rose-500/50'
                  : budgetStatus.status === 'BUDGET_FULL'
                  ? 'bg-amber-950 text-amber-400 border border-amber-500/50'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
              }`}
            >
              {budgetStatus.status === 'OVER_BUDGET'
                ? 'OVER BUDGET'
                : budgetStatus.status === 'BUDGET_FULL'
                ? 'BUDGET FULL'
                : 'WITHIN BUDGET'}
            </span>
          </div>

          <div>
            <div className="h-3 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${
                  budgetStatus.percentageUsed > 100
                    ? 'bg-rose-500'
                    : budgetStatus.percentageUsed > 85
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, budgetStatus.percentageUsed))}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-400 mt-2">
              <span>{budgetStatus.percentageUsed.toFixed(1)}% of budget utilized</span>
              <span>
                Remaining:{' '}
                <strong className="text-white">
                  Rs. {budgetStatus.remaining.toLocaleString()}
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Category Pills & Search */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            All
          </button>
          {expenseCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expense description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>
            Showing <strong className="text-white">{filteredExpenses.length}</strong> records
          </span>
          <span>
            Total in view:{' '}
            <strong className="text-amber-400 font-mono text-sm">
              Rs. {totalFilteredAmount.toLocaleString()}
            </strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-800 text-[10px]">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Title / Description</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Amount (Rs.)</th>
                <th className="p-4">Notes</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4 font-mono text-zinc-400">{exp.date}</td>
                    <td className="p-4 font-bold text-white">{exp.title}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 font-bold text-[10px] uppercase">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4 text-right font-black text-rose-400 text-sm font-mono">
                      Rs. {exp.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-zinc-400 text-[11px] max-w-xs truncate">
                      {exp.notes || '—'}
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id, exp.title)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT EXPENSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                {editingId ? 'Edit Expense' : 'Log New Expense'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. LPG Gas Cylinder refill"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {expenseCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                    Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-rose-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Receipt details, vendor name, or quantity"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black uppercase tracking-wider"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
