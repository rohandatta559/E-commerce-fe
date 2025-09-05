import { useState, useEffect } from 'react';
import { Routes, Route, Link as RouterLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
import { ShoppingCart, Login as LoginIcon, Person } from '@mui/icons-material';
import { CartProvider } from './contexts/CartContext';
import ProductList from './ProductListPage';
import Login from './Login';
import { getAuthToken, setAuthToken } from './services/api';
import SignUp from './Sign-up';
import CartPage from './CartPage';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
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
    h4: {
      fontWeight: 600,
    },
  },
});

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(!!getAuthToken());

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // Verify token with backend
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setIsLoggedIn(false);
    navigate('/login');
  };

  const handleLoginClick = () => {
    navigate('/login', { state: { from: location.pathname } });
  };

  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }
    return children;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <ShoppingCart sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              E-Commerce Store
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isLoggedIn ? (
              <Button
                color="inherit"
                startIcon={<LoginIcon />}
                onClick={handleLoginClick}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                Login
              </Button>
            ) : (
              <>
                <Button
                  color="inherit"
                  startIcon={<Person />}
                  component={RouterLink}
                  to="/profile"
                >
                  Profile
                </Button>
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Routes>
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/products" replace />
              ) : (
                <Login
                  onLoginSuccess={handleLoginSuccess}
                />
              )
            }
          />
          <Route
            path="/"
            element={
              <Navigate to="/login" replace />
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProductList />
              </ProtectedRoute>
            }
          />
          <Route 
          path='/sign-up'
          element={<SignUp/>}
          />
          <Route 
          path='/cart'
          element={<CartPage/>}
          />
        </Routes>
      </Container>

      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', mt: 'auto' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright '}
            {new Date().getFullYear()}
            {' E-Commerce Store. All rights reserved.'}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CartProvider>
        <CssBaseline />
        <Navigation />
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;