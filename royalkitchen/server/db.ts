import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  Product,
  Category,
  Order,
  OrderItemSnapshot,
  Expense,
  StoreSettings,
  ActivityLog,
  User,
  AdminSession,
  CustomerSession,
  OrderStatus,
} from './types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_EXPENSES } from './seedData';

interface DatabaseSchema {
  users: User[];
  adminSessions: AdminSession[];
  customerSessions?: CustomerSession[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  expenses: Expense[];
  settings: StoreSettings;
  activityLogs: ActivityLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

class Database {
  private data: DatabaseSchema;
  private isLoaded = false;

  constructor() {
    this.ensureDirs();
    this.data = this.loadDatabase();
  }

  private ensureDirs() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    const productUploads = path.join(UPLOADS_DIR, 'products');
    if (!fs.existsSync(productUploads)) {
      fs.mkdirSync(productUploads, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure admin user 'moiz' has password moizkhansgd321!
        const adminInitialPassword = process.env.ADMIN_PASSWORD || 'moizkhansgd321!';
        const salt = bcrypt.genSaltSync(10);
        const newHash = bcrypt.hashSync(adminInitialPassword, salt);
        let updated = false;

        if (parsed.users && Array.isArray(parsed.users)) {
          const adminUser = parsed.users.find((u: any) => u.username.toLowerCase() === 'moiz');
          if (adminUser) {
            adminUser.passwordHash = newHash;
            updated = true;
          } else {
            parsed.users.push({
              id: 'admin-1',
              username: 'moiz',
              passwordHash: newHash,
              role: 'admin',
              createdAt: new Date().toISOString(),
            });
            updated = true;
          }
        }

        // Update service area and location to Sargodha, Pakistan
        if (parsed.settings) {
          parsed.settings.serviceArea = 'Sargodha, Pakistan';
          parsed.settings.location = 'Sargodha, Pakistan';
          parsed.settings.openingTime = '14:00';
          parsed.settings.closingTime = '00:00';
          updated = true;
        }

        if (!Array.isArray(parsed.customerSessions)) {
          parsed.customerSessions = [];
          updated = true;
        }

        if (updated) {
          this.saveDataDirect(parsed);
        }

        this.isLoaded = true;
        return parsed;
      } catch (e) {
        console.error('Error reading database file, rebuilding...', e);
      }
    }

    const initialDb = this.createInitialData();
    this.saveDataDirect(initialDb);
    this.isLoaded = true;
    return initialDb;
  }

  private createInitialData(): DatabaseSchema {
    const adminInitialPassword = process.env.ADMIN_PASSWORD || 'moizkhansgd321!';
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(adminInitialPassword, salt);

    const initialUser: User = {
      id: 'admin-1',
      username: 'moiz',
      passwordHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    };

    // Build realistic sample past orders based on specified exact quantities
    const sampleTargetQuantities: Record<string, number> = {
      'prod-1': 25, // Chicken Karahi (1 KG)
      'prod-2': 16, // Chicken Karahi (0.5 KG)
      'prod-3': 18, // Chicken Tikka Handi (1 KG)
      'prod-4': 14, // Chicken Tikka Handi (0.5 KG)
      'prod-5': 15, // Chicken Kabab Handi (1 KG)
      'prod-6': 12, // Chicken Kabab Handi (0.5 KG)
      'prod-7': 20, // Chicken White Handi (1 KG)
      'prod-8': 12, // Chicken White Handi (0.5 KG)
      'prod-9': 30, // Chicken Daal Kabab (12 Pcs)
      'prod-10': 22, // Chicken Seekh Kabab (12 Pcs)
      'prod-11': 45, // Chicken Tikka (Quarter)
      'prod-12': 35, // Chicken Tikka (Half)
      'prod-13': 12, // Chicken Tikka (Full)
      'prod-14': 16, // Nuggets (60 Pcs)
      'prod-15': 24, // Drumstick (12 Pcs)
      'prod-16': 65, // Zinger Burger
      'prod-17': 80, // Anda Burger
      'prod-18': 32, // Chicken Cold Sandwich
      'prod-19': 28, // Chicken Mayo Sandwich
      'prod-20': 24, // Chicken Hot Sandwich
      'prod-21': 20, // Chicken BBQ Hot Sandwich
      'prod-22': 40, // Chicken Biryani
      'prod-23': 35, // Chicken Pulao
      'prod-24': 18, // Chicken Macaroni (1 KG)
      'prod-25': 25, // Chicken Macaroni (0.5 KG)
      'prod-26': 15, // Vegetable Macaroni (1 KG)
      'prod-27': 20, // Vegetable Macaroni (0.5 KG)
    };

    const customerNames = [
      'Ahmed Raza', 'Muhammad Usman', 'Zain Ali', 'Hamza Tariq', 'Bilal Hassan',
      'Farhan Akhtar', 'Dr. Sajid Khan', 'Chaudhry Waqas', 'Malik Asad', 'Shahid Mehmood',
      'Omer Farooq', 'Rizwan Sheikh', 'Imran Nazir', 'Kamran Akram', 'Saad Qureshi',
      'Hafiz Abdullah', 'Arslan Javed', 'Naveed Iqbal', 'Fahad Rehman', 'Khurram Shehzad'
    ];

    const streets = [
      'House 14, Street 2, Satellite Town', 'House 45, Main Boulevard, Model Town',
      'House 88, Street 7, University Road', 'Al-Madina Villas, House 12, Civil Lines',
      'House 102, Near Jamia Masjid, Fatima Jinnah Colony', 'House 31, Block E, PAF Road',
      'Bismillah Heights, Flat 4, Cantt Area', 'House 73, Street 5, Stadium Road'
    ];

    const seededOrders: Order[] = [];
    let orderSeq = 1000;

    // Distribute sample target quantities across ~60 completed orders over the last 30 days
    const productsMap = new Map(INITIAL_PRODUCTS.map((p) => [p.id, p]));
    const remainingToDistribute = { ...sampleTargetQuantities };

    // Helper to generate an order
    const makeSampleOrder = (
      itemsList: { prodId: string; qty: number }[],
      daysAgo: number,
      status: OrderStatus = 'DELIVERED',
      customerIndex = 0
    ): Order => {
      orderSeq++;
      const orderNumber = `RK-2026-${String(orderSeq).padStart(4, '0')}`;
      const orderDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 8 * 3600 * 1000);
      const isoDate = orderDate.toISOString();

      const orderItems: OrderItemSnapshot[] = itemsList.map((item, idx) => {
        const prod = productsMap.get(item.prodId)!;
        const costPct = prod.costPercentage || 50;
        const sellingPrice = prod.price;
        const buyingCost = Math.round(sellingPrice * (costPct / 100));
        const profitPerUnit = sellingPrice - buyingCost;
        const lineRevenue = sellingPrice * item.qty;
        const lineBuyingCost = buyingCost * item.qty;
        const lineProfit = profitPerUnit * item.qty;

        return {
          id: `item-${orderSeq}-${idx + 1}`,
          orderId: `ord-${orderSeq}`,
          productId: prod.id,
          productNameSnapshot: prod.name,
          sellingPriceSnapshot: sellingPrice,
          buyingCostSnapshot: buyingCost,
          profitPerUnitSnapshot: profitPerUnit,
          quantity: item.qty,
          lineRevenue,
          lineBuyingCost,
          lineProfit,
          imageUrlSnapshot: prod.imageUrl,
        };
      });

      const subtotal = orderItems.reduce((sum, it) => sum + it.lineRevenue, 0);
      const totalBuyingCost = orderItems.reduce((sum, it) => sum + it.lineBuyingCost, 0);
      const totalProfit = orderItems.reduce((sum, it) => sum + it.lineProfit, 0);
      const deliveryCharge = 100;
      const total = subtotal + deliveryCharge;

      const customerName = customerNames[customerIndex % customerNames.length];
      const address = `${streets[customerIndex % streets.length]}, Sargodha`;

      return {
        id: `ord-${orderSeq}`,
        orderNumber,
        customerName,
        phone: `03${Math.floor(100000000 + Math.random() * 900000000)}`,
        area: 'Sargodha, Pakistan',
        address,
        notes: Math.random() > 0.6 ? 'Please send extra mint raita and tissue napkins.' : '',
        paymentMethod: 'Cash on Delivery',
        subtotal,
        deliveryCharge,
        total,
        status,
        items: orderItems,
        totalBuyingCost,
        totalProfit,
        createdAt: isoDate,
        updatedAt: isoDate,
      };
    };

    // Pack the remaining target quantities into batches of orders
    const productKeys = Object.keys(remainingToDistribute);
    let dayCursor = 28;
    let custIdx = 0;

    while (productKeys.some((k) => remainingToDistribute[k] > 0)) {
      const orderItemsToInclude: { prodId: string; qty: number }[] = [];
      const numItemsInOrder = Math.floor(Math.random() * 3) + 1; // 1 to 3 items

      for (let i = 0; i < numItemsInOrder; i++) {
        const availableKeys = productKeys.filter((k) => remainingToDistribute[k] > 0);
        if (availableKeys.length === 0) break;
        const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
        const maxTake = Math.min(remainingToDistribute[randomKey], Math.floor(Math.random() * 3) + 1);
        if (maxTake > 0) {
          orderItemsToInclude.push({ prodId: randomKey, qty: maxTake });
          remainingToDistribute[randomKey] -= maxTake;
        }
      }

      if (orderItemsToInclude.length > 0) {
        seededOrders.push(makeSampleOrder(orderItemsToInclude, dayCursor, 'DELIVERED', custIdx++));
        if (dayCursor > 0 && Math.random() > 0.4) {
          dayCursor = Math.max(0, dayCursor - 1);
        }
      } else {
        break;
      }
    }

    // Add a few active / live orders (today)
    seededOrders.push(
      makeSampleOrder(
        [
          { prodId: 'prod-16', qty: 2 }, // 2 Zinger Burgers
          { prodId: 'prod-15', qty: 1 }, // 1 Drumsticks
        ],
        0,
        'PREPARING',
        5
      )
    );

    seededOrders.push(
      makeSampleOrder(
        [
          { prodId: 'prod-22', qty: 2 }, // 2 Chicken Biryani
          { prodId: 'prod-10', qty: 1 }, // 1 Seekh Kabab
        ],
        0,
        'CONFIRMED',
        9
      )
    );

    seededOrders.push(
      makeSampleOrder(
        [
          { prodId: 'prod-1', qty: 1 }, // 1 Chicken Karahi (1 KG)
        ],
        0,
        'OUT_FOR_DELIVERY',
        12
      )
    );

    // Add 2 cancelled orders to verify they are excluded from revenue & profit calculations
    seededOrders.push(
      makeSampleOrder(
        [
          { prodId: 'prod-3', qty: 1 }, // Chicken Tikka Handi
        ],
        2,
        'CANCELLED',
        18
      )
    );
    seededOrders.push(
      makeSampleOrder(
        [
          { prodId: 'prod-13', qty: 1 }, // Chicken Tikka Full
        ],
        5,
        'CANCELLED',
        22
      )
    );

    const initialActivity: ActivityLog[] = [
      {
        id: 'act-1',
        action: 'System Initialized',
        details: 'Royal Kitchen online ordering and management system loaded with 27 menu products.',
        performedBy: 'System',
        createdAt: new Date().toISOString(),
      },
    ];

    return {
      users: [initialUser],
      adminSessions: [],
      customerSessions: [],
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      orders: seededOrders,
      expenses: INITIAL_EXPENSES,
      settings: INITIAL_SETTINGS,
      activityLogs: initialActivity,
    };
  }

