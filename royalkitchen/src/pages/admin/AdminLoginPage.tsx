import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Utensils, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, onBackToStore }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('moiz');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(username, password);
    setLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || 'Invalid credentials. Please verify username and password.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back button */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <button
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-400 uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Storefront
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 relative z-10">
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-zinc-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Utensils className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">ROYAL KITCHEN</h2>
            <p className="text-xs font-bold tracking-wider uppercase text-amber-400">
              ADMIN MANAGEMENT PORTAL
            </p>
            <p className="text-xs text-zinc-400">
              Restricted access for restaurant administration and financial management.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-600/50 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" /> Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (e.g. moiz)"
                id="admin-username-input"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Password with show/hide toggle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  id="admin-password-input"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-11 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              id="admin-login-submit-btn"
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all duration-150 shadow-lg shadow-amber-500/20 active:scale-98 flex items-center justify-center gap-2"
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> LOGIN TO DASHBOARD
                </>
              )}
            </button>
          </form>

          <div className="pt-2 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setUsername('moiz');
                setPassword('moizkhansgd321!');
              }}
              className="text-[11px] font-bold text-amber-400/90 hover:text-amber-300 underline underline-offset-4 decoration-amber-500/40 transition-colors"
            >
              Fill Credentials (moiz /)
            </button>
            <span className="text-[10px] text-zinc-500">
              Royal Kitchen Management System • Sargodha, Pakistan
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
