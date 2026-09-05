import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { authRouter } from './server/routes/authRoutes';
import { productRouter, adminProductRouter, upload } from './server/routes/productRoutes';
import { categoryRouter } from './server/routes/categoryRoutes';
import { orderRouter } from './server/routes/orderRoutes';
import { expenseRouter } from './server/routes/expenseRoutes';
import { settingsRouter } from './server/routes/settingsRoutes';
import { reportRouter } from './server/routes/reportRoutes';
import { activityRouter } from './server/routes/activityRoutes';
import { requireAdminAuth, AuthenticatedRequest } from './server/auth';
import { db } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static serving for uploaded pictures
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsDir));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', restaurant: 'ROYAL KITCHEN', timestamp: new Date().toISOString() });
  });

  // Admin upload image standalone endpoint
  app.post(
    '/api/admin/upload-image',
    requireAdminAuth,
    upload.single('image'),
    (req: AuthenticatedRequest, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided.' });
      }

      const relativeUrl = `/uploads/products/${req.file.filename}`;
      db.logActivity(
        'Image Uploaded',
        `Uploaded product picture ${req.file.originalname} (${(req.file.size / 1024).toFixed(0)} KB)`,
        req.adminUser?.username || 'admin'
      );

      return res.json({
        success: true,
        imageUrl: relativeUrl,
        filename: req.file.filename,
      });
    }
  );

  // Mount API routers
  app.use('/api/auth', authRouter);
  app.use('/api/products', productRouter);
  app.use('/api/admin/products', adminProductRouter);
  app.use('/api/categories', categoryRouter);
  app.use('/api/orders', orderRouter);
  app.use('/api/expenses', expenseRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/analytics', reportRouter);
  app.use('/api/reports', reportRouter);
  app.use('/api/admin/reports', reportRouter);
  app.use('/api/admin/activity', activityRouter);

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Royal Kitchen server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
