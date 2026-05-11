import React from 'react';
import { Box, Typography, Container, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Divider, Grid } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from './contexts/CartContext';
import { formatINR } from './utils/currency';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartCount === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography color="text.secondary" paragraph>
            Looks like you haven't added anything to your cart yet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/products')}
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        sx={{
          p: 4,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.9), rgba(236,72,153,0.9))',
          color: 'common.white',
          borderRadius: 4,
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Shopping Cart
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.92 }}>
          Review your items and proceed to checkout
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <TableContainer
            component={Paper}
            elevation={2}
            sx={{
              borderRadius: 4,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
              border: '1px solid rgba(124,58,237,0.12)',
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(124,58,237,0.08)' }}>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Product</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: 'primary.main' }}>Price</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: 'primary.main' }}>Quantity</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>Total</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={item._id} sx={{ '&:hover': { bgcolor: 'rgba(124,58,237,0.04)' } }}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Box
                          component="img"
                          src={item.image || 'https://placehold.co/50x50?text=No+Image'}
                          alt={item.name}
                          sx={{ width: 60, height: 60, objectFit: 'cover', mr: 3, borderRadius: 2 }}
                        />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>{formatINR(item.price)}</TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center">
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          sx={{
                            bgcolor: 'rgba(124,58,237,0.1)',
                            '&:hover': { bgcolor: 'rgba(124,58,237,0.2)' },
                          }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body1" mx={2} sx={{ fontWeight: 600 }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          sx={{
                            bgcolor: 'rgba(124,58,237,0.1)',
                            '&:hover': { bgcolor: 'rgba(124,58,237,0.2)' },
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatINR(item.price * item.quantity)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => removeFromCart(item._id)}
                        color="error"
                        sx={{
                          bgcolor: 'rgba(239,68,68,0.1)',
                          '&:hover': { bgcolor: 'rgba(239,68,68,0.2)' },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={3} display="flex" justifyContent="space-between">
            <Button
              component={Link}
              to="/products"
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 700,
                borderColor: 'rgba(124,58,237,0.3)',
                '&:hover': { borderColor: 'primary.main' },
              }}
            >
              Continue Shopping
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={clearCart}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 700,
              }}
            >
              Clear Cart
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={2}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
              border: '1px solid rgba(124,58,237,0.12)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2, borderColor: 'rgba(124,58,237,0.2)' }} />

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography sx={{ fontWeight: 600 }}>Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</Typography>
              <Typography sx={{ fontWeight: 600 }}>{formatINR(cartTotal)}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography sx={{ fontWeight: 600 }}>Shipping</Typography>
              <Typography sx={{ fontWeight: 600, color: 'success.main' }}>Free</Typography>
            </Box>

            <Divider sx={{ my: 2, borderColor: 'rgba(124,58,237,0.2)' }} />

            <Box display="flex" justifyContent="space-between" mb={4}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>{formatINR(cartTotal)}</Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/checkout')}
              disabled={cartCount === 0}
              sx={{
                borderRadius: 3,
                py: 2,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
              }}
            >
              Proceed to Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;
