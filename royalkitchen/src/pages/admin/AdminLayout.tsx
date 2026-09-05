import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  Layers,
  TrendingUp,
  Receipt,
  BarChart3,
  Target,
  Settings,
  History,
  LogOut,
  Menu as MenuIcon,
  X,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onExitAdmin: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  setCurrentTab,
  onExitAdmin,
  children,
}) => {
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'menu', label: 'Menu Products', icon: Utensils },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'sales', label: 'Sales & Revenue', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
    { id: 'targets', label: 'Targets & Budgets', icon: Target },
    { id: 'settings', label: 'Store Settings', icon: Settings },
    { id: 'activity', label: 'Activity Log', icon: History },
  ];

  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950 font-black text-sm">
            RK
          </div>
          <div>
            <span className="font-bold text-sm text-white block">ROYAL KITCHEN</span>
            <span className="text-[10px] text-amber-400 font-semibold tracking-wide uppercase">
              Management Portal
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg bg-zinc-800 text-zinc-300"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-30 h-screen w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between transition-transform duration-200 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-zinc-950 font-black shadow-md shadow-amber-500/20">
            RK
          </div>
          <div>
            <h2 className="text-base font-black text-white tracking-wide">ROYAL KITCHEN</h2>
            <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              Admin Management
            </p>
          </div>
        </div>

        {/* 24/7 Admin Access Status notice */}
        <div className="px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-800/80 text-[11px] text-emerald-400 font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>Admin Portal Active 24/7</span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                id={`admin-tab-${item.id}`}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Bottom / User Info & Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/90 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-white capitalize">{user?.username || 'moiz'}</div>
              <div className="text-[10px] text-zinc-500 uppercase font-semibold">
                Super Administrator
              </div>
            </div>
            <button
              onClick={handleLogout}
              id="admin-logout-btn"
              title="Logout"
              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-zinc-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onExitAdmin}
            id="view-storefront-btn"
            className="w-full mt-2 py-2 px-3 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-zinc-700/60"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Storefront
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-zinc-950 overflow-y-auto">
        {/* Top bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-zinc-900/60 border-b border-zinc-800 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Active Module:
            </span>
            <span className="text-sm font-black text-amber-400 uppercase tracking-wide">
              {menuItems.find((m) => m.id === currentTab)?.label || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Logged in as: <strong className="text-white">{user?.username || 'moiz'}</strong></span>
            </div>

            <button
              onClick={onExitAdmin}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Website
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-8">{children}</div>
      </main>
    </div>
  );
};
