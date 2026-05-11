import React, { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Container, Divider, Paper, Stack, Typography } from '@mui/material';
import { getOrders } from './services/api';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getOrders();
        const normalized = Array.isArray(data) ? data : (data.orders || []);
        setOrders(normalized);
      } catch (e) {
        setError(e.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
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
          Your Orders
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.92 }}>
          Track your purchases and order history
        </Typography>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
      )}
      {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}
      {!loading && !error && orders.length === 0 && (
        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
            border: '1px solid rgba(124,58,237,0.12)',
          }}
        >
          <Typography color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            You have not placed any orders yet.
          </Typography>
        </Paper>
      )}
      <Stack spacing={3}>
        {orders.map((order) => {
          const id = order._id || order.id;
          const total = order.totalAmount ?? order.total ?? 0;
          const status = order.status || 'Placed';
          const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A';
          const items = order.items || [];
          return (
            <Paper
              key={id}
              sx={{
                p: 4,
                borderRadius: 4,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
                border: '1px solid rgba(124,58,237,0.12)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 20px 40px rgba(124,58,237,0.15)',
                },
              }}
            >
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main' }}>
                  Order #{id?.toString().slice(-8)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {createdAt}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                Status: <span style={{ color: status === 'Delivered' ? '#14b8a6' : status === 'Shipped' ? '#f59e0b' : '#7c3aed', fontWeight: 600 }}>{status}</span>
              </Typography>
              <Divider sx={{ my: 2, borderColor: 'rgba(124,58,237,0.2)' }} />
              {items.map((item, index) => (
                <Typography key={`${id}-${index}`} variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  {item.name || item.productName || 'Product'} x {item.quantity || 1}
                </Typography>
              ))}
              <Typography sx={{ mt: 2, fontSize: '1.1rem' }} fontWeight={700} color="primary.main">
                Total: ${Number(total).toFixed(2)}
              </Typography>
            </Paper>
          );
        })}
      </Stack>
    </Container>
  );
};

export default OrdersPage;
