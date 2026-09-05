import React from 'react';
import { MapPin, Phone, Clock, Mail, MessageSquare, ShieldCheck, Utensils } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ContactPage: React.FC = () => {
  const { settings, isOpen } = useStore();

  const handleWhatsApp = () => {
    const phone = settings?.whatsappInternational || '923433094276';
    const msg = encodeURIComponent('Salam Royal Kitchen! I have a question regarding orders.');
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">CONTACT ROYAL KITCHEN</h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
          We are proud to serve the residents of Sargodha, Pakistan with fresh, piping-hot meals daily.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Contact Information Cards */}
        <div className="space-y-6">
          {/* Card 1: WhatsApp Hotline */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">WhatsApp & Phone Orders</h3>
            <p className="text-xs text-zinc-400">
              For instant customer inquiries, bulk event packages, or quick WhatsApp orders:
            </p>
            <div className="text-2xl font-black text-amber-400 tracking-tight">0343 3094276</div>
            <button
              onClick={handleWhatsApp}
              className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4" /> Message on WhatsApp
            </button>
          </div>

          {/* Card 2: Operating Hours */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Kitchen Hours</h3>
            <p className="text-xs text-zinc-400">
              Online orders and hot deliveries operate 7 days a week:
            </p>
            <div className="text-xl font-bold text-white">
              {settings?.openingTimeFormatted || '2:00 PM'} – {settings?.closingTimeFormatted || '12:00 AM Midnight'}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span className="font-semibold text-zinc-300">
                Current status: {isOpen ? 'Open & Taking Orders' : 'Closed'}
              </span>
            </div>
          </div>
        </div>

        {/* Location & Delivery Zone Card */}
        <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Delivery Coverage Zone
            </span>
            <h3 className="text-2xl font-black text-white mt-1">SARGODHA, PAKISTAN</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Punjab, Pakistan. Deliveries are dispatched using insulated thermal carry boxes to maintain optimal temperature.
            </p>
          </div>

          <div className="space-y-3 pt-2 text-xs text-zinc-300">
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white">Citywide Delivery Network</strong>
                <p className="text-zinc-500 text-[11px] mt-0.5">
                  Serving all sectors, towns, and colonies of Sargodha, Punjab, Pakistan.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center gap-3">
              <Utensils className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="text-white">Fresh Cooking Protocol</strong>
                <p className="text-zinc-500 text-[11px] mt-0.5">
                  Items are prepared fresh upon order receipt, not reheated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
