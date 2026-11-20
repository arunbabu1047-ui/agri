import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1e6046', dark: '#12392d', light: '#deefda', contrastText: '#ffffff' },
    secondary: { main: '#d6753b', light: '#fff0df', dark: '#a75025' },
    background: { default: '#f7f8f3', paper: '#fffefa' },
    text: { primary: '#17372b', secondary: '#65786e' },
    divider: '#e1e9df',
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
    MuiCard: { styleOverrides: { root: { border: '1px solid #e1e9df', boxShadow: '0 12px 34px rgba(35, 67, 48, 0.065)' } } },
    MuiTextField: { defaultProps: { size: 'small', variant: 'outlined' } },
  },
});
