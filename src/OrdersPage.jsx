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
      <Typography variant="h4" gutterBottom>Your Orders</Typography>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && orders.length === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">You have not placed any orders yet.</Typography>
        </Paper>
      )}
      <Stack spacing={2}>
        {orders.map((order) => {
          const id = order._id || order.id;
          const total = order.totalAmount ?? order.total ?? 0;
          const status = order.status || 'Placed';
          const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A';
          const items = order.items || [];
          return (
            <Paper key={id} sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1" fontWeight={700}>Order #{id?.toString().slice(-8)}</Typography>
                <Typography variant="body2" color="text.secondary">{createdAt}</Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>Status: {status}</Typography>
              <Divider sx={{ my: 1.5 }} />
              {items.map((item, index) => (
                <Typography key={`${id}-${index}`} variant="body2" color="text.secondary">
                  {item.name || item.productName || 'Product'} x {item.quantity || 1}
                </Typography>
              ))}
              <Typography sx={{ mt: 1.5 }} fontWeight={600}>Total: ${Number(total).toFixed(2)}</Typography>
            </Paper>
          );
        })}
      </Stack>
    </Container>
  );
};

export default OrdersPage;
