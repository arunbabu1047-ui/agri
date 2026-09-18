import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearAccessToken, getAccessToken, isApiConfigured } from '../lib/api';
import { getProfile, signIn as signInService, signOut as signOutService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getAccessToken() ? { access_token: getAccessToken() } : null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(getAccessToken() && isApiConfigured));
  useEffect(() => {
    if (!isApiConfigured || !getAccessToken()) { setLoading(false); return undefined; }
    getProfile().then((user) => { setProfile(user); setSession({ access_token: getAccessToken() }); }).catch(() => { clearAccessToken(); setSession(null); setProfile(null); }).finally(() => setLoading(false));
    return undefined;
  }, []);
  const signIn = async (email, password, remember) => { const result = await signInService(email, password, remember); setSession(result); setProfile(result.user); return result; };
  const signOut = async () => { await signOutService(); setSession(null); setProfile(null); };
  const previewSignIn = () => { setSession({ access_token: 'preview-token' }); setProfile({ id: 'preview-admin', email: 'admin@agripulse.preview', full_name: 'Agri Pulse Admin', role: 'admin' }); };
  const value = useMemo(() => ({ session, profile, loading, isDemoMode: !isApiConfigured, isAuthenticated: Boolean(session), isAdmin: profile?.role === 'admin', isContributor: profile?.role === 'contributor', signIn, signOut, previewSignIn }), [session, profile, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
