import React, { useState, useEffect } from 'react';
import { Search, Package, Clock, Phone, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { Order } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { OrderTimeline } from '../../components/OrderTimeline';

interface TrackOrderPageProps {
  initialOrder?: Order | null;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ initialOrder }) => {
  const [searchInput, setSearchInput] = useState(initialOrder?.orderNumber || '');
  const [orders, setOrders] = useState<Order[]>(initialOrder ? [initialOrder] : []);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchOrders = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const clean = query.trim();
      let res: Response;

      if (clean.toUpperCase().startsWith('RK-') || clean.toUpperCase().includes('2026')) {
        // Track by order number
        res = await fetch(`/api/orders/track/${encodeURIComponent(clean)}`);
        if (res.ok) {
          const data = await res.json();
          setOrders([data]);
        } else {
          setOrders([]);
          setErrorMessage('No order found with this order number. Please verify and retry.');
        }
      } else {
        // Track by customer phone
        res = await fetch(`/api/orders/my-orders?phone=${encodeURIComponent(clean)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.length === 0) {
            setOrders([]);
            setErrorMessage('No orders found for this phone number.');
          } else {
            setOrders(data);
          }
        } else {
          setOrders([]);
          setErrorMessage('Unable to look up orders. Please try again.');
        }
      }
    } catch {
      setErrorMessage('Network connection error while looking up order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder?.orderNumber) {
      setSearchInput(initialOrder.orderNumber);
      setOrders([initialOrder]);
    }
  }, [initialOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(searchInput);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Live Status Updates
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">TRACK YOUR ORDER</h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
          Enter your Order Number (e.g. RK-2026-1001) or Mobile Phone Number to check real-time progress.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            placeholder="Order Number (RK-2026-...) or Phone (0343...)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            id="track-order-search-input"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 shadow-lg"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          id="track-search-btn"
          className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20 active:scale-95 shrink-0"
        >
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {errorMessage && (
        <div className="max-w-xl mx-auto p-4 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Orders Result List */}
      <div className="space-y-8">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
          >
            {/* Top row: Order Number & Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-black text-white">{order.orderNumber}</span>
                  <StatusBadge status={order.status} size="md" />
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Placed on {new Date(order.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => fetchOrders(order.orderNumber)}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
              </button>
            </div>

            {/* Visual Timeline */}
            <OrderTimeline status={order.status} />

            {/* Order Items & Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-zinc-800 text-xs">
              {/* Items List */}
              <div className="md:col-span-7 space-y-3">
                <h3 className="font-bold text-white uppercase tracking-wider text-xs">
                  Ordered Items ({order.items.length})
                </h3>
                <div className="space-y-2">
                  {order.items.map((it) => (
                    <div
                      key={it.id}
                      className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {it.imageUrlSnapshot && (
                          <img
                            src={it.imageUrlSnapshot}
                            alt={it.productNameSnapshot}
                            className="w-10 h-10 rounded-lg object-cover bg-zinc-800"
                          />
                        )}
                        <div>
                          <div className="font-bold text-zinc-200">{it.productNameSnapshot}</div>
                          <div className="text-[11px] text-zinc-500">
                            Rs. {it.sellingPriceSnapshot.toLocaleString()} × {it.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-amber-400">
                        Rs. {it.lineRevenue.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details & Financial Summary */}
              <div className="md:col-span-5 bg-zinc-950/90 rounded-2xl p-5 border border-zinc-800/80 space-y-4">
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" /> Delivery Address
                  </h4>
                  <div className="text-zinc-300 font-semibold">{order.customerName}</div>
                  <div className="text-zinc-400 text-[11px] mt-0.5">{order.address}</div>
                  <div className="text-amber-400/90 text-[11px] font-semibold mt-0.5">
                    {order.area}
                  </div>
                  <div className="text-zinc-500 text-[11px] mt-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {order.phone}
                  </div>
                  {order.notes && (
                    <div className="mt-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
                      <strong>Note:</strong> {order.notes}
                    </div>
                  )}
                </div>

                <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal:</span>
                    <span className="font-medium text-zinc-200">
                      Rs. {order.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Delivery Fee:</span>
                    <span className="font-medium text-zinc-200">
                      Rs. {order.deliveryCharge.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-zinc-800 pt-2 flex justify-between text-sm font-black text-white">
                    <span>Grand Total:</span>
                    <span className="text-amber-400">Rs. {order.total.toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 italic mt-1">
                    Payment: Cash on Delivery (COD)
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
