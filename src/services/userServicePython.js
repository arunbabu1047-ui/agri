import { apiRequest, isApiConfigured } from '../lib/api';

export async function inviteContributor(email) { if (!isApiConfigured) return { preview: true, email }; return apiRequest('/admin/users/invite', { method: 'POST', body: JSON.stringify({ email }) }); }
export async function listContributors() { if (!isApiConfigured) return [{ id: 'preview-contributor', name: 'Kavya Raman', email: 'kavya@example.org', role: 'contributor', status: 'Active', joined: '12 Jun 2025' }]; return apiRequest('/admin/users'); }
