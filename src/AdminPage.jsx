import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Container, MenuItem, Paper, Select, Stack, Typography } from '@mui/material';
import { getAdminAnalytics, getAdminOrders, getAdminUsers, updateAdminOrderStatus } from './services/api';
import { formatINR } from './utils/currency';

const AdminPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const [a, u, o] = await Promise.all([getAdminAnalytics(), getAdminUsers(), getAdminOrders()]);
      setAnalytics(a);
      setUsers(Array.isArray(u) ? u : []);
      setOrders(o.orders || []);
    } catch (e) {
      setError(e.message || 'Failed to load admin data');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (orderId, status) => {
    await updateAdminOrderStatus(orderId, status);
    await load();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Admin Dashboard</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {analytics && (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <Paper sx={{ p: 2, flex: 1 }}><Typography>Total Sales: {formatINR(analytics.totalSales || 0)}</Typography></Paper>
          <Paper sx={{ p: 2, flex: 1 }}><Typography>Monthly Sales: {formatINR(analytics.monthlySales || 0)}</Typography></Paper>
          <Paper sx={{ p: 2, flex: 1 }}><Typography>Total Users: {users.length}</Typography></Paper>
        </Stack>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Users</Typography>
        {users.slice(0, 10).map((user) => (
          <Typography key={user._id} variant="body2">{user.fullName || user.email} ({user.role})</Typography>
        ))}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Orders</Typography>
        <Stack spacing={1.5}>
          {orders.map((order) => (
            <Box key={order._id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2">#{order._id.slice(-8)} - {order.user?.email} - {formatINR(order.totalPrice)}</Typography>
              <Select size="small" value={order.status} onChange={(e) => changeStatus(order._id, e.target.value)}>
                {['placed', 'paid', 'packed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </Box>
          ))}
          {orders.length === 0 && <Typography variant="body2" color="text.secondary">No orders found</Typography>}
        </Stack>
      </Paper>
      <Button sx={{ mt: 2 }} onClick={load}>Refresh</Button>
    </Container>
  );
};

export default AdminPage;
