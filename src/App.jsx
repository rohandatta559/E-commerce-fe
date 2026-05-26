import { useState, useEffect } from 'react';
import { Routes, Route, Link as RouterLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, Button, Badge, IconButton } from '@mui/material';
import { ShoppingCart, Person, FavoriteBorder, Search } from '@mui/icons-material';
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
import AboutUsPage from './AboutUsPage';
import ContactUsPage from './ContactUsPage';

// Routes where navbar should go dark/glass and container spacing removed
const IMMERSIVE_ROUTES = ['/login', '/sign-up'];

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(!!getAuthToken());
  const [role, setRole] = useState(localStorage.getItem('userRole') || 'user');
  const isAdminDashboard = role === 'admin' && location.pathname.startsWith('/admin');
  const isImmersive = IMMERSIVE_ROUTES.includes(location.pathname);

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
    navigate('/products');
  };

  const handleLoginClick = () => {
    navigate('/login', { state: { from: location.pathname } });
  };

  const navigateProtected = (path) => {
    if (isLoggedIn) {
      navigate(path);
      return;
    }
    navigate('/login', { state: { from: path } });
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
          bgcolor: '#ffffff',
          color: 'text.primary',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: 'none',
          zIndex: 1300,
          transition: 'background 0.4s ease, border-color 0.4s ease',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 }, alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {(!isLoggedIn || isImmersive) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2.5 }, mr: { xs: 1, sm: 3 } }}>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/contact-us"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                      color: 'inherit',
                      '&:hover': { color: 'inherit' },
                    }}
                  >
                    Contact Us
                  </Button>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/about-us"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                      color: 'inherit',
                      '&:hover': { color: 'inherit' },
                    }}
                  >
                    Our Story
                  </Button>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/products"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                      color: 'inherit',
                      '&:hover': { color: 'inherit' },
                    }}
                  >
                    New Arrivals
                  </Button>
                </Box>
              )}
              <Box
                component={RouterLink}
                to="/products"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                  position: { sm: 'absolute' },
                  left: { sm: '50%' },
                  transform: { sm: 'translateX(-50%)' },
                }}
              >
                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    fontWeight: 500,
                    letterSpacing: 0,
                    color: '#d4a73c',
                    lineHeight: 1.1,
                    fontSize: { xs: '1.8rem', sm: '2rem' },
                    fontFamily: 'Georgia, "Times New Roman", serif',
                  }}
                >
                  Shoply
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            {!isImmersive && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 }, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {isLoggedIn && !isAdminDashboard && (
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/cart"
                    startIcon={<ShoppingCart />}
                    sx={{ textTransform: 'none', fontWeight: 600, minWidth: { xs: 'auto', sm: 64 }, px: { xs: 1, sm: 1.5 } }}
                  >
                    <Badge badgeContent={cartCount} color="primary" sx={{ mr: { xs: 0, sm: 0.5 } }}>
                      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Cart</Box>
                    </Badge>
                  </Button>
                )}
                {!isLoggedIn ? (
                  <>
                    <IconButton
                      color="inherit"
                      aria-label="search"
                      sx={{ '&:hover': { color: 'inherit' } }}
                    >
                      <Search />
                    </IconButton>
                    <IconButton
                      color="inherit"
                      aria-label="login"
                      onClick={handleLoginClick}
                      sx={{ '&:hover': { color: 'inherit' } }}
                    >
                      <Person />
                    </IconButton>
                    <IconButton
                      color="inherit"
                      aria-label="wishlist"
                      onClick={() => navigateProtected('/wishlist')}
                      sx={{ '&:hover': { color: 'inherit' } }}
                    >
                      <Badge badgeContent={0} color="error">
                        <FavoriteBorder />
                      </Badge>
                    </IconButton>
                    <IconButton
                      color="inherit"
                      aria-label="cart"
                      onClick={() => navigate('/cart')}
                      sx={{ '&:hover': { color: 'inherit' } }}
                    >
                      <Badge badgeContent={cartCount} color="error">
                        <ShoppingCart />
                      </Badge>
                    </IconButton>
                  </>
                ) : (
                  <>
                    {!isAdminDashboard && (
                      <>
                        <Button color="inherit" component={RouterLink} to="/orders" sx={{ textTransform: 'none', fontWeight: 600, minWidth: { xs: 'auto', sm: 64 }, px: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
                          Orders
                        </Button>
                        <Button
                          color="inherit"
                          startIcon={<FavoriteBorder />}
                          component={RouterLink}
                          to="/wishlist"
                          sx={{ textTransform: 'none', fontWeight: 600, minWidth: { xs: 'auto', sm: 64 }, px: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.78rem', sm: '0.875rem' } }}
                        >
                          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Wishlist</Box>
                        </Button>
                        <Button
                          color="inherit"
                          startIcon={<Person />}
                          component={RouterLink}
                          to="/profile"
                          sx={{ textTransform: 'none', fontWeight: 600, minWidth: { xs: 'auto', sm: 64 }, px: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.78rem', sm: '0.875rem' } }}
                        >
                          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Profile</Box>
                        </Button>
                      </>
                    )}
                    <Button color="inherit" onClick={handleLogout} sx={{ textTransform: 'none', fontWeight: 600, minWidth: { xs: 'auto', sm: 64 }, px: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
                      Logout
                    </Button>
                    {role === 'admin' && (
                      <Button color="inherit" component={RouterLink} to="/admin" sx={{ textTransform: 'none', fontWeight: 600, minWidth: { xs: 'auto', sm: 64 }, px: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
                        Admin
                      </Button>
                    )}
                  </>
                )}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      {/*
        On immersive routes (login/signup): remove Container padding/margin entirely.
        The Login component uses position:fixed to cover the full viewport anyway,
        so the Container here just needs to not add visual noise.
      */}
      <Container
        maxWidth={isImmersive ? false : 'xl'}
        disableGutters={isImmersive}
        sx={{
          mt: isImmersive ? 0 : 4,
          mb: isImmersive ? 0 : 4,
          flex: 1,
          p: isImmersive ? '0 !important' : undefined,
        }}
      >
        <Routes>
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to={role === 'admin' ? '/admin' : '/products'} replace />
              ) : (
                <Login onLoginSuccess={handleAuthSuccess} />
              )
            }
          />
          <Route
            path="/"
            element={
              <Navigate to={isLoggedIn && role === 'admin' ? '/admin' : '/products'} replace />
            }
          />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path='/sign-up' element={<SignUp onSignUpSuccess={handleAuthSuccess} />} />
          <Route path='/about-us' element={<AboutUsPage />} />
          <Route path='/contact-us' element={<ContactUsPage />} />
          <Route path='/cart' element={<CartPage />} />
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

      {/* Hide footer on immersive routes */}
      {!isImmersive && (
        <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', mt: 'auto' }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
              <Button component={RouterLink} to="/about-us" sx={{ textTransform: 'none' }}>
                About Us
              </Button>
              <Button component={RouterLink} to="/contact-us" sx={{ textTransform: 'none' }}>
                Contact Us
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" align="center">
              {'Copyright '}
              {new Date().getFullYear()}
              {' E-Commerce Store. All rights reserved.'}
            </Typography>
          </Container>
        </Box>
      )}
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