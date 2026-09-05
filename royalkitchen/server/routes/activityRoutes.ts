import { Router } from 'express';
import { db } from '../db';
import { requireAdminAuth } from '../auth';

export const activityRouter = Router();

// GET /api/admin/activity - Admin activity logs
activityRouter.get('/', requireAdminAuth, (req, res) => {
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 100;
  const logs = db.getActivityLogs(limit);
  return res.json(logs);
});
