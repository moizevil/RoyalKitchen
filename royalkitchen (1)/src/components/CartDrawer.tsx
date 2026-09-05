import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertTriangle, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal, deliveryCharge, grandTotal, isCartOpen, setIsCartOpen } = useCart();
  const { isOpen, settings } = useStore();

  if (!isCartOpen) return null;

  const defaultPlaceholder =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

  // Build WhatsApp prefilled message
  const handleWhatsAppOrder = () => {
    if (cart.length === 0) return;
    let text = `*ROYAL KITCHEN ORDER*\n`;
    text += `Location: Sargodha, Pakistan\n\n`;
    text += `*ITEMS:*\n`;
    cart.forEach((item, idx) => {
      text += `${idx + 1}. ${item.product.name} x ${item.quantity} = Rs. ${(item.product.price * item.quantity).toLocaleString()}\n`;
    });
    text += `\n*Subtotal:* Rs. ${subtotal.toLocaleString()}`;
    text += `\n*Delivery Charge:* Rs. ${deliveryCharge.toLocaleString()}`;
    text += `\n*Grand Total:* Rs. ${grandTotal.toLocaleString()}`;
    text += `\n*Payment:* Cash on Delivery\n\n`;
    text += `Please send me the order confirmation!`;

    const phone = settings?.whatsappInternational || '923433094276';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 text-zinc-100 flex flex-col shadow-2xl">
          {/* Drawer Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">Your Order Cart</h2>
                <p className="text-xs text-zinc-400">Sargodha, Pakistan</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-zinc-400 hover:text-rose-400 transition-colors px-2 py-1"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                id="close-cart-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Store Closed Banner inside Cart if closed */}
          {!isOpen && (
            <div className="p-4 bg-amber-950/50 border-b border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-300">Royal Kitchen is currently closed.</strong>
                <p className="mt-0.5 text-amber-300/80 leading-relaxed">
                  Online ordering is available from {settings?.openingTimeFormatted || '2:00 PM'} to{' '}
                  {settings?.closingTimeFormatted || '12:00 AM'}. You can still browse and review your cart!
                </p>
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-3 text-zinc-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-zinc-200">Your cart is empty</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                  Add items from our Karahi, Handi, Biryani, Burgers and Kabab menu to start your order.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3.5"
                >
                  <img
                    src={item.product.imageUrl || defaultPlaceholder}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover bg-zinc-800 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{item.product.name}</h4>
                    <div className="text-xs text-amber-400 font-semibold mt-0.5">
                      Rs. {item.product.price.toLocaleString()} each
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 border border-zinc-700">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-200">
                          Rs. {(item.product.price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer / Checkout action */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-zinc-800 bg-zinc-950 space-y-3">
              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-200">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery (Sargodha)</span>
                  <span className="font-semibold text-zinc-200">
                    Rs. {deliveryCharge.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-between text-base font-black text-white">
                  <span>Grand Total</span>
                  <span className="text-amber-400">Rs. {grandTotal.toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-zinc-500 italic">Payment: Cash on Delivery</p>
              </div>

              {/* Checkout Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  disabled={!isOpen}
                  onClick={() => {
                    setIsCartOpen(false);
                    onProceedToCheckout();
                  }}
                  id="cart-proceed-checkout-btn"
                  className={`w-full py-3.5 px-4 rounded-xl font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-150 shadow-lg ${
                    isOpen
                      ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20 active:scale-98'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  {isOpen ? (
                    <>
                      Proceed to Checkout <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    'Closed - Opens at 2:00 PM'
                  )}
                </button>

                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> Order on WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
