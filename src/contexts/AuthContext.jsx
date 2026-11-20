import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isDemoMode, isSupabaseConfigured, supabase } from '../lib/supabase';
import { getProfile, signIn as signInService, signOut as signOutService, updateProfile as updateProfileService } from '../services/authService';

const AuthContext = createContext(null);

function profileFromUser(user) {
  return {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name || '',
    role: 'contributor',
    is_active: true,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    const loadProfileFor = async (nextSession) => {
      if (!nextSession?.user) {
        if (active) setProfile(null);
        return;
      }
      try {
        const nextProfile = await getProfile(nextSession.user.id);
        if (active) setProfile(nextProfile);
      } catch {
        if (active) setProfile(profileFromUser(nextSession.user));
      } finally {
        if (active) setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) window.setTimeout(() => loadProfileFor(nextSession), 0);
      else { setProfile(null); setLoading(false); }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const result = await signInService(email, password);
    setSession(result.session);
    try { setProfile(await getProfile(result.user.id)); }
    catch { setProfile(profileFromUser(result.user)); }
    return result;
  };

  const signOut = async () => {
    await signOutService();
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (fullName) => {
    const updated = await updateProfileService(fullName);
    setProfile((current) => ({ ...current, ...updated }));
    return updated;
  };

  const previewSignIn = () => {
    setSession({ access_token: 'preview-token', user: { id: 'preview-admin' } });
    setProfile({ id: 'preview-admin', email: 'admin@abagri.preview', full_name: 'AB Agri Admin', role: 'admin', is_active: true });
  };

  const value = useMemo(() => ({
    session,
    profile,
    loading,
    isDemoMode: isDemoMode || !isSupabaseConfigured,
    isAuthenticated: Boolean(session),
    isAdmin: profile?.role === 'admin' && profile?.is_active !== false,
    isContributor: profile?.role === 'contributor' && profile?.is_active !== false,
    signIn,
    signOut,
    updateProfile,
    previewSignIn,
  }), [session, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
