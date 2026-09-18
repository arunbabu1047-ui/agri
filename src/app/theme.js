import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1d6046', dark: '#123c2c', light: '#dff1e4', contrastText: '#ffffff' },
    secondary: { main: '#c7772f', light: '#f8ead8', dark: '#8d4d1d' },
    background: { default: '#fbfcf8', paper: '#ffffff' },
    text: { primary: '#183329', secondary: '#61736a' },
    divider: '#e3ebe3',
  },
  typography: {
    fontFamily: '"Noto Sans Tamil", "Inter", "Segoe UI", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.045em' },
    h2: { fontWeight: 800, letterSpacing: '-0.03em' },
    h3: { fontWeight: 750, letterSpacing: '-0.025em' },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { styleOverrides: { root: { border: '1px solid #e7eee8', boxShadow: '0 10px 30px rgba(31, 71, 46, 0.06)' } } },
    MuiTextField: { defaultProps: { size: 'small', variant: 'outlined' } },
  },
});
