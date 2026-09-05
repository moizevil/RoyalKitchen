import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Clock,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Truck,
  ChefHat,
  PackageCheck,
  Home,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Order, OrderStatus } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { OrderTimeline } from '../../components/OrderTimeline';

export const AdminOrdersPage: React.FC = () => {
  const { authFetch } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = '/api/orders';
      if (selectedStatus !== 'ALL') {
        url += `?status=${selectedStatus}`;
      }
      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setStatusUpdating(true);
    try {
      const res = await authFetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updated);
        }
      }
    } catch (e) {
      console.error('Failed to update status', e);
    } finally {
      setStatusUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.address.toLowerCase().includes(q)
    );
  });

  const statuses: { label: string; value: string }[] = [
    { label: 'ALL ORDERS', value: 'ALL' },
    { label: 'NEW', value: 'NEW' },
    { label: 'CONFIRMED', value: 'CONFIRMED' },
    { label: 'PREPARING', value: 'PREPARING' },
    { label: 'READY', value: 'READY' },
    { label: 'OUT FOR DELIVERY', value: 'OUT_FOR_DELIVERY' },
    { label: 'DELIVERED', value: 'DELIVERED' },
    { label: 'CANCELLED', value: 'CANCELLED' },
  ];

  const handleWhatsAppCustomer = (order: Order) => {
    const cleanPhone = order.phone.replace(/[^0-9]/g, '');
    let intlPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      intlPhone = '92' + cleanPhone.slice(1);
    }
    const msg = encodeURIComponent(
      `Salam ${order.customerName}! This is Royal Kitchen regarding your order ${order.orderNumber}.`
    );
    window.open(`https://wa.me/${intlPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            ORDER MANAGEMENT
          </h1>
          <p className="text-xs text-zinc-400">
            Monitor, update, and fulfill deliveries across Sargodha, Pakistan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setSelectedStatus(s.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all ${
                selectedStatus === s.value
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order #, Name, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-800 text-[11px]">
              <tr>
                <th className="p-4">Order #</th>
                <th className="p-4">Customer & Phone</th>
                <th className="p-4">Delivery Address</th>
                <th className="p-4">Items Count</th>
                <th className="p-4">Total (Rs.)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    No orders found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="p-4 font-black text-amber-400 font-mono">
                      {order.orderNumber}
                      <div className="text-[10px] text-zinc-500 font-sans font-normal">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white">{order.customerName}</div>
                      <div className="text-zinc-400 text-[11px]">{order.phone}</div>
                    </td>

                    <td className="p-4 max-w-xs truncate">
                      <div className="text-zinc-200 truncate">{order.address}</div>
                      <div className="text-amber-400/80 text-[10px] font-semibold">{order.area}</div>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-bold text-[11px]">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} items
                      </span>
                    </td>

                    <td className="p-4 font-black text-white text-sm">
                      Rs. {order.total.toLocaleString()}
                    </td>

                    <td className="p-4">
                      <StatusBadge status={order.status} size="sm" />
                    </td>

                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 font-bold text-xs transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-black text-amber-400 font-mono">
                    {selectedOrder.orderNumber}
                  </span>
                  <StatusBadge status={selectedOrder.status} size="md" />
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleWhatsAppCustomer(selectedOrder)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Timeline */}
              <OrderTimeline status={selectedOrder.status} />

              {/* Status Update Quick Bar */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                  Quick Advance Status:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={statusUpdating || selectedOrder.status === 'CONFIRMED'}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'CONFIRMED')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-950 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900 text-xs font-bold transition-colors"
                  >
                    Confirm Order
                  </button>
                  <button
                    disabled={statusUpdating || selectedOrder.status === 'PREPARING'}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'PREPARING')}
                    className="px-3 py-1.5 rounded-xl bg-amber-950 border border-amber-500/40 text-amber-300 hover:bg-amber-900 text-xs font-bold transition-colors"
                  >
                    Start Cooking
                  </button>
                  <button
                    disabled={statusUpdating || selectedOrder.status === 'READY'}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'READY')}
                    className="px-3 py-1.5 rounded-xl bg-teal-950 border border-teal-500/40 text-teal-300 hover:bg-teal-900 text-xs font-bold transition-colors"
                  >
                    Ready for Dispatch
                  </button>
                  <button
                    disabled={statusUpdating || selectedOrder.status === 'OUT_FOR_DELIVERY'}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'OUT_FOR_DELIVERY')}
                    className="px-3 py-1.5 rounded-xl bg-orange-950 border border-orange-500/40 text-orange-300 hover:bg-orange-900 text-xs font-bold transition-colors"
                  >
                    Out for Delivery
                  </button>
                  <button
                    disabled={statusUpdating || selectedOrder.status === 'DELIVERED'}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 text-xs font-bold transition-colors"
                  >
                    Delivered
                  </button>
                  <button
                    disabled={statusUpdating || selectedOrder.status === 'CANCELLED'}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this order?')) {
                        handleUpdateStatus(selectedOrder.id, 'CANCELLED');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-950 border border-rose-500/40 text-rose-300 hover:bg-rose-900 text-xs font-bold transition-colors ml-auto"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                    Customer Information
                  </h4>
                  <div className="text-zinc-300 font-semibold text-sm">
                    {selectedOrder.customerName}
                  </div>
                  <div className="text-zinc-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-500" /> {selectedOrder.phone}
                  </div>
                  {selectedOrder.notes && (
                    <div className="mt-2 p-2 rounded-lg bg-zinc-900 text-amber-300 text-[11px]">
                      <strong>Customer Notes:</strong> {selectedOrder.notes}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                    Delivery Location
                  </h4>
                  <div className="text-zinc-300 font-medium">{selectedOrder.address}</div>
                  <div className="text-amber-400 font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {selectedOrder.area}
                  </div>
                  <div className="text-zinc-500 text-[11px]">
                    Payment: <strong className="text-emerald-400">Cash on Delivery</strong>
                  </div>
                </div>
              </div>

              {/* Ordered Items Breakdown Table (ADMIN ONLY VIEW WITH 50% PROFIT METRICS) */}
              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs">
                  Line Items & Profit Breakdown
                </h4>
                <div className="rounded-2xl border border-zinc-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950 text-zinc-400 font-bold text-[10px] uppercase border-b border-zinc-800">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Selling Price</th>
                        <th className="p-3 text-right">Buying Cost</th>
                        <th className="p-3 text-right">Profit / Unit</th>
                        <th className="p-3 text-right">Line Revenue</th>
                        <th className="p-3 text-right">Line Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-zinc-300 bg-zinc-950/40">
                      {selectedOrder.items.map((it) => (
                        <tr key={it.id}>
                          <td className="p-3 font-bold text-white flex items-center gap-2">
                            {it.imageUrlSnapshot && (
                              <img
                                src={it.imageUrlSnapshot}
                                alt={it.productNameSnapshot}
                                className="w-8 h-8 rounded-lg object-cover bg-zinc-800 shrink-0"
                              />
                            )}
                            <span>{it.productNameSnapshot}</span>
                          </td>
                          <td className="p-3 text-center font-black">{it.quantity}</td>
                          <td className="p-3 text-right">
                            Rs. {it.sellingPriceSnapshot.toLocaleString()}
                          </td>
                          <td className="p-3 text-right text-rose-400">
                            Rs. {it.buyingCostSnapshot.toLocaleString()}
                          </td>
                          <td className="p-3 text-right text-emerald-400 font-bold">
                            Rs. {it.profitPerUnitSnapshot.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-black text-white">
                            Rs. {it.lineRevenue.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-black text-emerald-400">
                            Rs. {it.lineProfit.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Totals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Order Totals</span>
                  <div className="flex justify-between text-zinc-300">
                    <span>Subtotal:</span>
                    <span>Rs. {selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Delivery Charge:</span>
                    <span>Rs. {selectedOrder.deliveryCharge.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-zinc-800 pt-1.5 flex justify-between text-sm font-black text-white">
                    <span>Total Bill:</span>
                    <span className="text-amber-400">
                      Rs. {selectedOrder.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">
                    Order Financial Analysis (50% System)
                  </span>
                  <div className="flex justify-between text-zinc-300">
                    <span>Total Product Cost:</span>
                    <span className="text-rose-400 font-bold">
                      Rs. {selectedOrder.totalBuyingCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Total Product Profit:</span>
                    <span className="text-emerald-400 font-bold">
                      Rs. {selectedOrder.totalProductProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-zinc-800 pt-1.5 flex justify-between text-xs font-bold text-zinc-300">
                    <span>Gross Margin:</span>
                    <span className="text-emerald-400">
                      {selectedOrder.subtotal > 0
                        ? ((selectedOrder.totalProductProfit / selectedOrder.subtotal) * 100).toFixed(
                            1
                          )
                        : '50'}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
