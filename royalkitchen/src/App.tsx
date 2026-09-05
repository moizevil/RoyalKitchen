import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Product, Category, Order } from './types';

// Customer Components & Pages
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/customer/HomePage';
import { MenuPage } from './pages/customer/MenuPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { TrackOrderPage } from './pages/customer/TrackOrderPage';
import { ContactPage } from './pages/customer/ContactPage';

// Admin Components & Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminMenuPage } from './pages/admin/AdminMenuPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminSalesPage } from './pages/admin/AdminSalesPage';
import { AdminExpensesPage } from './pages/admin/AdminExpensesPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminTargetsPage } from './pages/admin/AdminTargetsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminActivityPage } from './pages/admin/AdminActivityPage';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    const path = window.location.pathname;
    if (path === '/admin' || hash === 'admin') return 'admin';
    if (path === '/admin/login' || hash === 'admin-login') return 'admin-login';
    if (['menu', 'track', 'contact', 'checkout'].includes(hash)) return hash;
    return 'home';
  });

  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [menuInitialCategory, setMenuInitialCategory] = useState<string>('ALL');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Sync hash with view
  useEffect(() => {
    window.location.hash = currentView;
  }, [currentView]);

  // Fetch Public Menu & Categories
  const fetchMenuData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch (e) {
      console.error('Failed to load menu data', e);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  // When order is placed
  const handleOrderPlaced = (order: Order) => {
    setTrackedOrder(order);
    setCurrentView('track');
  };

  // Switch to Menu with optional preselected category
  const handleNavigateToMenu = (category?: string) => {
    if (category) {
      setMenuInitialCategory(category);
    } else {
      setMenuInitialCategory('ALL');
    }
    setCurrentView('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user requests admin view or admin login
  if (currentView === 'admin-login') {
    return (
      <AdminLoginPage
        onSuccess={() => setCurrentView('admin')}
        onBackToStore={() => setCurrentView('home')}
      />
    );
  }

  if (currentView === 'admin') {
    // If not authenticated, show login
    if (!isAuthenticated && !authLoading) {
      return (
        <AdminLoginPage
          onSuccess={() => setCurrentView('admin')}
          onBackToStore={() => setCurrentView('home')}
        />
      );
    }

    return (
      <AdminLayout
        currentTab={adminTab}
        setCurrentTab={setAdminTab}
        onExitAdmin={() => {
          fetchMenuData(); // Refresh storefront data
          setCurrentView('home');
        }}
      >
        {adminTab === 'dashboard' && <AdminDashboardPage />}
        {adminTab === 'orders' && <AdminOrdersPage />}
        {adminTab === 'menu' && <AdminMenuPage />}
        {adminTab === 'categories' && <AdminCategoriesPage />}
        {adminTab === 'sales' && <AdminSalesPage />}
        {adminTab === 'expenses' && <AdminExpensesPage />}
        {adminTab === 'reports' && <AdminReportsPage />}
        {adminTab === 'targets' && <AdminTargetsPage />}
        {adminTab === 'settings' && <AdminSettingsPage />}
        {adminTab === 'activity' && <AdminActivityPage />}
      </AdminLayout>
    );
  }

  // Customer Facing Layout
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-zinc-950">
      {/* Top Navbar */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Cart Drawer Modal */}
      <CartDrawer onProceedToCheckout={() => setCurrentView('checkout')} />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            products={products}
            categories={categories}
            onNavigate={(view, category) => {
              if (view === 'menu') {
                handleNavigateToMenu(category);
              } else {
                setCurrentView(view);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />
        )}

        {currentView === 'menu' && (
          <MenuPage
            products={products}
            categories={categories}
            initialCategory={menuInitialCategory}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onBackToMenu={() => setCurrentView('menu')}
            onOrderPlaced={handleOrderPlaced}
          />
        )}

        {currentView === 'track' && <TrackOrderPage initialOrder={trackedOrder} />}

        {currentView === 'contact' && <ContactPage />}
      </main>

      {/* Footer with prominent Admin Login button */}
      <Footer
        onAdminClick={() => setCurrentView('admin-login')}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <CartProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </CartProvider>
    </StoreProvider>
  );
}
