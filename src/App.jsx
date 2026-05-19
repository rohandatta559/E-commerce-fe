import { useState, useEffect } from 'react';
import { Routes, Route, Link as RouterLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, Button, Badge } from '@mui/material';
import { ShoppingCart, Login as LoginIcon, Person, FavoriteBorder } from '@mui/icons-material';
import { CartProvider, useCart } from './contexts/CartContext';
import ProductList from './ProductListPage';
import Login from './Login';
import { getAuthToken, setAuthToken } from './services/api';
import SignUp from './Sign-up';
import CartPage from './CartPage';
import ProfilePage from './ProfilePage';
import CheckoutPage from './CheckoutPage';
import OrdersPage from './OrdersPage';
import ProductDetailsPage from './ProductDetailsPage';
import AdminPage from './AdminPage';
import WishlistPage from './WishlistPage';
import TrackOrderPage from './TrackOrderPage';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(!!getAuthToken());
  const [role, setRole] = useState(localStorage.getItem('userRole') || 'user');

  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  useEffect(() => {
    setIsLoggedIn(!!getAuthToken());
    setRole(localStorage.getItem('userRole') || 'user');
  }, [location.pathname]);

  useEffect(() => {
    const handleAuthExpired = () => {
      setIsLoggedIn(false);
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [navigate]);

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setRole(localStorage.getItem('userRole') || 'user');
  };

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
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
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255,255,255,0.95)',
          color: 'text.primary',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 64 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                component={RouterLink}
                to={isLoggedIn ? '/products' : '/login'}
                sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
              >
                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: 0,
                    background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 55%, #f59e0b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.1,
                  }}
                >
                  Shoply
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {isLoggedIn && (
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/cart"
                  startIcon={<ShoppingCart />}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  <Badge badgeContent={cartCount} color="primary">
                    Cart
                  </Badge>
                </Button>
              )}
              {!isLoggedIn ? (
                <Button
                  color="inherit"
                  startIcon={<LoginIcon />}
                  onClick={handleLoginClick}
                  sx={{ display: { xs: 'none', sm: 'flex' }, textTransform: 'none', fontWeight: 600 }}
                >
                  Login
                </Button>
              ) : (
                <>
                  <Button color="inherit" component={RouterLink} to="/orders" sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Orders
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<FavoriteBorder />}
                    component={RouterLink}
                    to="/wishlist"
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Wishlist
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<Person />}
                    component={RouterLink}
                    to="/profile"
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Profile
                  </Button>
                  <Button color="inherit" onClick={handleLogout} sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Logout
                  </Button>
                  {role === 'admin' && (
                    <Button color="inherit" component={RouterLink} to="/admin" sx={{ textTransform: 'none', fontWeight: 600 }}>
                      Admin
                    </Button>
                  )}
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
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
                  onLoginSuccess={handleAuthSuccess}
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
            path="/products/:id"
            element={
              <ProtectedRoute>
                <ProductDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route 
          path='/sign-up'
          element={<SignUp onSignUpSuccess={handleAuthSuccess} />}
          />
          <Route 
          path='/cart'
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
          />
          <Route
          path='/checkout'
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
          />
          <Route
          path='/orders'
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
          />
          <Route
            path='/track/:orderId'
            element={
              <ProtectedRoute>
                <TrackOrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/profile'
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/wishlist'
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin'
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
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
    <CartProvider>
      <Navigation />
    </CartProvider>
  );
}

export default App;
