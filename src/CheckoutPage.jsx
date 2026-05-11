import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Container, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from './contexts/CartContext';
import { createOrder } from './services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const canSubmit = useMemo(() => {
    return (
      cartCount > 0 &&
      address.fullName.trim() &&
      address.phone.trim() &&
      address.line1.trim() &&
      address.city.trim() &&
      address.state.trim() &&
      address.postalCode.trim()
    );
  }, [address, cartCount]);

  const handleChange = (field) => (event) => {
    setAddress((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handlePlaceOrder = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError('');

    try {
      await createOrder({
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        phoneNumber: address.phone,
        shippingAddress: {
          address: address.line1,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: 'India',
          phone: address.phone,
          fullName: address.fullName,
        },
        paymentMethod: 'COD',
      });
      clearCart();
      navigate('/orders');
    } catch (e) {
      setError(e.message || 'Could not place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Checkout
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.92 }}>
          Complete your purchase with secure checkout
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
              border: '1px solid rgba(124,58,237,0.12)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
              Shipping Address
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="Full Name"
                value={address.fullName}
                onChange={handleChange('fullName')}
                required
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: 'primary.main' },
                  },
                }}
              />
              <TextField
                label="Phone Number"
                value={address.phone}
                onChange={handleChange('phone')}
                required
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: 'primary.main' },
                  },
                }}
              />
              <TextField
                label="Address Line"
                value={address.line1}
                onChange={handleChange('line1')}
                required
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: 'primary.main' },
                  },
                }}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="City"
                    value={address.city}
                    onChange={handleChange('city')}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: 'primary.main' },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="State"
                    value={address.state}
                    onChange={handleChange('state')}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: 'primary.main' },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    value={address.postalCode}
                    onChange={handleChange('postalCode')}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: 'primary.main' },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
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
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography sx={{ fontWeight: 600 }}>Items</Typography>
              <Typography sx={{ fontWeight: 600 }}>{cartCount}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography sx={{ fontWeight: 600 }}>Subtotal</Typography>
              <Typography sx={{ fontWeight: 600 }}>${cartTotal.toFixed(2)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography sx={{ fontWeight: 600 }}>Shipping</Typography>
              <Typography sx={{ fontWeight: 600, color: 'success.main' }}>Free</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
              Total: ${cartTotal.toFixed(2)}
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
            <Button
              sx={{
                borderRadius: 3,
                py: 2,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
              }}
              fullWidth
              variant="contained"
              disabled={isSubmitting || !canSubmit}
              onClick={handlePlaceOrder}
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;
