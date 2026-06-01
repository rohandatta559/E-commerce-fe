import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Container, Grid, Stack, TextField, Typography } from '@mui/material';
import { addAddress, deleteAddress, getAddresses } from './services/api';

const emptyAddress = {
  label: 'Home',
  fullName: '',
  phoneNumber: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: false,
};

export default function AddressBookPage() {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyAddress);
  const [error, setError] = useState('');

  const loadAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses(data.addresses || []);
    } catch (e) {
      setError(e.message || 'Failed to load addresses');
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await addAddress(form);
      setForm(emptyAddress);
      await loadAddresses();
    } catch (err) {
      setError(err.message || 'Failed to add address');
    }
  };

  const onDelete = async (addressId) => {
    try {
      await deleteAddress(addressId);
      await loadAddresses();
    } catch (err) {
      setError(err.message || 'Failed to delete address');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box
        sx={{
          mb: 3,
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.95))',
          color: 'common.white',
          boxShadow: '0 16px 40px rgba(15,23,42,0.25)',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          Address Book
        </Typography>
        <Typography sx={{ opacity: 0.85 }}>
          Save and manage delivery addresses for faster checkout
        </Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 4,
              border: '1px solid rgba(15,23,42,0.08)',
              boxShadow: '0 12px 28px rgba(15,23,42,0.08)',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Add New Address</Typography>
              <Box component="form" onSubmit={onSubmit}>
                <Stack spacing={1.5}>
                  <TextField size="small" label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
                  <TextField size="small" required label="Full Name *" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                  <TextField size="small" required label="Phone Number *" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
                  <TextField size="small" required label="Address Line 1 *" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
                  <TextField size="small" label="Address Line 2" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={4}>
                      <TextField size="small" fullWidth required label="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField size="small" fullWidth required label="State *" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField size="small" fullWidth required label="Postal Code *" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
                    </Grid>
                  </Grid>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      mt: 1,
                      borderRadius: 999,
                      py: 1.2,
                      fontWeight: 700,
                      background: 'linear-gradient(90deg, #ca8a04, #eab308)',
                      boxShadow: '0 8px 20px rgba(202,138,4,0.35)',
                    }}
                  >
                    Save Address
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            {addresses.map((address) => (
              <Card
                key={address._id}
                sx={{
                  borderRadius: 3,
                  border: '1px solid rgba(15,23,42,0.08)',
                  boxShadow: '0 10px 24px rgba(15,23,42,0.07)',
                }}
              >
                <CardContent sx={{ p: 2.25 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      {address.label}
                    </Typography>
                    {address.isDefault && <Chip size="small" color="success" label="Default" />}
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{address.fullName} • {address.phoneNumber}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} {address.postalCode}
                  </Typography>
                  <Button color="error" size="small" sx={{ mt: 1.25, px: 0.5, fontWeight: 700 }} onClick={() => onDelete(address._id)}>
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
            {addresses.length === 0 && (
              <Card
                sx={{
                  borderRadius: 3,
                  border: '1px dashed rgba(15,23,42,0.22)',
                  boxShadow: 'none',
                }}
              >
                <CardContent>
                  <Typography color="text.secondary">No addresses saved yet.</Typography>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
