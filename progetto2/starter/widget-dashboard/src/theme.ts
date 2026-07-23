/** Il tema centralizza palette, forma e tipografia della dashboard MUI. */
import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',
      dark: '#1D4ED8',
      contrastText: '#F8FAFC',
    },
    secondary: {
      main: '#0B2545',
    },
    background: {
      default: '#F1F5F9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0B172A',
      secondary: '#475569',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'Roboto, system-ui, sans-serif',
    h1: {
      fontSize: 'clamp(2rem, 4vw, 3rem)',
      fontWeight: 700,
      letterSpacing: '-0.035em',
    },
    h2: {
      fontSize: '1.125rem',
      fontWeight: 700,
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 40 } },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});
