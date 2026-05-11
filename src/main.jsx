import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7c3aed',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ec4899',
      contrastText: '#ffffff',
    },
    info: {
      main: '#06b6d4',
      contrastText: '#ffffff',
    },
    success: {
      main: '#14b8a6',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      contrastText: '#ffffff',
    },
    background: {
      default: '#eef2ff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'radial-gradient(circle at top left, rgba(124, 58, 237, 0.14), transparent 30%), radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.12), transparent 25%), #eef2ff',
          minHeight: '100vh',
          color: '#1f2937',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          fontWeight: 700,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          overflow: 'hidden',
        },
      },
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
