const API_URL = import.meta.env.VITE_API_URL || 'https://hieusachsamsam.store';
const TOKEN_KEY = 'adminToken';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function isAuthError(res, data) {
  if (res.status === 401) return true;
  const msg = String(data?.message || '').toLowerCase();
  return (
    msg.includes('invalid or expired token') ||
    msg.includes('jwt expired') ||
    msg.includes('invalid token') ||
    msg.includes('unauthorized')
  );
}

function redirectToLogin() {
  localStorage.removeItem(TOKEN_KEY);
  if (typeof window === 'undefined') return;
  if (window.location.pathname === '/login') return;
  const from = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const next = `/login?expired=1&from=${encodeURIComponent(from)}`;
  window.location.replace(next);
}

function createAuthRedirectError(message) {
  const err = new Error(message || 'Phiên đăng nhập đã hết hạn');
  err.silentAuthRedirect = true;
  return err;
}

export async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (isAuthError(res, data)) {
    redirectToLogin();
    throw createAuthRedirectError(data.message || 'Invalid or expired token');
  }
  if (!res.ok) throw new Error(data.message || res.statusText);
  return data;
}

export async function requestUpload(path, formData) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (isAuthError(res, data)) {
    redirectToLogin();
    throw createAuthRedirectError(data.message || 'Invalid or expired token');
  }
  if (!res.ok) throw new Error(data.message || res.statusText);
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export default api;
