const API_URL = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const authApi = {
  me: () => api('/api/auth/me'),
  login: (email, password) => api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email, password, displayName) => api('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, displayName }) }),
  logout: () => api('/api/auth/logout', { method: 'POST' }),
};
