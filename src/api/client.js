/**
 * API Client — talks to Cloudflare Worker backend
 * Base URL is read from env: VITE_API_URL
 */

const BASE = import.meta.env.VITE_API_URL || 'https://pharma-license-backend.YOUR_SUBDOMAIN.workers.dev';

function getToken() {
  return localStorage.getItem('admin_token') || '';
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok && res.status === 401) {
    // Token expired — clear and redirect
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    window.location.href = '/login';
  }
  return { ok: res.ok, status: res.status, data };
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:  (email, password) => request('POST', '/api/admin/login', { email, password }),
  logout: ()                => request('POST', '/api/admin/logout'),
};

// ── Stats ─────────────────────────────────────────────────────────────────────
export const statsApi = {
  get: () => request('GET', '/api/admin/stats'),
};

// ── Machines ──────────────────────────────────────────────────────────────────
export const machinesApi = {
  list:           (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/api/admin/machines${q ? '?' + q : ''}`);
  },
  get:            (hwid)        => request('GET',    `/api/admin/machines/${encodeURIComponent(hwid)}`),
  update:         (hwid, data)  => request('PUT',    `/api/admin/machines/${encodeURIComponent(hwid)}`, data),
  delete:         (hwid)        => request('DELETE', `/api/admin/machines/${encodeURIComponent(hwid)}`),
  authorize:      (hwid, days)  => request('POST',   `/api/admin/machines/${encodeURIComponent(hwid)}/authorize`, { days }),
  revoke:         (hwid)        => request('POST',   `/api/admin/machines/${encodeURIComponent(hwid)}/revoke`),
  trial:          (hwid)        => request('POST',   `/api/admin/machines/${encodeURIComponent(hwid)}/trial`),
  updateFeatures: (hwid, flags) => request('PUT',    `/api/admin/machines/${encodeURIComponent(hwid)}/features`, flags),
  getLogs:        (hwid)        => request('GET',    `/api/admin/machines/${encodeURIComponent(hwid)}/logs`),
};
