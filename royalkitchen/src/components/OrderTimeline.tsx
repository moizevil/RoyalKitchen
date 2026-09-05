import React from 'react';
import { CheckCircle2, Clock, ChefHat, PackageCheck, Bike, Home, XCircle } from 'lucide-react';
import { OrderStatus } from '../types';

interface OrderTimelineProps {
  status: OrderStatus;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center gap-3 text-rose-300">
        <XCircle className="w-6 h-6 shrink-0 text-rose-500" />
        <div>
          <div className="font-bold text-sm">This order has been cancelled.</div>
          <div className="text-xs text-rose-400/80">
            For assistance or re-ordering, please contact Royal Kitchen on WhatsApp at 0343 3094276.
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'NEW', label: 'Order Placed', icon: Clock },
    { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'PREPARING', label: 'Preparing', icon: ChefHat },
    { key: 'READY', label: 'Ready', icon: PackageCheck },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Bike },
    { key: 'DELIVERED', label: 'Delivered', icon: Home },
  ];

  const statusHierarchy: Record<string, number> = {
    NEW: 0,
    CONFIRMED: 1,
    PREPARING: 2,
    READY: 3,
    OUT_FOR_DELIVERY: 4,
    DELIVERED: 5,
  };

  const currentStepIndex = statusHierarchy[status] ?? 0;

  return (
    <div className="w-full py-4">
      <div className="relative">
        {/* Track Line */}
        <div className="absolute top-5 left-6 right-6 h-1 bg-zinc-800 -translate-y-1/2 z-0 hidden sm:block">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 relative z-10">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCurrent
                      ? 'bg-amber-500 text-zinc-950 ring-4 ring-amber-500/20 shadow-lg scale-110'
                      : isCompleted
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`mt-2 text-xs font-semibold tracking-wide ${
                    isCurrent
                      ? 'text-amber-400 font-bold'
                      : isCompleted
                      ? 'text-emerald-400'
                      : 'text-zinc-500'
                  }`}
                >
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] uppercase tracking-wider text-amber-500/90 animate-pulse font-extrabold mt-0.5">
                    Current Status
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
