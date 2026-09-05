import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminUser {
  userId?: string;
  username: string;
  role?: string;
}

interface AuthContextType {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('rk_admin_token');
  });
  const [user, setUser] = useState<AdminUser | null>(() => {
    const savedUser = localStorage.getItem('rk_admin_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Check token validity on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem('rk_admin_user', JSON.stringify(data.user));
        } else {
          // Token expired or invalid
          setToken(null);
          setUser(null);
          localStorage.removeItem('rk_admin_token');
          localStorage.removeItem('rk_admin_user');
        }
      } catch (e) {
        console.error('Failed to verify admin auth token', e);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('rk_admin_token', data.token);
      localStorage.setItem('rk_admin_user', JSON.stringify(data.user));

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Server connection error' };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        // ignore
      }
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('rk_admin_token');
    localStorage.removeItem('rk_admin_user');
  };

  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      // Unauthorized, clear session
      setToken(null);
      setUser(null);
      localStorage.removeItem('rk_admin_token');
      localStorage.removeItem('rk_admin_user');
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
