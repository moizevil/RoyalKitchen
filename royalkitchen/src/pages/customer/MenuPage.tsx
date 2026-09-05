import React, { useState, useMemo } from 'react';
import { Search, Utensils, AlertTriangle } from 'lucide-react';
import { Product, Category } from '../../types';
import { FoodCard } from '../../components/FoodCard';
import { useStore } from '../../context/StoreContext';

interface MenuPageProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  products,
  categories,
  initialCategory = 'ALL',
}) => {
  const { isOpen, settings } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'ALL' ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Fresh & Handcrafted
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">OUR FULL MENU</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            27 delicious authentic specialties cooked fresh in Sargodha, Pakistan
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Karahi, Tikka, Burger, Biryani..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="menu-search-input"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Closed Notice Warning if closed */}
      {!isOpen && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-amber-200">Royal Kitchen is currently closed.</strong>
            <p className="mt-0.5 text-amber-300/80 leading-relaxed">
              Online ordering is available from {settings?.openingTimeFormatted || '2:00 PM'} to{' '}
              {settings?.closingTimeFormatted || '12:00 AM'}. You can freely browse our complete menu
              and prepare your items in the meantime!
            </p>
          </div>
        </div>
      )}

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setSelectedCategory('ALL')}
          id="category-pill-all"
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
          }`}
        >
          All Items ({products.length})
        </button>

        {categories.map((cat) => {
          const count = products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              id={`category-pill-${cat.id}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all ${
                selectedCategory.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Menu Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center mx-auto text-zinc-600">
            <Utensils className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-300">No items found</h3>
          <p className="text-xs text-zinc-500">Try adjusting your search query or selected category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <FoodCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
