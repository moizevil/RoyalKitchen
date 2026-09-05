import { Router } from 'express';
import { db } from '../db';
import { requireAdminAuth, AuthenticatedRequest } from '../auth';

export const expenseRouter = Router();

// GET /api/expenses/budget-status
expenseRouter.get('/budget-status', requireAdminAuth, (req, res) => {
  const settings = db.getSettings();
  const allExpenses = db.getExpenses();

  // Current month expenses
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const monthExpenses = allExpenses.filter((e) => e.date >= startOfMonth && e.date <= endOfMonth);
  const totalUsed = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const budget = settings.expenseBudget || 50000;
  const remaining = Math.max(0, budget - totalUsed);
  const percentageUsed = budget > 0 ? (totalUsed / budget) * 100 : 0;

  const status =
    percentageUsed > 100
      ? 'OVER_BUDGET'
      : percentageUsed >= 90
      ? 'BUDGET_FULL'
      : 'WITHIN_BUDGET';

  return res.json({
    totalUsed,
    budget,
    remaining,
    percentageUsed,
    status,
  });
});

// GET /api/expenses - List expenses
expenseRouter.get('/', requireAdminAuth, (req, res) => {
  const { category, search, startDate, endDate } = req.query;
  let expenses = db.getExpenses();

  if (category && category !== 'ALL') {
    expenses = expenses.filter((e) => e.category.toLowerCase() === String(category).toLowerCase());
  }

  if (startDate) {
    expenses = expenses.filter((e) => e.date >= String(startDate));
  }
  if (endDate) {
    expenses = expenses.filter((e) => e.date <= String(endDate));
  }

  if (search) {
    const q = String(search).toLowerCase();
    expenses = expenses.filter(
      (e) =>
        (e.name || (e as any).title || '').toLowerCase().includes(q) ||
        (e.notes && e.notes.toLowerCase().includes(q))
    );
  }

  const normalized = expenses.map((e) => ({
    ...e,
    title: (e as any).title || e.name,
    name: e.name || (e as any).title,
  }));

  return res.json(normalized);
});

// POST /api/expenses - Add expense
expenseRouter.post('/', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  const title = req.body.title || req.body.name;
  const { amount, category, date, notes } = req.body;

  if (!title || amount === undefined || !category || !date) {
    return res.status(400).json({ error: 'Title/name, amount, category, and date are required' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  const newExp = db.addExpense(
    {
      name: String(title).trim(),
      amount: numAmount,
      category,
      date,
      notes: (notes || '').trim(),
    },
    req.adminUser!.username
  );

  return res.status(201).json({
    ...newExp,
    title: newExp.name,
  });
});

// PUT /api/expenses/:id - Update expense
expenseRouter.put('/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const updates: any = {};

  const title = req.body.title || req.body.name;
  if (title !== undefined) updates.name = String(title).trim();
  if (req.body.amount !== undefined) updates.amount = Number(req.body.amount);
  if (req.body.category !== undefined) updates.category = req.body.category;
  if (req.body.date !== undefined) updates.date = req.body.date;
  if (req.body.notes !== undefined) updates.notes = (req.body.notes || '').trim();

  const updated = db.updateExpense(id, updates, req.adminUser!.username);
  if (!updated) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  return res.json({
    ...updated,
    title: updated.name,
  });
});

// DELETE /api/expenses/:id - Delete expense
expenseRouter.delete('/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const success = db.deleteExpense(id, req.adminUser!.username);
  if (!success) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  return res.json({ success: true, message: 'Expense deleted successfully' });
});
