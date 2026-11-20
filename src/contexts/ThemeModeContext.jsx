import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeModeContext = createContext(null);
const STORAGE_KEY = 'ab-agri-theme-mode';

export function ThemeModeProvider({ children }) {
  const [mode, setModeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
  });
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return undefined;
    const update = (event) => setSystemDark(event.matches);
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  const setMode = (nextMode) => {
    setModeState(nextMode);
    localStorage.setItem(STORAGE_KEY, nextMode);
  };
  const resolvedMode = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

  const value = useMemo(() => ({ mode, resolvedMode, setMode }), [mode, resolvedMode]);
  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) throw new Error('useThemeMode must be used inside ThemeModeProvider');
  return context;
}
