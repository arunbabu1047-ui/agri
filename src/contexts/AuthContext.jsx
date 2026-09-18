import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isDemoMode, isSupabaseConfigured } from '../lib/supabase';
import { getProfile, signIn as signInService, signOut as signOutService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(isSupabaseConfigured));

  useEffect(() => {
    if (!supabase) { setLoading(false); return undefined; }
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session) setProfile(await getProfile(data.session.user.id));
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setProfile(nextSession ? await getProfile(nextSession.user.id) : null);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const signIn = async (email, password) => { const result = await signInService(email, password); setSession(result.session); setProfile(await getProfile(result.user.id)); return result; };
  const signOut = async () => { await signOutService(); setSession(null); setProfile(null); };
  const previewSignIn = () => { setSession({ user: { id: 'preview-admin', email: 'admin@agripulse.preview' } }); setProfile({ id: 'preview-admin', full_name: 'Agri Pulse Admin', role: 'admin', email: 'admin@agripulse.preview' }); };
  const value = useMemo(() => ({ session, profile, loading, isDemoMode, isAuthenticated: Boolean(session), isAdmin: profile?.role === 'admin', isContributor: profile?.role === 'contributor', signIn, signOut, previewSignIn }), [session, profile, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
