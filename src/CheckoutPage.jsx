import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Container, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from './contexts/CartContext';
import { addAddress, createOrder, getAddresses, validateCoupon } from './services/api';
import { formatINR } from './utils/currency';

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'card', label: 'Credit / Debit Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'netbanking', label: 'Net Banking' },
  { value: 'wallet', label: 'Digital Wallet' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'razorpay', label: 'Razorpay' },
  { value: 'stripe', label: 'Stripe' },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponInfo, setCouponInfo] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    city: '',
    state: '',
    postalCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

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

  const cgst = useMemo(() => Number((cartTotal * 0.18).toFixed(2)), [cartTotal]);
  const sgst = useMemo(() => Number((cartTotal * 0.18).toFixed(2)), [cartTotal]);
  const totalWithTax = useMemo(() => Number((cartTotal + cgst + sgst - Number(couponInfo?.discountAmount || 0)).toFixed(2)), [cartTotal, cgst, sgst, couponInfo]);

  React.useEffect(() => {
    const loadAddresses = async () => {
      try {
        const data = await getAddresses();
        const addresses = data.addresses || [];
        setSavedAddresses(addresses);
        const defaultAddress = addresses.find((item) => item.isDefault);
        if (defaultAddress) {
          setAddress({
            fullName: defaultAddress.fullName || '',
            phone: defaultAddress.phoneNumber || '',
            line1: defaultAddress.line1 || '',
            city: defaultAddress.city || '',
            state: defaultAddress.state || '',
            postalCode: defaultAddress.postalCode || '',
          });
        }
      } catch {
        setSavedAddresses([]);
      }
    };
    loadAddresses();
  }, []);

  const handleChange = (field) => (event) => {
    setAddress((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
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
          variantId: item.variantId || undefined,
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
        paymentMethod: paymentMethod,
        couponCode: couponInfo?.code,
      });
      try {
        if (address.fullName && address.phone && address.line1 && address.city && address.state && address.postalCode) {
          await addAddress({
            label: 'Checkout Address',
            fullName: address.fullName,
            phoneNumber: address.phone,
            line1: address.line1,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: 'India',
            isDefault: savedAddresses.length === 0,
          });
        }
      } catch {}
      clearCart();
      navigate('/orders');
    } catch (e) {
      setError(e.message || 'Could not place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyCoupon = async () => {
    setError('');
    if (!couponCode.trim()) return;
    try {
      const response = await validateCoupon(couponCode.trim(), cartTotal);
      setCouponInfo(response.coupon);
    } catch (e) {
      setCouponInfo(null);
      setError(e.message || 'Invalid coupon');
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
              {savedAddresses.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Saved addresses found: {savedAddresses.length} (default auto-filled)
                </Typography>
              )}
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
              <Typography sx={{ fontWeight: 600 }}>{formatINR(cartTotal)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography sx={{ fontWeight: 600 }}>CGST (18%)</Typography>
              <Typography sx={{ fontWeight: 600 }}>{formatINR(cgst)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography sx={{ fontWeight: 600 }}>SGST (18%)</Typography>
              <Typography sx={{ fontWeight: 600 }}>{formatINR(sgst)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography sx={{ fontWeight: 600 }}>Shipping</Typography>
              <Typography sx={{ fontWeight: 600, color: 'success.main' }}>Free</Typography>
            </Box>
            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <InputLabel id="payment-method-label">Payment Method</InputLabel>
              <Select
                labelId="payment-method-label"
                value={paymentMethod}
                label="Payment Method"
                onChange={handlePaymentMethodChange}
              >
                {PAYMENT_METHODS.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box display="flex" gap={1} mb={2}>
              <TextField size="small" fullWidth label="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
              <Button variant="outlined" onClick={handleApplyCoupon}>Apply</Button>
            </Box>
            {couponInfo && (
              <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>
                Coupon {couponInfo.code} applied: -{formatINR(couponInfo.discountAmount)}
              </Typography>
            )}
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
              Total: {formatINR(totalWithTax)}
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
