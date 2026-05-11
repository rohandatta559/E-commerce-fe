import React, { useEffect, useState, useMemo } from 'react';
import { Alert, Box, CircularProgress, Container, Divider, Paper, Stack, Typography, Grid, Card, CardContent, Select, MenuItem, FormControl, InputLabel, Button, IconButton, Tooltip, Snackbar } from '@mui/material';
import { API_BASE_URL, getOrders } from './services/api';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import { formatINR } from './utils/currency';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    avgOrderValue: 0,
    deliveredOrders: 0,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getOrders();
        const normalized = Array.isArray(data) ? data : (data.orders || []);
        setOrders(normalized);

        // Try to fetch stats from backend, fallback to client-side calculation
        try {
          const statsResponse = await fetch(`${API_BASE_URL}/orders/stats/overview`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            credentials: 'include'
          });
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStats({
              totalOrders: statsData.totalOrders,
              totalSpent: statsData.totalSpent,
              avgOrderValue: statsData.avgOrderValue,
              deliveredOrders: statsData.deliveredOrders,
            });
          }
        } catch (statsError) {
          // Fallback to client-side calculation
          if (normalized.length > 0) {
            const totalSpent = normalized.reduce((sum, order) => {
              const amount = order.totalPrice ?? order.totalAmount ?? order.total ?? 0;
              return sum + Number(amount);
            }, 0);
            const deliveredCount = normalized.filter(order => order.status === 'Delivered' || order.isDelivered).length;
            
            setStats({
              totalOrders: normalized.length,
              totalSpent: totalSpent,
              avgOrderValue: totalSpent / normalized.length,
              deliveredOrders: deliveredCount,
            });
          }
        }
      } catch (e) {
        setError(e.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // Apply filter
    if (filterStatus !== 'all') {
      result = result.filter(order => {
        const status = order.status || (order.isDelivered ? 'Delivered' : order.isPaid ? 'Paid' : 'Pending');
        return status.toLowerCase().includes(filterStatus.toLowerCase());
      });
    }

    // Apply sort
    if (sortBy === 'date-desc') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'date-asc') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'amount-desc') {
      result.sort((a, b) => {
        const amountA = a.totalAmount ?? a.total ?? 0;
        const amountB = b.totalAmount ?? b.total ?? 0;
        return amountB - amountA;
      });
    } else if (sortBy === 'amount-asc') {
      result.sort((a, b) => {
        const amountA = a.totalAmount ?? a.total ?? 0;
        const amountB = b.totalAmount ?? b.total ?? 0;
        return amountA - amountB;
      });
    }

    return result;
  }, [orders, filterStatus, sortBy]);

  // Action handlers
  const handleDownloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSnackbar({ open: true, message: 'Invoice downloaded successfully!', severity: 'success' });
    } catch (error) {
      console.error('Download invoice error:', error);
      setSnackbar({ open: true, message: 'Failed to download invoice', severity: 'error' });
    }
  };

  const handleSendInvoiceEmail = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/send-invoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || data?.message || 'Failed to send invoice email');
      }

      if (data?.invoiceDownloadUrl) {
        window.open(data.invoiceDownloadUrl, '_blank', 'noopener,noreferrer');
        setSnackbar({ open: true, message: 'Email not configured. Opened invoice download instead.', severity: 'info' });
        return;
      }

      setSnackbar({ open: true, message: data?.message || 'Invoice email sent successfully!', severity: 'success' });
    } catch (error) {
      console.error('Send invoice email error:', error);
      setSnackbar({ open: true, message: 'Failed to send invoice email', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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

      {/* Statistics Dashboard */}
      {!loading && !error && orders.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              borderRadius: 3,
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              color: 'white',
              boxShadow: '0 10px 30px rgba(124,58,237,0.2)',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Orders</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>{stats.totalOrders}</Typography>
                  </Box>
                  <ShoppingBagIcon sx={{ fontSize: 45, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ec4899, #f472b6)',
              color: 'white',
              boxShadow: '0 10px 30px rgba(236,72,153,0.2)',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Spent</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>{formatINR(stats.totalSpent)}</Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 45, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              borderRadius: 3,
              background: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
              color: 'white',
              boxShadow: '0 10px 30px rgba(6,182,212,0.2)',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Avg Order Value</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>{formatINR(stats.avgOrderValue)}</Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 45, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              borderRadius: 3,
              background: 'linear-gradient(135deg, #10b981, #34d399)',
              color: 'white',
              boxShadow: '0 10px 30px rgba(16,185,129,0.2)',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Delivered</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>{stats.deliveredOrders}</Typography>
                  </Box>
                  <LocalShippingIcon sx={{ fontSize: 45, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

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

      {/* Filter and Sort Controls - Always visible when not loading */}
      {!loading && !error && (
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98))',
            border: '2px solid rgba(124,58,237,0.2)',
            mb: 3,
            display: 'flex',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            boxShadow: '0 4px 12px rgba(124,58,237,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, flex: 1, alignItems: { xs: 'stretch', sm: 'flex-end' } }}>
            <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel id="filter-select-label">
                Filter by Status
              </InputLabel>
              <Select
                labelId="filter-select-label"
                id="filter-select"
                value={filterStatus}
                label="Filter by Status"
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: 'primary.main' },
                  },
                }}
              >
                <MenuItem value="all">All Orders</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel id="sort-select-label">
                Sort by
              </InputLabel>
              <Select
                labelId="sort-select-label"
                id="sort-select"
                value={sortBy}
                label="Sort by"
                onChange={(e) => setSortBy(e.target.value)}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: 'primary.main' },
                  },
                }}
              >
                <MenuItem value="date-desc">Newest First</MenuItem>
                <MenuItem value="date-asc">Oldest First</MenuItem>
                <MenuItem value="amount-desc">Highest Amount</MenuItem>
                <MenuItem value="amount-asc">Lowest Amount</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {orders.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', textAlign: { xs: 'center', sm: 'right' } }}>
              Showing {filteredAndSortedOrders.length} of {orders.length} orders
            </Typography>
          )}
        </Paper>
      )}

      <Stack spacing={3}>
        {filteredAndSortedOrders.map((order) => {
          const id = order._id || order.id;
          const total = order.totalPrice ?? order.totalAmount ?? order.total ?? 0;
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
                Total: {formatINR(total)}
              </Typography>

              {/* Action Buttons */}
              <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Tooltip title="Download Invoice">
                  <IconButton
                    onClick={() => handleDownloadInvoice(id)}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      borderRadius: 2,
                    }}
                    size="small"
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Email Invoice">
                  <IconButton
                    onClick={() => handleSendInvoiceEmail(id)}
                    sx={{
                      bgcolor: 'secondary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'secondary.dark' },
                      borderRadius: 2,
                    }}
                    size="small"
                  >
                    <EmailIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          );
        })}
      </Stack>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrdersPage;