  private saveDataDirect(schema: DatabaseSchema) {
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(schema, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  }

  public save() {
    this.saveDataDirect(this.data);
  }

  // --- Settings ---
  public getSettings(): StoreSettings {
    return { ...this.data.settings };
  }

  public updateSettings(updates: Partial<StoreSettings>, adminUser = 'moiz'): StoreSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
    };
    this.logActivity('Settings Updated', `Store settings updated by ${adminUser}.`, adminUser);
    this.save();
    return this.data.settings;
  }

  // --- Users & Sessions ---
  public getUser(username: string): User | undefined {
    return this.data.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public isUsernameTaken(username: string): boolean {
    const clean = username.trim().toLowerCase();
    return this.data.users.some((u) => u.username.toLowerCase() === clean);
  }

  public registerCustomer(input: {
    username: string;
    passwordHash: string;
    fullName: string;
    phone: string;
    area?: string;
    address: string;
  }): { user?: User; error?: string } {
    const cleanUsername = input.username.trim();
    if (!cleanUsername) {
      return { error: 'Username is required' };
    }
    if (this.isUsernameTaken(cleanUsername)) {
      return { error: 'user is taken' };
    }

    const newUser: User = {
      id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      username: cleanUsername,
      passwordHash: input.passwordHash,
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      area: input.area?.trim() || 'Sargodha, Pakistan',
      address: input.address.trim(),
      role: 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.logActivity(
      'Customer Registered',
      `New customer registered: @${newUser.username} (${newUser.fullName})`,
      newUser.username
    );
    this.save();
    return { user: newUser };
  }

  public updateCustomerProfile(
    userId: string,
    updates: { fullName?: string; phone?: string; area?: string; address?: string }
  ): User | null {
    const user = this.data.users.find((u) => u.id === userId && u.role === 'customer');
    if (!user) return null;

    if (updates.fullName !== undefined) user.fullName = updates.fullName.trim();
    if (updates.phone !== undefined) user.phone = updates.phone.trim();
    if (updates.area !== undefined) user.area = updates.area.trim();
    if (updates.address !== undefined) user.address = updates.address.trim();
    user.updatedAt = new Date().toISOString();

    this.save();
    return user;
  }

  public createCustomerSession(userId: string, username: string, token: string): CustomerSession {
    // 365 days expiry so customer stays logged in until logout
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    const session: CustomerSession = {
      token,
      userId,
      username,
      role: 'customer',
      createdAt: new Date().toISOString(),
      expiresAt,
    };
    if (!this.data.customerSessions) {
      this.data.customerSessions = [];
    }
    this.data.customerSessions.push(session);
    this.save();
    return session;
  }

  public getCustomerSession(token: string): CustomerSession | undefined {
    if (!this.data.customerSessions) return undefined;
    const session = this.data.customerSessions.find((s) => s.token === token);
    if (!session) return undefined;
    if (new Date(session.expiresAt) < new Date()) {
      this.deleteCustomerSession(token);
      return undefined;
    }
    return session;
  }

  public deleteCustomerSession(token: string) {
    if (!this.data.customerSessions) return;
    this.data.customerSessions = this.data.customerSessions.filter((s) => s.token !== token);
    this.save();
  }

  public updatePassword(userId: string, newPasswordHash: string, adminUser = 'moiz'): boolean {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    this.logActivity('Password Changed', `Admin password changed by ${adminUser}.`, adminUser);
    this.save();
    return true;
  }

  public createSession(userId: string, username: string, token: string): AdminSession {
    // 7 days expiry
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const session: AdminSession = {
      token,
      userId,
      username,
      createdAt: new Date().toISOString(),
      expiresAt,
    };
    this.data.adminSessions.push(session);
    this.save();
    return session;
  }

  public getSession(token: string): AdminSession | undefined {
    const session = this.data.adminSessions.find((s) => s.token === token);
    if (!session) return undefined;
    if (new Date(session.expiresAt) < new Date()) {
      this.deleteSession(token);
      return undefined;
    }
    return session;
  }

  public deleteSession(token: string) {
    this.data.adminSessions = this.data.adminSessions.filter((s) => s.token !== token);
    this.save();
  }

  // --- Categories ---
  public getCategories(includeHidden = false): Category[] {
    const cats = this.data.categories || [];
    if (includeHidden) {
      return [...cats].sort((a, b) => a.displayOrder - b.displayOrder);
    }
    return cats.filter((c) => c.visible).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public addCategory(name: string, adminUser = 'moiz'): Category {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      displayOrder: this.data.categories.length + 1,
      visible: true,
      createdAt: new Date().toISOString(),
    };
    this.data.categories.push(newCat);
    this.logActivity('Category Added', `Added category "${newCat.name}"`, adminUser);
    this.save();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>, adminUser = 'moiz'): Category | null {
    const cat = this.data.categories.find((c) => c.id === id);
    if (!cat) return null;
    Object.assign(cat, updates);
    this.logActivity('Category Updated', `Updated category "${cat.name}"`, adminUser);
    this.save();
    return cat;
  }

  public deleteCategory(id: string, adminUser = 'moiz'): boolean {
    const index = this.data.categories.findIndex((c) => c.id === id);
    if (index === -1) return false;
    const deleted = this.data.categories.splice(index, 1)[0];
    this.logActivity('Category Deleted', `Deleted category "${deleted.name}"`, adminUser);
    this.save();
    return true;
  }

  // --- Products ---
  public getProducts(adminView = false): Product[] {
    let prods = this.data.products || [];
    if (!adminView) {
      // Filter out unavailable or hidden
      prods = prods.filter((p) => p.available);
    }
    return prods.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  public addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, adminUser = 'moiz'): Product {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      costPercentage: productData.costPercentage || this.data.settings.defaultCostPercentage || 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.products.push(newProd);
    this.logActivity('Product Added', `Added product "${newProd.name}" (Rs. ${newProd.price})`, adminUser);
    this.save();
    return newProd;
  }

  public updateProduct(id: string, updates: Partial<Product>, adminUser = 'moiz'): Product | null {
    const prod = this.data.products.find((p) => p.id === id);
    if (!prod) return null;

    const oldPrice = prod.price;
    const oldCost = prod.costPercentage;
    const oldImage = prod.imageUrl;

    Object.assign(prod, { ...updates, updatedAt: new Date().toISOString() });

    let actionDesc = `Updated product "${prod.name}"`;
    if (updates.price !== undefined && updates.price !== oldPrice) {
      actionDesc += ` (Price changed from Rs. ${oldPrice} to Rs. ${updates.price})`;
    }
    if (updates.costPercentage !== undefined && updates.costPercentage !== oldCost) {
      actionDesc += ` (Cost % changed to ${updates.costPercentage}%)`;
    }
    if (updates.imageUrl !== undefined && updates.imageUrl !== oldImage) {
      actionDesc += ` (Image updated)`;
    }

    this.logActivity('Product Updated', actionDesc, adminUser);
    this.save();
    return prod;
  }

  public duplicateProduct(id: string, adminUser = 'moiz'): Product | null {
    const prod = this.data.products.find((p) => p.id === id);
    if (!prod) return null;

    const dup: Product = {
      ...prod,
      id: `prod-${Date.now()}`,
      name: `${prod.name} (Copy)`,
      displayOrder: this.data.products.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.products.push(dup);
    this.logActivity('Product Duplicated', `Duplicated "${prod.name}" as "${dup.name}"`, adminUser);
    this.save();
    return dup;
  }

  public deleteProduct(id: string, adminUser = 'moiz'): boolean {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    const deleted = this.data.products.splice(index, 1)[0];
    this.logActivity('Product Deleted', `Deleted product "${deleted.name}"`, adminUser);
    this.save();
    return true;
  }

  // --- Orders ---
  public getOrders(adminView = false): Order[] {
    const orders = this.data.orders || [];
    const sorted = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (adminView) {
      return sorted;
    }

    // Customer view: Strip confidential financial numbers
    return sorted.map((o) => {
      const { totalBuyingCost, totalProfit, ...safeOrder } = o;
      const safeItems = safeOrder.items.map((item) => {
        const {
          buyingCostSnapshot,
          profitPerUnitSnapshot,
          lineBuyingCost,
          lineProfit,
          ...cleanItem
        } = item;
        return cleanItem as OrderItemSnapshot;
      });
      return {
        ...safeOrder,
        items: safeItems,
      };
    });
  }

  public getOrderById(idOrNumber: string, adminView = false): Order | undefined {
    const order = this.data.orders.find(
      (o) => o.id === idOrNumber || o.orderNumber.toUpperCase() === idOrNumber.toUpperCase()
    );
    if (!order) return undefined;

    if (adminView) {
      return order;
    }

    // Customer view
    const { totalBuyingCost, totalProfit, ...safeOrder } = order;
    const safeItems = safeOrder.items.map((item) => {
      const {
        buyingCostSnapshot,
        profitPerUnitSnapshot,
        lineBuyingCost,
        lineProfit,
        ...cleanItem
      } = item;
      return cleanItem as OrderItemSnapshot;
    });
    return {
      ...safeOrder,
      items: safeItems,
    };
  }

  public getCustomerOrdersByPhone(phone: string): Order[] {
    const normalized = phone.replace(/[^0-9]/g, '');
    const orders = this.data.orders.filter((o) => {
      const p = o.phone.replace(/[^0-9]/g, '');
      return p.includes(normalized) || normalized.includes(p);
    });

    // Sort newest first and strip confidential financial data
    return orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((o) => {
        const { totalBuyingCost, totalProfit, ...safeOrder } = o;
        const safeItems = safeOrder.items.map((item) => {
          const {
            buyingCostSnapshot,
            profitPerUnitSnapshot,
            lineBuyingCost,
            lineProfit,
            ...cleanItem
          } = item;
          return cleanItem as OrderItemSnapshot;
        });
        return {
          ...safeOrder,
          items: safeItems,
        };
      });
  }

  public getOrdersForCustomer(usernameOrId: string, phone?: string): Order[] {
    const cleanUser = usernameOrId.trim().toLowerCase();
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    const orders = this.data.orders || [];

    const matched = orders.filter((o) => {
      const matchId = o.customerId && o.customerId.toLowerCase() === cleanUser;
      const matchUsername = o.customerUsername && o.customerUsername.toLowerCase() === cleanUser;
      const matchPhone = cleanPhone && o.phone && o.phone.replace(/[^0-9]/g, '') === cleanPhone;
      return matchId || matchUsername || matchPhone;
    });

    return matched
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((o) => {
        const { totalBuyingCost, totalProfit, ...safeOrder } = o;
        const safeItems = safeOrder.items.map((item) => {
          const {
            buyingCostSnapshot,
            profitPerUnitSnapshot,
            lineBuyingCost,
            lineProfit,
            ...cleanItem
          } = item;
          return cleanItem as OrderItemSnapshot;
        });
        return {
          ...safeOrder,
          items: safeItems,
        };
      });
  }

  public createOrder(orderInput: {
    customerId?: string;
    customerUsername?: string;
    customerName: string;
    phone: string;
    area: string;
    address: string;
    notes?: string;
    items: { productId: string; quantity: number }[];
  }): { order: Order; success: boolean; error?: string } {
    // 1. Check opening hours (server side)
    const settings = this.getSettings();
    if (!this.isRestaurantOpenNow(settings)) {
      return {
        order: null as any,
        success: false,
        error: `Royal Kitchen is currently closed. Online ordering is available from ${this.formatTime12(
          settings.openingTime
        )} to ${this.formatTime12(settings.closingTime)}.`,
      };
    }

    // 2. Enforce Service Area (Sargodha, Pakistan)
    const normalizedInputArea = (orderInput.area || '').toLowerCase();
    const normalizedAddress = (orderInput.address || '').toLowerCase();

    // Reject only if explicitly another city outside Sargodha is entered
    const outsideCities = ['lahore', 'karachi', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar', 'quetta', 'sialkot', 'gujranwala'];
    const isOutsideCity = outsideCities.some(
      (c) => normalizedInputArea.includes(c) || normalizedAddress.includes(c)
    );

    if (isOutsideCity) {
      return {
        order: null as any,
        success: false,
        error: 'Sorry! Royal Kitchen currently delivers across Sargodha, Pakistan only.',
      };
    }

    if (!orderInput.address || orderInput.address.trim().length < 3) {
      return {
        order: null as any,
        success: false,
        error: 'Please enter a complete delivery street/house address in Sargodha.',
      };
    }

    // 3. Verify Products & Build Snapshots
    if (!orderInput.items || orderInput.items.length === 0) {
      return { order: null as any, success: false, error: 'Order must contain at least one item.' };
    }

    const orderId = `ord-${Date.now()}`;
    const nextSeq = this.data.orders.length + 1001;
    const orderNumber = `RK-2026-${String(nextSeq).padStart(4, '0')}`;

    const snapshots: OrderItemSnapshot[] = [];
    let subtotal = 0;
    let totalBuyingCost = 0;
    let totalProfit = 0;

    for (let i = 0; i < orderInput.items.length; i++) {
      const itemInput = orderInput.items[i];
      const prod = this.getProductById(itemInput.productId);
      if (!prod) {
        return { order: null as any, success: false, error: `Product not found: ${itemInput.productId}` };
      }
      if (!prod.available) {
        return { order: null as any, success: false, error: `Product "${prod.name}" is currently unavailable.` };
      }
      if (itemInput.quantity <= 0 || !Number.isInteger(itemInput.quantity)) {
        return { order: null as any, success: false, error: `Invalid quantity for "${prod.name}".` };
      }

      const sellingPrice = prod.price;
      const costPct = prod.costPercentage || settings.defaultCostPercentage || 50;
      const buyingCost = Math.round(sellingPrice * (costPct / 100));
      const profitPerUnit = sellingPrice - buyingCost;

      const lineRevenue = sellingPrice * itemInput.quantity;
      const lineBuyingCost = buyingCost * itemInput.quantity;
      const lineProfit = profitPerUnit * itemInput.quantity;

      subtotal += lineRevenue;
      totalBuyingCost += lineBuyingCost;
      totalProfit += lineProfit;

      snapshots.push({
        id: `item-${Date.now()}-${i + 1}`,
        orderId,
        productId: prod.id,
        productNameSnapshot: prod.name,
        sellingPriceSnapshot: sellingPrice,
        buyingCostSnapshot: buyingCost,
        profitPerUnitSnapshot: profitPerUnit,
        quantity: itemInput.quantity,
        lineRevenue,
        lineBuyingCost,
        lineProfit,
        imageUrlSnapshot: prod.imageUrl,
      });
    }

    const deliveryCharge = Number(settings.deliveryCharge) || 0;
    const total = subtotal + deliveryCharge;
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: orderInput.customerId,
      customerUsername: orderInput.customerUsername,
      customerName: orderInput.customerName.trim(),
      phone: orderInput.phone.trim(),
      area: orderInput.area ? orderInput.area.trim() : (settings.serviceArea || 'Sargodha, Pakistan'),
      address: orderInput.address.trim(),
      notes: (orderInput.notes || '').trim(),
      paymentMethod: 'Cash on Delivery',
      subtotal,
      deliveryCharge,
      total,
      status: 'NEW',
      items: snapshots,
      totalBuyingCost,
      totalProfit,
      createdAt: now,
      updatedAt: now,
    };

    // If placed by registered customer, update their saved phone & address for convenience
    if (orderInput.customerId) {
      this.updateCustomerProfile(orderInput.customerId, {
        phone: newOrder.phone,
        area: newOrder.area,
        address: newOrder.address,
        fullName: newOrder.customerName,
      });
    }

    this.data.orders.push(newOrder);
    this.logActivity(
      'New Order Received',
      `Order ${orderNumber} placed by ${newOrder.customerName} for Rs. ${total}`,
      'Customer'
    );
    this.save();

    return { order: newOrder, success: true };
  }

  public updateOrderStatus(orderId: string, status: OrderStatus, adminUser = 'moiz'): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    const oldStatus = order.status;
    order.status = status;
    order.updatedAt = new Date().toISOString();

    this.logActivity(
      'Order Status Changed',
      `Order ${order.orderNumber} status changed from ${oldStatus} to ${status}`,
      adminUser
    );
    this.save();
    return order;
  }

  // --- Expenses ---
  public getExpenses(): Expense[] {
    return [...(this.data.expenses || [])].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  public addExpense(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>, adminUser = 'moiz'): Expense {
    const newExp: Expense = {
      ...data,
      id: `exp-${Date.now()}`,
      amount: Number(data.amount) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.expenses.push(newExp);
    this.logActivity(
      'Expense Added',
      `Added expense "${newExp.name}" - Rs. ${newExp.amount} (${newExp.category})`,
      adminUser
    );
    this.save();
    return newExp;
  }

  public updateExpense(id: string, updates: Partial<Expense>, adminUser = 'moiz'): Expense | null {
    const exp = this.data.expenses.find((e) => e.id === id);
    if (!exp) return null;
    Object.assign(exp, { ...updates, updatedAt: new Date().toISOString() });
    if (updates.amount !== undefined) exp.amount = Number(updates.amount) || 0;
    this.logActivity('Expense Updated', `Updated expense "${exp.name}" - Rs. ${exp.amount}`, adminUser);
    this.save();
    return exp;
  }

  public deleteExpense(id: string, adminUser = 'moiz'): boolean {
    const index = this.data.expenses.findIndex((e) => e.id === id);
    if (index === -1) return false;
    const deleted = this.data.expenses.splice(index, 1)[0];
    this.logActivity('Expense Deleted', `Deleted expense "${deleted.name}" (Rs. ${deleted.amount})`, adminUser);
    this.save();
    return true;
  }

  // --- Activity Logs ---
  public logActivity(action: string, details: string, performedBy: string) {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      details,
      performedBy,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.activityLogs) this.data.activityLogs = [];
    this.data.activityLogs.unshift(newLog);
    // Keep max 500 logs
    if (this.data.activityLogs.length > 500) {
      this.data.activityLogs = this.data.activityLogs.slice(0, 500);
    }
  }

  public getActivityLogs(limit = 100): ActivityLog[] {
    return (this.data.activityLogs || []).slice(0, limit);
  }

  // --- Store Hours Logic in Asia/Karachi ---
  public isRestaurantOpenNow(settings = this.getSettings()): boolean {
    try {
      const nowInKarachi = new Date(
        new Date().toLocaleString('en-US', { timeZone: settings.timezone || 'Asia/Karachi' })
      );
      const currentMinutes = nowInKarachi.getHours() * 60 + nowInKarachi.getMinutes();

      // Parse opening e.g. "14:00" -> 14 * 60 = 840
      const [openH, openM] = (settings.openingTime || '14:00').split(':').map(Number);
      const openMinutes = openH * 60 + (openM || 0);

      // Parse closing e.g. "00:00" or "24:00" -> midnight = 1440
      const [closeH, closeM] = (settings.closingTime || '00:00').split(':').map(Number);
      let closeMinutes = closeH * 60 + (closeM || 0);

      // Handle midnight: if closing is "00:00", that means 24:00 (end of day)
      if (closeMinutes === 0) {
        closeMinutes = 24 * 60; // 1440
      }

      if (closeMinutes > openMinutes) {
        // e.g. 14:00 (840) to 24:00 (1440)
        return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
      } else {
        // Over midnight boundary e.g. 18:00 to 02:00
        return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
      }
    } catch (e) {
      console.error('Error calculating open status', e);
      return true;
    }
  }

  public formatTime12(time24: string): string {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 && h < 24 ? 'PM' : 'AM';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}:${String(m || 0).padStart(2, '0')} ${period}`;
  }
}

export const db = new Database();
