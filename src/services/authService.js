import { apiRequest, clearAccessToken, getAccessToken, isApiConfigured, setAccessToken } from '../lib/api';

export async function signIn(email, password, remember = true) {
  if (!isApiConfigured) throw new Error('Python API is not configured. Add VITE_API_URL to .env.');
  const result = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  setAccessToken(result.access_token, remember);
  return result;
}

export async function signOut() {
  try {
    if (isApiConfigured && getAccessToken()) await apiRequest("/auth/logout", { method: "POST" });
  } catch {
    // Always clear the browser session even if the API is temporarily unavailable.
  } finally {
    clearAccessToken();
  }
}
export async function requestPasswordReset(email) { if (!isApiConfigured) throw new Error('Python API is not configured. Add VITE_API_URL to .env.'); return apiRequest('/auth/password-reset/request', { method: 'POST', body: JSON.stringify({ email }) }); }
export async function confirmPasswordReset(token, password) { if (!isApiConfigured) throw new Error('Python API is not configured. Add VITE_API_URL to .env.'); return apiRequest('/auth/password-reset/confirm', { method: 'POST', body: JSON.stringify({ token, password }) }); }
export async function getProfile() { return getAccessToken() ? apiRequest('/auth/me') : null; }
export async function updateProfile(full_name) { return apiRequest('/auth/profile', { method: 'PATCH', body: JSON.stringify({ full_name }) }); }
