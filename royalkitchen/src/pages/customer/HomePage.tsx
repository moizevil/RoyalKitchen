import React from 'react';
import {
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  Flame,
  ShieldCheck,
  Truck,
  Award,
  Sparkles,
  ShoppingBag,
  ChefHat,
  ChevronRight,
} from 'lucide-react';
import { Product, Category } from '../../types';
import { FoodCard } from '../../components/FoodCard';
import { useStore } from '../../context/StoreContext';

interface HomePageProps {
  products: Product[];
  categories: Category[];
  onNavigate: (view: string, categoryFilter?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ products, categories, onNavigate }) => {
  const { isOpen, settings } = useStore();

  const featuredProducts = products.filter((p) => p.featured).slice(0, 8);
  const popularBurgersAndKarahi = products.filter((p) =>
    ['Karahi & Handi', 'Burgers', 'Rice'].includes(p.category)
  ).slice(0, 4);

  const handleWhatsAppChat = () => {
    const phone = settings?.whatsappInternational || '923433094276';
    const msg = encodeURIComponent('Salam Royal Kitchen! I would like to inquire about the menu and place an order.');
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-zinc-950 pt-8 pb-20 lg:pt-14 lg:pb-32 border-b border-zinc-800/80">
        {/* Background glow & accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Operational & Location pill */}
              <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-700/80 text-xs shadow-inner">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                />
                <span className="font-bold text-zinc-200">
                  {isOpen ? 'OPEN NOW (11 AM - 1 AM)' : 'CURRENTLY CLOSED'}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Sargodha, Pakistan
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight text-white uppercase leading-[1.05]">
                  ROYAL <span className="text-amber-400">KITCHEN</span>
                </h1>
                <p className="text-xl sm:text-2xl font-serif italic text-amber-200/90 font-light">
                  "Delicious Food. Made With Care."
                </p>
              </div>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Experience authentic deshi perfection in Sargodha. From simmering clay Handis & Karahis
                to charcoal-roasted Chicken Tikkas, crispy Zinger Burgers, and fragrant spiced Biryani —
                prepared strictly with fresh ingredients and delivered hot to your doorstep.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  onClick={() => onNavigate('menu')}
                  id="hero-order-now-btn"
                  className="px-7 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm tracking-wider uppercase flex items-center gap-2 shadow-xl shadow-amber-500/25 transition-all duration-150 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" /> ORDER NOW
                </button>

                <button
                  onClick={() => onNavigate('menu')}
                  id="hero-view-menu-btn"
                  className="px-6 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 font-bold text-sm tracking-wider uppercase transition-colors"
                >
                  VIEW MENU
                </button>

                <button
                  onClick={handleWhatsAppChat}
                  id="hero-whatsapp-btn"
                  className="px-6 py-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 font-bold text-sm tracking-wider uppercase flex items-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4" /> ORDER ON WHATSAPP
                </button>
              </div>

              {/* Value propositions */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-zinc-800/80 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Fresh Charcoal Grilled</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Sargodha Citywide Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>100% Halal Chicken</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Featured Dish Card */}
                <div className="rounded-3xl overflow-hidden bg-zinc-900 border border-amber-500/30 shadow-2xl shadow-amber-500/10 p-3 group">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-950">
                    <img
                      src="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1000&q=80"
                      alt="Royal Kitchen Chicken Karahi"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                    <div className="absolute bottom-5 left-5 right-5 text-left">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500 text-zinc-950 inline-block mb-1.5">
                        Chef's Masterpiece
                      </span>
                      <h3 className="text-2xl font-black text-white">Chicken Karahi Desi Style</h3>
                      <p className="text-xs text-zinc-300 mt-1">Cooked in pure spices and ripe tomatoes</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xl font-black text-amber-400">Rs. 1,500</span>
                        <button
                          onClick={() => onNavigate('menu')}
                          className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md transition-colors"
                        >
                          Order Online
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Micro Badge */}
                <div className="absolute -bottom-6 -left-6 bg-zinc-900/95 border border-zinc-700 p-4 rounded-2xl shadow-xl backdrop-blur-md hidden sm:flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white">Delivery Hours</div>
                    <div className="text-xs text-amber-400 font-semibold">2:00 PM – 12:00 AM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Menu Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">EXPLORE BY SPECIALTY</h2>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-amber-400 hover:text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            Browse Full Menu ({products.length} items) <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('menu', cat.name)}
              className="p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-amber-500/50 transition-all text-center group flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-800 group-hover:bg-amber-500/20 text-zinc-300 group-hover:text-amber-400 flex items-center justify-center transition-colors">
                <ChefHat className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-zinc-200 group-hover:text-amber-400 transition-colors line-clamp-1">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED FOODS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Sparkles className="w-3.5 h-3.5" /> Handpicked Favorites
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">FEATURED FOODS</h2>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            View Complete Menu <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <FoodCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* DELIVERY AREA & HOW IT WORKS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400 inline-block">
                Citywide Delivery
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                DELIVERING FRESH ACROSS <br />
                <span className="text-amber-400">SARGODHA, PAKISTAN</span>
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                To guarantee optimal food temperature, crispiness, and rapid delivery times, Royal Kitchen
                serves homes, offices, and gatherings all across Sargodha, Pakistan.
              </p>

              <div className="space-y-2.5 pt-2 text-xs text-zinc-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <span>Strict hot delivery across Sargodha in under 35-45 minutes</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <span>Standard flat delivery fee: Rs. {settings?.deliveryCharge ?? 100}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <span>100% Cash on Delivery — Pay only when you receive your meal</span>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={() => onNavigate('menu')}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-colors"
                >
                  Order in Sargodha
                </button>
              </div>
            </div>

            {/* How it works steps */}
            <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" /> How It Works
              </h3>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-zinc-950 font-black text-sm flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Select Your Favorites</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Explore our 27 authentic menu items and customize quantities.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-zinc-950 font-black text-sm flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Provide Address</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Enter your phone and street address in Sargodha.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-zinc-950 font-black text-sm flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Fast Kitchen Prep & Delivery</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Track your order live from preparation to your door. Pay Cash on Delivery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE ROYAL KITCHEN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Uncompromised Quality
          </span>
          <h2 className="text-3xl font-black text-white mt-1">WHY CHOOSE ROYAL KITCHEN</h2>
          <p className="text-xs text-zinc-400 mt-2">
            Every order is handcrafted fresh with high standard culinary standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-left space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ChefHat className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Traditional Cooking Techniques</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Our Karahi and Handi dishes are simmered slowly in real iron and clay utensils using whole aromatics, fresh ginger, and homemade gravies.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-left space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Natural Charcoal Barbecue</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Chicken Seekh Kababs and Tikkas are roasted over natural glowing charcoals, locking in pure wood-smoke flavor and tenderness.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-left space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Insulated Hot Delivery</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dishes are securely packed in heat-retaining food containers and dispatched swiftly across Sargodha.
            </p>
          </div>
        </div>
      </section>

      {/* WHATSAPP ORDERING BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Instant Ordering Hotline
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Prefer to order directly via WhatsApp?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
              Our WhatsApp hotline <strong className="text-emerald-300">0343 3094276</strong> is open
              every day during kitchen hours (2:00 PM – 12:00 AM).
            </p>
          </div>

          <button
            onClick={handleWhatsAppChat}
            className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0 transition-transform active:scale-95"
          >
            <Phone className="w-4 h-4" /> Message 03433094276
          </button>
        </div>
      </section>
    </div>
  );
};
