import { Router } from 'express';
import { db } from '../db';
import { requireAdminAuth, AuthenticatedRequest } from '../auth';

export const settingsRouter = Router();

// GET /api/settings - Public store settings
settingsRouter.get('/', (req, res) => {
  const settings = db.getSettings();
  const isOpen = db.isRestaurantOpenNow(settings);

  const openTime12 = db.formatTime12(settings.openingTime);
  const closeTime12 = db.formatTime12(settings.closingTime);

  const closedMessage = `Royal Kitchen is currently closed. Online ordering is available from ${openTime12} to ${closeTime12}.`;

  return res.json({
    restaurantName: settings.restaurantName,
    whatsappNumber: settings.whatsappNumber,
    whatsappInternational: settings.whatsappInternational,
    serviceArea: settings.serviceArea,
    openingTime: settings.openingTime,
    closingTime: settings.closingTime,
    openingTimeFormatted: openTime12,
    closingTimeFormatted: closeTime12,
    deliveryCharge: settings.deliveryCharge,
    currency: settings.currency || 'Rs.',
    timezone: settings.timezone,
    isOpen,
    closedMessage,
  });
});

// GET /api/admin/settings - Full settings for admin
settingsRouter.get('/admin', requireAdminAuth, (req, res) => {
  const settings = db.getSettings();
  const isOpen = db.isRestaurantOpenNow(settings);
  return res.json({
    ...settings,
    isOpen,
  });
});

// PUT /api/admin/settings - Update settings
settingsRouter.put('/admin', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  const {
    restaurantName,
    whatsappNumber,
    whatsappInternational,
    serviceArea,
    openingTime,
    closingTime,
    deliveryCharge,
    currency,
    defaultCostPercentage,
    expenseBudget,
    profitTarget,
  } = req.body;

  const updates: any = {};
  if (restaurantName !== undefined) updates.restaurantName = restaurantName;
  if (whatsappNumber !== undefined) updates.whatsappNumber = whatsappNumber;
  if (whatsappInternational !== undefined) updates.whatsappInternational = whatsappInternational;
  if (serviceArea !== undefined) updates.serviceArea = serviceArea;
  if (openingTime !== undefined) updates.openingTime = openingTime;
  if (closingTime !== undefined) updates.closingTime = closingTime;
  if (deliveryCharge !== undefined) updates.deliveryCharge = Number(deliveryCharge);
  if (currency !== undefined) updates.currency = currency;
  if (defaultCostPercentage !== undefined) updates.defaultCostPercentage = Number(defaultCostPercentage);
  if (expenseBudget !== undefined) updates.expenseBudget = Number(expenseBudget);
  if (profitTarget !== undefined) updates.profitTarget = Number(profitTarget);

  const updated = db.updateSettings(updates, req.adminUser!.username);
  return res.json({
    success: true,
    message: 'Settings saved successfully',
    settings: updated,
  });
});
