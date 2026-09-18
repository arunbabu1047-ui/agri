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
    fontFamily: '"Noto Sans Tamil", "DM Sans", "Segoe UI", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.065em' },
    h2: { fontWeight: 800, letterSpacing: '-0.055em' },
    h3: { fontWeight: 800, letterSpacing: '-0.045em' },
    button: { textTransform: 'none', fontWeight: 800 },
  },
  shape: { borderRadius: 20 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { styleOverrides: { root: { border: '1px solid #e1e9df', boxShadow: '0 12px 34px rgba(35, 67, 48, 0.065)' } } },
    MuiTextField: { defaultProps: { size: 'small', variant: 'outlined' } },
  },
});
