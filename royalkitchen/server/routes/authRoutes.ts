import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import {
  loginAdmin,
  loginCustomer,
  requireAdminAuth,
  requireCustomerAuth,
  generateToken,
  AuthenticatedRequest,
  CustomerAuthenticatedRequest,
} from '../auth';

export const authRouter = Router();

// ==========================================
// CUSTOMER AUTHENTICATION ROUTES
// ==========================================

// GET /api/auth/check-username?username=...
// Validates whether a username is available or already taken
authRouter.get('/check-username', (req, res) => {
  const username = String(req.query.username || '').trim();
  if (!username) {
    return res.status(400).json({ error: 'Username query parameter is required' });
  }

  const isTaken = db.isUsernameTaken(username);
  if (isTaken) {
    return res.json({
      available: false,
      error: 'user is taken',
      message: 'user is taken',
    });
  }

  return res.json({
    available: true,
    message: 'Username is available',
  });
});

// POST /api/auth/customer/register
authRouter.post('/customer/register', (req, res) => {
  const { username, password, fullName, phone, area, address } = req.body;

  if (!username || !password || !fullName || !phone || !address) {
    return res.status(400).json({
      error: 'Please fill in all required fields (username, password, name, phone, address).',
    });
  }

  const cleanUsername = String(username).trim();
  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
  }

  if (db.isUsernameTaken(cleanUsername)) {
    return res.status(400).json({ error: 'user is taken' });
  }

  if (String(password).length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(String(password), salt);

  const regResult = db.registerCustomer({
    username: cleanUsername,
    passwordHash,
    fullName: String(fullName).trim(),
    phone: String(phone).trim(),
    area: area ? String(area).trim() : 'Sargodha, Pakistan',
    address: String(address).trim(),
  });

  if (regResult.error) {
    return res.status(400).json({ error: regResult.error });
  }

  const user = regResult.user!;
  const token = generateToken();
  db.createCustomerSession(user.id, user.username, token);

  return res.status(201).json({
    success: true,
    message: 'Customer registered successfully',
    token,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName || user.username,
      phone: user.phone || '',
      area: user.area || 'Sargodha, Pakistan',
      address: user.address || '',
      role: 'customer',
    },
  });
});

// POST /api/auth/customer/login
authRouter.post('/customer/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const result = loginCustomer(String(username).trim(), String(password));
  if (result.error) {
    return res.status(401).json({ error: result.error });
  }

  return res.json({
    success: true,
    token: result.token,
    user: result.user,
  });
});

// GET /api/auth/customer/me
authRouter.get('/customer/me', requireCustomerAuth, (req: CustomerAuthenticatedRequest, res) => {
  const user = db.getUserById(req.customerUser!.userId) || db.getUser(req.customerUser!.username);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName || user.username,
      phone: user.phone || '',
      area: user.area || 'Sargodha, Pakistan',
      address: user.address || '',
      role: 'customer',
    },
  });
});

// PUT /api/auth/customer/profile
authRouter.put('/customer/profile', requireCustomerAuth, (req: CustomerAuthenticatedRequest, res) => {
  const { fullName, phone, area, address } = req.body;
  const updated = db.updateCustomerProfile(req.customerUser!.userId, {
    fullName,
    phone,
    area,
    address,
  });

  if (!updated) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  return res.json({
    success: true,
    user: {
      id: updated.id,
      username: updated.username,
      fullName: updated.fullName || updated.username,
      phone: updated.phone || '',
      area: updated.area || 'Sargodha, Pakistan',
      address: updated.address || '',
      role: 'customer',
    },
  });
});

// POST /api/auth/customer/logout
authRouter.post('/customer/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers['x-customer-token']) {
    token = String(req.headers['x-customer-token']);
  }

  if (token) {
    db.deleteCustomerSession(token);
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

// ==========================================
// ADMIN AUTHENTICATION ROUTES
// ==========================================

// POST /api/auth/login
authRouter.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const result = loginAdmin(username.trim(), password);
  if (result.error) {
    return res.status(401).json({ error: result.error });
  }

  return res.json({
    success: true,
    token: result.token,
    user: {
      username: username.trim(),
      role: 'admin',
    },
  });
});

// POST /api/auth/logout
authRouter.post('/logout', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    db.deleteSession(token);
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me
authRouter.get('/me', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  return res.json({
    user: req.adminUser,
  });
});

// POST /api/auth/change-password
authRouter.post('/change-password', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ error: 'All password fields are required' });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ error: 'New passwords do not match' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const user = db.getUser(req.adminUser!.username);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isCurrentMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!isCurrentMatch) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  const salt = bcrypt.genSaltSync(10);
  const newHash = bcrypt.hashSync(newPassword, salt);

  db.updatePassword(user.id, newHash, req.adminUser!.username);

  return res.json({ success: true, message: 'Password updated successfully' });
});
