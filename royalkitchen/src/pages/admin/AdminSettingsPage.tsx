import React, { useState, useEffect } from 'react';
import {
  Settings,
  Lock,
  Phone,
  Clock,
  MapPin,
  DollarSign,
  Percent,
  CheckCircle,
  AlertTriangle,
  Save,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export const AdminSettingsPage: React.FC = () => {
  const { authFetch } = useAuth();
  const { settings, refreshSettings } = useStore();

  // Store General Settings
  const [restaurantName, setRestaurantName] = useState('');
  const [tagline, setTagline] = useState('');
  const [location, setLocation] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappInternational, setWhatsappInternational] = useState('');
  const [openingTime, setOpeningTime] = useState('14:00');
  const [closingTime, setClosingTime] = useState('00:00');
  const [deliveryCharge, setDeliveryCharge] = useState(100);
  const [defaultCostPercentage, setDefaultCostPercentage] = useState(50);

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (settings) {
      setRestaurantName(settings.restaurantName || 'Royal Kitchen');
      setTagline(settings.tagline || 'Delicious Food. Made With Care.');
      setLocation(settings.location || 'Sargodha, Pakistan');
      setServiceArea(settings.serviceArea || 'Sargodha, Pakistan');
      setWhatsappNumber(settings.whatsappNumber || '03433094276');
      setWhatsappInternational(settings.whatsappInternational || '923433094276');
      setOpeningTime(settings.openingTime || '14:00');
      setClosingTime(settings.closingTime || '00:00');
      setDeliveryCharge(settings.deliveryCharge ?? 100);
      setDefaultCostPercentage(settings.defaultCostPercentage ?? 50);
    }
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMessage(null);

    try {
      const payload = {
        restaurantName,
        tagline,
        location,
        serviceArea,
        whatsappNumber,
        whatsappInternational,
        openingTime,
        closingTime,
        deliveryCharge: Number(deliveryCharge),
        defaultCostPercentage: Number(defaultCostPercentage),
      };

      const res = await authFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSettingsMessage('Settings saved successfully!');
        await refreshSettings();
      } else {
        setSettingsMessage('Failed to save settings.');
      }
    } catch {
      setSettingsMessage('Network error while saving settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await authFetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage({
          type: 'error',
          text: data.error || 'Failed to change password. Check current password.',
        });
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'Error communicating with server.' });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">STORE SETTINGS</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Operational hours, WhatsApp hotline, service zones, and administrative security
        </p>
      </div>

      {/* General Store Configuration Form */}
      <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-6">
        <div className="flex items-center gap-2 text-white">
          <Settings className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-black uppercase tracking-wide">Restaurant Profile & Hours</h2>
        </div>

        {settingsMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{settingsMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Restaurant Name */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Restaurant Name
              </label>
              <input
                type="text"
                required
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" /> Physical Location
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Service Area */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" /> Delivery Coverage Zone
              </label>
              <input
                type="text"
                required
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* WhatsApp Local */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Hotline (Local)
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* WhatsApp International */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp (International digits)
              </label>
              <input
                type="text"
                required
                value={whatsappInternational}
                onChange={(e) => setWhatsappInternational(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Opening Time */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Opening Time (e.g. 14:00 = 2:00 PM)
              </label>
              <input
                type="time"
                required
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Closing Time */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Closing Time (e.g. 00:00 = Midnight)
              </label>
              <input
                type="time"
                required
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Delivery Charge */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-500" /> Delivery Fee (Sargodha, Rs.)
              </label>
              <input
                type="number"
                required
                min={0}
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Default Cost Percentage */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-amber-500" /> Default Cost % (50/50 System)
              </label>
              <input
                type="number"
                required
                min={10}
                max={90}
                value={defaultCostPercentage}
                onChange={(e) => setDefaultCostPercentage(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              id="save-store-settings-btn"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" /> {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Admin Security & Password Change */}
      <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-6 max-w-xl">
        <div className="flex items-center gap-2 text-white">
          <KeyRound className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-black uppercase tracking-wide">Change Admin Password</h2>
        </div>

        {passwordMessage && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
              passwordMessage.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border border-rose-600/50 text-rose-300'
            }`}
          >
            {passwordMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{passwordMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              New Password *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 6 characters)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            id="change-password-submit-btn"
            className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider transition-colors border border-zinc-700/80"
          >
            {changingPassword ? 'Updating Password...' : 'Update Admin Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
