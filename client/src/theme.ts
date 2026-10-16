import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1f6f5c', light: '#4f9c87', dark: '#0f4a3c', contrastText: '#ffffff' },
    secondary: { main: '#c77d1a' },
    success: { main: '#2e7d32' },
    warning: { main: '#ed8b00' },
    error: { main: '#c62828' },
    background: { default: '#f5f7f6', paper: '#ffffff' },
    text: { primary: '#17201d', secondary: '#5b6964' },
    divider: '#e2e8e5',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, color: '#5b6964', whiteSpace: 'nowrap' },
      },
    },
  },
})
