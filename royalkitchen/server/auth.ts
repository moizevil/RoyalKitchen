import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from './db';

export interface AuthenticatedRequest extends Request {
  adminUser?: {
    userId: string;
    username: string;
  };
}

export interface CustomerAuthenticatedRequest extends Request {
  customerUser?: {
    userId: string;
    username: string;
    role: 'customer';
  };
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers['x-admin-token']) {
    token = String(req.headers['x-admin-token']);
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Admin login required.' });
  }

  const session = db.getSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please login again.' });
  }

  req.adminUser = {
    userId: session.userId,
    username: session.username,
  };

  next();
}

export function requireCustomerAuth(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers['x-customer-token']) {
    token = String(req.headers['x-customer-token']);
  }

  if (!token) {
    return res.status(401).json({ error: 'Customer login required. Please sign in or create an account.' });
  }

  const session = db.getCustomerSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please login again.' });
  }

  req.customerUser = {
    userId: session.userId,
    username: session.username,
    role: 'customer',
  };

  next();
}

export function optionalCustomerAuth(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers['x-customer-token']) {
    token = String(req.headers['x-customer-token']);
  }

  if (token) {
    const session = db.getCustomerSession(token);
    if (session) {
      req.customerUser = {
        userId: session.userId,
        username: session.username,
        role: 'customer',
      };
    }
  }

  next();
}

export function loginCustomer(username: string, password: string): { token?: string; user?: any; error?: string } {
  const user = db.getUser(username);
  if (!user || user.role !== 'customer') {
    return { error: 'Invalid username or password' };
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return { error: 'Invalid username or password' };
  }

  const token = generateToken();
  db.createCustomerSession(user.id, user.username, token);
  db.logActivity('Customer Login', `Customer @${user.username} logged in.`, user.username);

  return {
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
  };
}

export function loginAdmin(username: string, password: string): { token?: string; error?: string } {
  const user = db.getUser(username);
  if (!user) {
    return { error: 'Invalid username or password' };
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return { error: 'Invalid username or password' };
  }

  const token = generateToken();
  db.createSession(user.id, user.username, token);
  db.logActivity('Admin Login', `Admin ${user.username} logged in.`, user.username);

  return { token };
}
