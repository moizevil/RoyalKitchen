import React, { useState } from 'react';
import { Plus, Minus, Check, Star, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

interface FoodCardProps {
  product: Product;
}

export const FoodCard: React.FC<FoodCardProps> = ({ product }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const { isOpen } = useStore();
  const [imageError, setImageError] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const cartItem = cart.find((item) => item.product.id === product.id);
  const currentQuantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const defaultPlaceholder =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      id={`food-card-${product.id}`}
      className="group bg-zinc-900/90 rounded-2xl overflow-hidden border border-zinc-800/90 hover:border-amber-500/40 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
    >
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950">
        <img
          src={imageError || !product.imageUrl ? defaultPlaceholder : product.imageUrl}
          alt={product.name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/30 opacity-70" />

        {/* Badges on image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-zinc-900/90 text-amber-400 backdrop-blur-md border border-zinc-700/60 shadow-sm">
            {product.category}
          </span>
          {product.featured && (
            <span className="px-2 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-amber-500 text-zinc-950 flex items-center gap-1 shadow-md">
              <Star className="w-3 h-3 fill-zinc-950" /> Featured
            </span>
          )}
        </div>

        {/* Availability Badge */}
        {!product.available && (
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center">
            <span className="px-4 py-2 rounded-xl bg-rose-600/90 text-white font-black text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-lg">
              <AlertCircle className="w-4 h-4" /> Currently Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Details Container */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </div>

          <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {product.description || 'Delicious Royal Kitchen specialty prepared fresh to order.'}
          </p>
        </div>

        {/* Price and Cart Controls */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Price</span>
            <span className="text-xl font-black text-amber-400 tracking-tight">
              Rs. {product.price.toLocaleString()}
            </span>
          </div>

          {/* Add / Stepper controls */}
          {product.available ? (
            currentQuantity > 0 ? (
              <div className="flex items-center bg-zinc-800/90 rounded-xl p-1 border border-zinc-700 shadow-inner">
                <button
                  onClick={() => updateQuantity(product.id, currentQuantity - 1)}
                  className="w-8 h-8 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 flex items-center justify-center transition-colors active:scale-90"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-black text-white">
                  {currentQuantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, currentQuantity + 1)}
                  className="w-8 h-8 rounded-lg bg-amber-500 text-zinc-950 hover:bg-amber-400 flex items-center justify-center font-bold transition-colors active:scale-90"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                id={`add-btn-${product.id}`}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-150 flex items-center gap-1.5 shadow-md active:scale-95 ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 hover:shadow-amber-500/20'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" /> Added
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Add
                  </>
                )}
              </button>
            )
          ) : (
            <span className="text-xs text-zinc-500 font-semibold italic">Sold Out</span>
          )}
        </div>
      </div>
    </div>
  );
};
