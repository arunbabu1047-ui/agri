export const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
export const isApiConfigured = Boolean(import.meta.env.VITE_API_URL);

const TOKEN_KEY = 'agri-api-token';

export function getAccessToken() { return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY); }
export function setAccessToken(token, remember = true) { (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token); }
export function clearAccessToken() { localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(TOKEN_KEY); }

async function parseResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || body.message || 'The API request failed.');
  return body;
}

export async function apiRequest(path, options = {}) {
  const headers = { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(options.headers || {}) };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers });
  return parseResponse(response);
}

export async function apiFormRequest(path, formData) { return apiRequest(path, { method: 'POST', body: formData }); }
