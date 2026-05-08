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
      <Typography variant="h4" gutterBottom>Checkout</Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Shipping Address</Typography>
            <Stack spacing={2}>
              <TextField label="Full Name" value={address.fullName} onChange={handleChange('fullName')} required />
              <TextField label="Phone Number" value={address.phone} onChange={handleChange('phone')} required />
              <TextField label="Address Line" value={address.line1} onChange={handleChange('line1')} required />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="City" value={address.city} onChange={handleChange('city')} required />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="State" value={address.state} onChange={handleChange('state')} required />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Postal Code" value={address.postalCode} onChange={handleChange('postalCode')} required />
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Order Summary</Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Items</Typography>
              <Typography>{cartCount}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Subtotal</Typography>
              <Typography>${cartTotal.toFixed(2)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography>Shipping</Typography>
              <Typography>Free</Typography>
            </Box>
            <Typography variant="h6">Total: ${cartTotal.toFixed(2)}</Typography>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button sx={{ mt: 2 }} fullWidth variant="contained" disabled={isSubmitting || !canSubmit} onClick={handlePlaceOrder}>
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;
