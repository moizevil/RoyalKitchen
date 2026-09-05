import React from 'react';
import { Utensils, MapPin, Clock, Phone, ShieldCheck, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FooterProps {
  onAdminClick: () => void;
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick, onNavigate }) => {
  const { settings } = useStore();

  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800/80 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-zinc-950 shadow-md">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">ROYAL KITCHEN</span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              "Delicious Food. Made With Care."
              <br />
              Authentic Karahi, Handi, juicy Charcoal Tikkas, crispy Burgers and aromatic Biryani prepared daily with pure ingredients.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Halal & Pure Quality
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('menu')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Full Menu (27 Items)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Track Order
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>

          {/* Operations & Delivery */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Operations</h4>
            <div className="space-y-2.5 text-sm text-zinc-400">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-zinc-200">Opening Hours:</div>
                  <div>{settings?.openingTimeFormatted && settings?.closingTimeFormatted ? `${settings.openingTimeFormatted} – ${settings.closingTimeFormatted}` : '2:00 PM – 12:00 AM'}</div>
                  <div className="text-xs text-zinc-500">Everyday (Asia/Karachi)</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-zinc-200">Delivery Zone:</div>
                  <div>Sargodha City & Environs, Pakistan</div>
                  <div className="text-xs text-amber-400/90 font-medium">Standard Delivery: Rs. {settings?.deliveryCharge ?? 100}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Contact & Orders</h4>
            <p className="text-sm text-zinc-400">Order directly online or via WhatsApp hotline:</p>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
              <Phone className="w-4 h-4" />
              <span>0343 3094276</span>
            </div>
            <a
              href={`https://wa.me/${settings?.whatsappInternational || '923433094276'}?text=${encodeURIComponent(
                'Salam Royal Kitchen, I want to place an order in Sargodha.'
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom Bar with Admin Login */}
        <div className="mt-14 pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © {new Date().getFullYear()} <strong className="text-zinc-300">ROYAL KITCHEN</strong>. Sargodha, Punjab, Pakistan.
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Sargodha Foodies
            </span>

            {/* Crucial requirement: Prominent ADMIN LOGIN button */}
            <button
              onClick={onAdminClick}
              id="footer-admin-login-btn"
              className="px-3 py-1 rounded bg-zinc-900 border border-zinc-700/80 text-zinc-300 hover:text-amber-400 hover:border-amber-500/50 text-xs font-bold tracking-wider transition-all duration-150 uppercase"
            >
              ADMIN LOGIN
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
