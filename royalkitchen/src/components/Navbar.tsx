import React, { useState } from 'react';
import { ShoppingBag, Menu as MenuIcon, X, Clock, MapPin, Phone, Utensils } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { isOpen, settings } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'menu', label: 'MENU' },
    { id: 'cart', label: 'CART' },
    { id: 'track', label: 'MY ORDERS' },
    { id: 'contact', label: 'CONTACT' },
  ];

  const handleNavClick = (viewId: string) => {
    if (viewId === 'cart') {
      setIsCartOpen(true);
    } else {
      setCurrentView(viewId);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 text-zinc-100 shadow-xl">
      {/* Top micro banner with Operating Hours & Delivery Notice */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 text-zinc-950 font-medium text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 tracking-wide font-semibold">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>Delivering fresh food across Sargodha, Pakistan</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Hours: {settings?.openingTimeFormatted && settings?.closingTimeFormatted ? `${settings.openingTimeFormatted} – ${settings.closingTimeFormatted}` : '2:00 PM – 12:00 AM'}
            </span>
            <a
              href={`https://wa.me/${settings?.whatsappInternational || '923433094276'}`}
              target="_blank"
              rel="noreferrer"
              className="hover:underline flex items-center gap-1 font-bold"
            >
              <Phone className="w-3 h-3" />
              0343 3094276
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-none"
            id="brand-logo-btn"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-zinc-950 shadow-md shadow-amber-600/30 group-hover:scale-105 transition-transform duration-200">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                ROYAL KITCHEN
                <span className="text-amber-500 font-serif text-sm italic font-normal tracking-normal hidden sm:inline">
                  Est. Sargodha
                </span>
              </div>
              <p className="text-[11px] font-medium text-zinc-400 tracking-wider uppercase">
                Sargodha, Pakistan
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                id={`nav-link-${item.id}`}
                className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wider transition-colors duration-150 ${
                  currentView === item.id && item.id !== 'cart'
                    ? 'text-amber-400 bg-zinc-900/90'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* Open / Closed Live Indicator */}
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-wide uppercase ${
                isOpen
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-400'
              }`}
              id="store-status-badge"
            >
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isOpen ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              {isOpen ? 'OPEN NOW' : 'CLOSED'}
            </div>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              id="navbar-cart-btn"
              className="relative p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-all duration-150 flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline text-xs uppercase tracking-wider font-extrabold">
                Cart
              </span>
              {totalItems > 0 && (
                <span className="bg-zinc-950 text-amber-400 text-xs px-2 py-0.5 rounded-full font-black">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle"
              className="md:hidden p-2 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-4 pt-2 pb-6 space-y-2">
          {/* Status pill on mobile */}
          <div className="py-2 flex items-center justify-between border-b border-zinc-800">
            <span className="text-xs text-zinc-400 font-medium">Restaurant Status:</span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                isOpen
                  ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-400'
                  : 'bg-rose-950/70 border border-rose-500/40 text-rose-400'
              }`}
            >
              {isOpen ? '● OPEN NOW (2 PM - 12 AM)' : '● CLOSED'}
            </span>
          </div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                currentView === item.id && item.id !== 'cart'
                  ? 'bg-amber-500 text-zinc-950'
                  : 'text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-400">
            <span>Location: Sargodha, Pakistan</span>
            <button
              onClick={() => {
                setCurrentView('admin-login');
                setMobileMenuOpen(false);
              }}
              className="text-amber-400 font-semibold underline"
            >
              Admin Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
