import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Phone,
  Truck,
  MapPin,
  ShoppingBag,
  FileText,
  User,
  AlertTriangle,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';

interface CheckoutPageProps {
  onBackToMenu: () => void;
  onOrderPlaced: (order: Order) => void;
}

const SARGODHA_AREAS = [
  'Sargodha City (All Areas)',
  'Qartaba Town, Sargodha',
  'Satellite Town, Sargodha',
  'University Town & University Road, Sargodha',
  'Model Town, Sargodha',
  'Civil Lines, Sargodha',
  'Fatima Jinnah Colony, Sargodha',
  'PAF Base Area / Club Road, Sargodha',
  'Cantt & Stadium Road, Sargodha',
  'Other Area in Sargodha',
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBackToMenu, onOrderPlaced }) => {
  const { cart, subtotal, deliveryCharge, grandTotal, clearCart } = useCart();
  const { isOpen, settings } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('Sargodha City (All Areas)');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // If cart is empty and no confirmed order, redirect or show message
  if (cart.length === 0 && !confirmedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Your cart is empty</h2>
        <p className="text-xs text-zinc-400">
          Please select some delicious dishes from our menu before proceeding to checkout.
        </p>
        <button
          onClick={onBackToMenu}
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-colors"
        >
          View Menu
        </button>
      </div>
    );
  }

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Check open status
    if (!isOpen) {
      setErrorMessage(
        `Royal Kitchen is currently closed. Online ordering is available from ${
          settings?.openingTimeFormatted || '2:00 PM'
        } to ${settings?.closingTimeFormatted || '12:00 AM'}.`
      );
      return;
    }

    // 2. Validate Area for Sargodha, Pakistan
    const lowerArea = area.toLowerCase();
    const lowerAddr = address.toLowerCase();
    const outsideCities = ['lahore', 'karachi', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar', 'quetta'];
    if (outsideCities.some((c) => lowerArea.includes(c) || lowerAddr.includes(c))) {
      setErrorMessage('Sorry! Royal Kitchen currently delivers across Sargodha, Pakistan only.');
      return;
    }

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setErrorMessage('Please fill in your name, phone number, and street address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        area: area || 'Sargodha, Pakistan',
        address: address.trim(),
        notes: notes.trim(),
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to place order. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Success
      clearCart();
      setConfirmedOrder(data.order);
    } catch (e: any) {
      setErrorMessage('Network error while placing order. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Confirmation Screen if placed
  if (confirmedOrder) {
    const handleWhatsAppConfirm = () => {
      let text = `*ROYAL KITCHEN ORDER CONFIRMATION*\n`;
      text += `Order Number: *${confirmedOrder.orderNumber}*\n`;
      text += `Customer: ${confirmedOrder.customerName}\n`;
      text += `Phone: ${confirmedOrder.phone}\n`;
      text += `Area: ${confirmedOrder.area}\n`;
      text += `Delivery Address: ${confirmedOrder.address}, Sargodha, Pakistan\n\n`;
      text += `*ITEMS:*\n`;
      confirmedOrder.items.forEach((it, idx) => {
        text += `${idx + 1}. ${it.productNameSnapshot} x ${it.quantity} = Rs. ${it.lineRevenue.toLocaleString()}\n`;
      });
      text += `\n*Subtotal:* Rs. ${confirmedOrder.subtotal.toLocaleString()}`;
      text += `\n*Delivery:* Rs. ${confirmedOrder.deliveryCharge.toLocaleString()}`;
      text += `\n*Grand Total:* Rs. ${confirmedOrder.total.toLocaleString()}`;
      text += `\n*Payment:* Cash on Delivery\n`;
      if (confirmedOrder.notes) text += `*Notes:* ${confirmedOrder.notes}\n`;

      const targetPhone = settings?.whatsappInternational || '923433094276';
      window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        <div className="p-8 rounded-3xl bg-zinc-900 border border-emerald-500/40 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="px-3 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider inline-block">
            Order Placed Successfully
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Thank you, {confirmedOrder.customerName}!
          </h2>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-left space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Order Number:</span>
              <strong className="text-amber-400 font-mono text-sm">
                {confirmedOrder.orderNumber}
              </strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Delivery Zone:</span>
              <span className="text-zinc-200 text-right">{confirmedOrder.area}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Delivery Address:</span>
              <span className="text-zinc-200 text-right">{confirmedOrder.address}, Sargodha</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Payment:</span>
              <span className="text-emerald-400 font-semibold">Cash on Delivery</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-zinc-800 pt-2 font-bold">
              <span className="text-zinc-300">Total Amount:</span>
              <span className="text-amber-400 text-base">
                Rs. {confirmedOrder.total.toLocaleString()}
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
            Our kitchen in Sargodha has received your order and is beginning preparations. You can
            track your order progress anytime!
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOrderPlaced(confirmedOrder)}
              id="track-order-live-btn"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
            >
              Track Order Live
            </button>

            <button
              onClick={handleWhatsAppConfirm}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4" /> Send Confirmation on WhatsApp
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={onBackToMenu}
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-400 uppercase tracking-wider mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Menu
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Cash On Delivery
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">CHECKOUT DETAILS</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Delivering fresh and hot food across Sargodha, Pakistan
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-600/50 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-rose-200">Order Notice:</strong>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" /> Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Muhammad Ali"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                id="checkout-name"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" /> Mobile / WhatsApp Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 0300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                id="checkout-phone"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                We will call this number to confirm delivery before dispatch.
              </p>
            </div>

            {/* Delivery Area in Sargodha */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" /> Delivery Zone (Sargodha, Pakistan) *
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                id="checkout-area"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white font-medium focus:outline-none focus:border-amber-500 transition-colors"
              >
                {SARGODHA_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-zinc-500 mt-1">
                Royal Kitchen delivers across all neighborhoods, towns, and sectors of Sargodha.
              </p>
            </div>

            {/* Complete Street Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" /> Complete Address (House #, Street, Colony/Sector) *
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. House 45, Street 8, Satellite Town / Qartaba Town / Model Town, Sargodha"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                id="checkout-address"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Special Instructions / Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" /> Order Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Please make Karahi spicy, bring extra mint raita"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                id="checkout-notes"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                id="place-order-submit-btn"
                className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all duration-150 shadow-lg shadow-amber-500/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  'Placing Your Order...'
                ) : (
                  <>
                    <Truck className="w-4 h-4" /> CONFIRM & PLACE ORDER (RS.{' '}
                    {grandTotal.toLocaleString()})
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Order Summary */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h2 className="text-base font-bold text-white tracking-wide">ORDER SUMMARY</h2>
            <span className="text-xs text-zinc-400 font-semibold">{cart.length} Items</span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{item.product.name}</h4>
                  <p className="text-[11px] text-zinc-400">
                    Rs. {item.product.price.toLocaleString()} × {item.quantity}
                  </p>
                </div>
                <div className="text-xs font-black text-amber-400 shrink-0">
                  Rs. {(item.product.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-800 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-300">
              <span>Subtotal:</span>
              <span className="font-semibold">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span className="text-zinc-400">Delivery Charge (Sargodha):</span>
              <span className="font-semibold">Rs. {deliveryCharge.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span className="text-zinc-400">Payment Mode:</span>
              <span className="text-emerald-400 font-bold">Cash on Delivery</span>
            </div>
            <div className="border-t border-zinc-800 pt-3 flex justify-between text-sm font-black text-white">
              <span>Total Payable:</span>
              <span className="text-amber-400 text-base">Rs. {grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2">
            <Truck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Orders are dispatched immediately after cooking. Standard delivery across Sargodha takes
              approx. 35–45 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
