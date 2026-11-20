import { createTheme } from '@mui/material/styles';

export const createAppTheme = (mode = 'light') => {
  const dark = mode === 'dark';
  return createTheme({
  palette: {
    mode,
    primary: { main: dark ? '#8fc9a7' : '#1e6046', dark: dark ? '#377a55' : '#12392d', light: dark ? '#244934' : '#deefda', contrastText: dark ? '#102219' : '#ffffff' },
    secondary: { main: dark ? '#f0a36e' : '#d6753b', light: dark ? '#56351f' : '#fff0df', dark: dark ? '#b96336' : '#a75025' },
    background: dark ? { default: '#111a15', paper: '#19251e' } : { default: '#f7f8f3', paper: '#fffefa' },
    text: dark ? { primary: '#e7efe9', secondary: '#a9b9ad' } : { primary: '#17372b', secondary: '#65786e' },
    divider: dark ? '#34463a' : '#e1e9df',
  },
  typography: {
    fontFamily: '"DM Sans", "Noto Sans Tamil", "Segoe UI", sans-serif',
    h1: { fontSize: '3.1rem', lineHeight: 1.12, fontWeight: 700, letterSpacing: '-0.035em' },
    h2: { fontSize: '2.4rem', lineHeight: 1.15, fontWeight: 700, letterSpacing: '-0.035em' },
    h3: { fontSize: '1.9rem', lineHeight: 1.2, fontWeight: 700, letterSpacing: '-0.03em' },
    h4: { fontSize: '1.55rem', lineHeight: 1.25, fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontSize: '1.3rem', lineHeight: 1.3, fontWeight: 700 },
    h6: { fontSize: '1.1rem', lineHeight: 1.35, fontWeight: 700 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '.875rem', lineHeight: 1.55 },
    button: { fontSize: '.9rem', textTransform: 'none', fontWeight: 750 },
  },
  shape: { borderRadius: 20 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { styleOverrides: { root: { border: `1px solid ${dark ? '#34463a' : '#e1e9df'}`, boxShadow: dark ? '0 12px 34px rgba(0, 0, 0, .18)' : '0 12px 34px rgba(35, 67, 48, 0.065)' } } },
    MuiTextField: { defaultProps: { size: 'small', variant: 'outlined' } },
  },
  });
};

export const theme = createAppTheme('light');
