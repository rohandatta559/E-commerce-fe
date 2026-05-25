import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

/* ── Google Fonts: DM Serif Display + DM Sans ─────────────────────────────── */
const fontLink = document.createElement('link');
fontLink.href =
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@400;500;600;700;800&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const theme = createTheme({
  palette: {
    mode: 'light',

    primary: {
      // Gold — the brand signature colour
      main: '#d4a73c',
      light: '#e8c46a',
      dark: '#b8871e',
      contrastText: '#ffffff',
    },
    secondary: {
      // Deep warm brown — for accents, active states
      main: '#3d2d0e',
      light: '#5c4a28',
      dark: '#1a1208',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0ea5e9',
      contrastText: '#ffffff',
    },
    success: {
      main: '#16a34a',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      contrastText: '#fff',
    },
    error: {
      main: '#dc2626',
      contrastText: '#ffffff',
    },

    background: {
      // Warm cream — matches ProductList page root
      default: '#faf8f4',
      paper: '#ffffff',
    },

    text: {
      primary: '#1a1208',
      secondary: '#5c4a28',
      disabled: '#b8a88a',
    },

    divider: 'rgba(212, 167, 60, 0.18)',
  },

  typography: {
    // DM Sans for body, DM Serif Display applied manually on headings
    fontFamily: [
      "'DM Sans'",
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'sans-serif',
    ].join(','),

    h1: { fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, letterSpacing: '-0.02em' },
    h2: { fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, letterSpacing: '-0.015em' },
    h3: { fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400 },
    h4: { fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400 },
    h5: { fontFamily: "'DM Sans', sans-serif", fontWeight: 700 },
    h6: { fontFamily: "'DM Sans', sans-serif", fontWeight: 700 },

    subtitle1: { fontFamily: "'DM Sans', sans-serif", fontWeight: 500 },
    subtitle2: { fontFamily: "'DM Sans', sans-serif", fontWeight: 600 },
    body1:     { fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: '0.9375rem' },
    body2:     { fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: '0.875rem' },
    caption:   { fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: '#9e8e72' },

    button: {
      fontFamily: "'DM Sans', sans-serif",
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },

  shape: {
    borderRadius: 12,
  },

  shadows: [
    'none',
    '0 1px 3px rgba(26,18,8,0.07)',
    '0 2px 6px rgba(26,18,8,0.08)',
    '0 4px 12px rgba(26,18,8,0.09)',
    '0 6px 16px rgba(26,18,8,0.10)',
    '0 8px 20px rgba(26,18,8,0.10)',
    '0 10px 24px rgba(26,18,8,0.11)',
    '0 12px 28px rgba(26,18,8,0.11)',
    '0 14px 32px rgba(26,18,8,0.12)',
    '0 16px 36px rgba(26,18,8,0.12)',
    '0 18px 40px rgba(26,18,8,0.12)',
    '0 20px 44px rgba(26,18,8,0.13)',
    '0 22px 48px rgba(26,18,8,0.13)',
    '0 24px 52px rgba(26,18,8,0.13)',
    '0 26px 56px rgba(26,18,8,0.14)',
    '0 28px 60px rgba(26,18,8,0.14)',
    '0 30px 64px rgba(26,18,8,0.14)',
    '0 32px 68px rgba(26,18,8,0.15)',
    '0 34px 72px rgba(26,18,8,0.15)',
    '0 36px 76px rgba(26,18,8,0.15)',
    '0 38px 80px rgba(26,18,8,0.16)',
    '0 40px 84px rgba(26,18,8,0.16)',
    '0 42px 88px rgba(26,18,8,0.16)',
    '0 44px 92px rgba(26,18,8,0.17)',
    '0 46px 96px rgba(26,18,8,0.17)',
  ],

  components: {
    /* ── Global body background ── */
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': { boxSizing: 'border-box' },
        html: { scrollBehavior: 'smooth' },
        body: {
          background: '#faf8f4',
          minHeight: '100vh',
          color: '#1a1208',
          // Subtle warm-grain texture overlay via pseudo-element is impractical
          // here; handled per-page instead.
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        // Thin gold scrollbar for Webkit browsers
        '::-webkit-scrollbar': { width: 6, height: 6 },
        '::-webkit-scrollbar-track': { background: '#f5f0e8' },
        '::-webkit-scrollbar-thumb': {
          background: 'rgba(212,167,60,0.45)',
          borderRadius: 99,
        },
        '::-webkit-scrollbar-thumb:hover': { background: '#d4a73c' },
      },
    },

    /* ── Buttons ── */
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,        // pill by default, override per-component where needed
          fontWeight: 600,
          fontSize: '0.875rem',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #d4a73c 0%, #b8871e 100%)',
          color: '#fff',
          '&:hover': {
            background: 'linear-gradient(135deg, #c89a30 0%, #a77a18 100%)',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(212,167,60,0.45)',
          color: '#b8871e',
          '&:hover': {
            borderColor: '#d4a73c',
            background: 'rgba(212,167,60,0.06)',
          },
        },
        textPrimary: {
          color: '#d4a73c',
          '&:hover': { background: 'rgba(212,167,60,0.07)' },
        },
      },
    },

    /* ── Paper / cards ── */
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(26,18,8,0.07)',
        },
        outlined: {
          borderColor: 'rgba(212,167,60,0.2)',
          boxShadow: 'none',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(212,167,60,0.12)',
          boxShadow: '0 2px 12px rgba(26,18,8,0.07)',
          transition: 'transform 0.22s ease, box-shadow 0.22s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 32px rgba(26,18,8,0.13)',
          },
        },
      },
    },

    /* ── AppBar ── */
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },

    /* ── Text fields ── */
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(212,167,60,0.5)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d4a73c',
            borderWidth: '1.5px',
          },
        },
        notchedOutline: {
          borderColor: 'rgba(212,167,60,0.25)',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#9e8e72',
          fontSize: '0.875rem',
          '&.Mui-focused': { color: '#d4a73c' },
        },
      },
    },

    /* ── Chip ── */
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          fontSize: '0.78rem',
          borderRadius: 50,
        },
        colorPrimary: {
          background: 'rgba(212,167,60,0.12)',
          color: '#b8871e',
          border: '1px solid rgba(212,167,60,0.3)',
        },
      },
    },

    /* ── Alert ── */
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.875rem',
        },
      },
    },

    /* ── Tooltip ── */
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.78rem',
          background: '#1a1208',
          borderRadius: 8,
        },
        arrow: { color: '#1a1208' },
      },
    },

    /* ── Badge ── */
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          fontSize: '0.68rem',
        },
      },
    },

    /* ── Pagination ── */
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          borderRadius: 8,
          color: '#5c4a28',
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, #d4a73c, #b8871e)',
            color: '#fff',
            border: 'none',
          },
        },
      },
    },

    /* ── Divider ── */
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(212,167,60,0.18)' },
      },
    },

    /* ── Skeleton ── */
    MuiSkeleton: {
      styleOverrides: {
        root: {
          background: 'rgba(212,167,60,0.10)',
          '&::after': {
            background:
              'linear-gradient(90deg, transparent, rgba(212,167,60,0.15), transparent)',
          },
        },
      },
    },

    /* ── Toggle Button ── */
    MuiToggleButton: {
      styleOverrides: {
        root: {
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          borderRadius: 10,
          border: '1px solid rgba(212,167,60,0.25)',
          color: '#5c4a28',
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, #d4a73c, #b8871e)',
            color: '#fff',
            '&:hover': { background: 'linear-gradient(135deg, #c89a30, #a77a18)' },
          },
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