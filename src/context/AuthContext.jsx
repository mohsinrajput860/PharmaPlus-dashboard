import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem('admin_token') || null);
  const [email, setEmail]   = useState(() => localStorage.getItem('admin_email') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const isLoggedIn = !!token;

  async function login(emailVal, password) {
    setLoading(true);
    setError(null);
    try {
      const { ok, data } = await authApi.login(emailVal, password);
      if (ok && data.success) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_email', emailVal);
        setToken(data.token);
        setEmail(emailVal);
        return { success: true };
      }
      setError(data.error || 'Invalid credentials');
      return { success: false, error: data.error };
    } catch (e) {
      const msg = 'Connection failed — check API URL';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    setToken(null);
    setEmail(null);
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, token, email, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
