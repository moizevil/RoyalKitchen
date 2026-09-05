import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings } from '../types';

interface StoreContextType {
  settings: StoreSettings | null;
  loading: boolean;
  isOpen: boolean;
  deliveryCharge: number;
  currency: string;
  refreshSettings: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error('Failed to load store settings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // Poll every 60 seconds to keep OPEN/CLOSED status fresh
    const interval = setInterval(fetchSettings, 60000);
    return () => clearInterval(interval);
  }, []);

  const isOpen = settings?.isOpen ?? true;
  const deliveryCharge = settings?.deliveryCharge ?? 100;
  const currency = settings?.currency || 'Rs.';

  return (
    <StoreContext.Provider
      value={{
        settings,
        loading,
        isOpen,
        deliveryCharge,
        currency,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
