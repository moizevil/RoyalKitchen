import { Router } from 'express';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { db } from '../db';
import { requireAdminAuth, AuthenticatedRequest } from '../auth';

export const productRouter = Router();
export const adminProductRouter = Router();

// Multer storage for persistent product images
const uploadsDir = path.resolve(process.cwd(), 'uploads/products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `prod-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP images are supported.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// --- PUBLIC PRODUCT ROUTER (/api/products) ---

// GET /api/products - Customer public view (confidential financial fields completely stripped)
productRouter.get('/', (req, res) => {
  const products = db.getProducts(false);
  const safeProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    price: p.price,
    imageUrl: p.imageUrl,
    available: p.available,
    featured: p.featured,
    displayOrder: p.displayOrder,
  }));
  return res.json(safeProducts);
});

// GET /api/products/:id - Single product view
productRouter.get('/:id', (req, res) => {
  const product = db.getProducts(true).find((p) => p.id === req.params.id);
  if (!product || !product.available) {
    return res.status(404).json({ error: 'Product not found' });
  }

  return res.json({
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price,
    imageUrl: product.imageUrl,
    available: product.available,
    featured: product.featured,
    displayOrder: product.displayOrder,
  });
});

// --- ADMIN PRODUCT ROUTER (/api/admin/products) ---

// GET / - Admin view with full 50/50 cost & profit calculations
adminProductRouter.get('/', requireAdminAuth, (req, res) => {
  const products = db.getProducts(true);
  const detailedProducts = products.map((p) => {
    const costPct = p.costPercentage ?? 50;
    const buyingCost = Math.round(p.price * (costPct / 100));
    const profitPerUnit = p.price - buyingCost;
    const profitMargin = p.price > 0 ? Number(((profitPerUnit / p.price) * 100).toFixed(1)) : 0;

    return {
      ...p,
      costPercentage: costPct,
      buyingCost,
      profitPerUnit,
      profitMargin,
    };
  });

  return res.json(detailedProducts);
});

// POST / - Create new product
adminProductRouter.post('/', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  const {
    name,
    description,
    category,
    price,
    costPercentage,
    imageUrl,
    available,
    featured,
    displayOrder,
  } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({ error: 'Name, category, and price are required' });
  }

  const numPrice = Number(price);
  if (isNaN(numPrice) || numPrice < 0) {
    return res.status(400).json({ error: 'Invalid price' });
  }

  const costPct = costPercentage !== undefined ? Number(costPercentage) : 50;
  const buyingCost = Math.round(numPrice * (costPct / 100));
  const profitPerUnit = numPrice - buyingCost;
  const profitMargin = numPrice > 0 ? Number(((profitPerUnit / numPrice) * 100).toFixed(1)) : 0;

  const newProd = db.addProduct(
    {
      name: name.trim(),
      description: (description || '').trim(),
      category: category.trim(),
      price: numPrice,
      costPercentage: costPct,
      imageUrl: (imageUrl || '').trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      available: available !== undefined ? Boolean(available) : true,
      featured: Boolean(featured),
      displayOrder: Number(displayOrder) || 99,
    },
    req.adminUser!.username
  );

  return res.status(201).json({
    ...newProd,
    costPercentage: costPct,
    buyingCost,
    profitPerUnit,
    profitMargin,
  });
});

// PUT /:id - Update product
adminProductRouter.put('/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const updates: any = {};

  if (req.body.name !== undefined) updates.name = req.body.name.trim();
  if (req.body.description !== undefined) updates.description = req.body.description.trim();
  if (req.body.category !== undefined) updates.category = req.body.category.trim();
  if (req.body.price !== undefined) updates.price = Number(req.body.price);
  if (req.body.costPercentage !== undefined) updates.costPercentage = Number(req.body.costPercentage);
  if (req.body.imageUrl !== undefined) updates.imageUrl = req.body.imageUrl.trim();
  if (req.body.available !== undefined) updates.available = Boolean(req.body.available);
  if (req.body.featured !== undefined) updates.featured = Boolean(req.body.featured);
  if (req.body.displayOrder !== undefined) updates.displayOrder = Number(req.body.displayOrder);

  const updated = db.updateProduct(id, updates, req.adminUser!.username);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const costPct = updated.costPercentage ?? 50;
  const buyingCost = Math.round(updated.price * (costPct / 100));
  const profitPerUnit = updated.price - buyingCost;
  const profitMargin = updated.price > 0 ? Number(((profitPerUnit / updated.price) * 100).toFixed(1)) : 0;

  return res.json({
    ...updated,
    costPercentage: costPct,
    buyingCost,
    profitPerUnit,
    profitMargin,
  });
});

// POST /:id/duplicate - Duplicate product
adminProductRouter.post('/:id/duplicate', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const dup = db.duplicateProduct(id, req.adminUser!.username);
  if (!dup) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json(dup);
});

// DELETE /:id - Delete product
adminProductRouter.delete('/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const success = db.deleteProduct(id, req.adminUser!.username);
  if (!success) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json({ success: true, message: 'Product deleted successfully' });
});

// Also forward admin endpoints on productRouter if called via /api/products/admin
productRouter.use('/admin', adminProductRouter);
