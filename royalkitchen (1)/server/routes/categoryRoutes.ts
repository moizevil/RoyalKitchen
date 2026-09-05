import { Router } from 'express';
import { db } from '../db';
import { requireAdminAuth, AuthenticatedRequest } from '../auth';

export const categoryRouter = Router();

// GET /api/categories - Public categories (visible only)
categoryRouter.get('/', (req, res) => {
  const categories = db.getCategories(false);
  return res.json(categories);
});

// GET /api/admin/categories - All categories for admin
categoryRouter.get('/admin', requireAdminAuth, (req, res) => {
  const categories = db.getCategories(true);
  return res.json(categories);
});

// POST /api/admin/categories - Add category
categoryRouter.post('/admin', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const newCat = db.addCategory(name.trim(), req.adminUser!.username);
  return res.status(201).json({ success: true, category: newCat });
});

// PUT /api/admin/categories/:id - Update category
categoryRouter.put('/admin/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { name, displayOrder, visible } = req.body;

  const updates: any = {};
  if (name !== undefined) updates.name = name.trim();
  if (displayOrder !== undefined) updates.displayOrder = Number(displayOrder);
  if (visible !== undefined) updates.visible = Boolean(visible);

  const updated = db.updateCategory(id, updates, req.adminUser!.username);
  if (!updated) {
    return res.status(404).json({ error: 'Category not found' });
  }

  return res.json({ success: true, category: updated });
});

// DELETE /api/admin/categories/:id - Delete category
categoryRouter.delete('/admin/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const success = db.deleteCategory(id, req.adminUser!.username);
  if (!success) {
    return res.status(404).json({ error: 'Category not found' });
  }
  return res.json({ success: true, message: 'Category deleted successfully' });
});
