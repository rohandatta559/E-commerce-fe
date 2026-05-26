import React, { useEffect, useState, useMemo } from 'react';
import {
  Alert, Box, CircularProgress, Container, Divider, Stack,
  Typography, Select, MenuItem, FormControl, InputLabel,
  IconButton, Tooltip, Snackbar, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import { API_BASE_URL, getOrders, requestOrderReturn } from './services/api';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { formatINR } from './utils/currency';
import { Link as RouterLink } from 'react-router-dom';
import { keyframes, styled } from '@mui/system';

/* ── Animations ──────────────────────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;

/* ── Styled components ───────────────────────────────────────────────────── */
const PageRoot = styled(Box)({
  minHeight: '100vh',
  background: '#faf8f4',
  paddingBottom: 80,
});

const PageHeader = styled(Box)({
  background: 'linear-gradient(135deg, #1a1208 0%, #2d1f0a 60%, #1a1208 100%)',
  padding: '48px 0 40px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      radial-gradient(ellipse at 15% 60%, rgba(212,167,60,0.15) 0%, transparent 55%),
      radial-gradient(ellipse at 85% 30%, rgba(212,167,60,0.10) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(212,167,60,0.45), transparent)',
  },
});

const StatCard = styled(Box)(({ delay = 0 }) => ({
  background: '#fff',
  borderRadius: 20,
  padding: '24px 28px',
  border: '1px solid rgba(212,167,60,0.15)',
  boxShadow: '0 2px 16px rgba(26,18,8,0.07)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  animation: `${fadeUp} 0.5s ease ${delay}s both`,
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 28px rgba(26,18,8,0.11)',
  },
}));

const StatIconBox = styled(Box)(({ color }) => ({
  width: 52,
  height: 52,
  borderRadius: 14,
  background: color || 'rgba(212,167,60,0.10)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}));

const FilterBar = styled(Box)({
  background: '#fff',
  borderRadius: 16,
  padding: '16px 20px',
  border: '1px solid rgba(212,167,60,0.15)',
  boxShadow: '0 2px 12px rgba(26,18,8,0.06)',
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  flexWrap: 'wrap',
  marginBottom: 24,
});

const GoldSelect = styled(Select)({
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  borderRadius: 10,
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(212,167,60,0.25)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(212,167,60,0.5)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#d4a73c',
    borderWidth: '1.5px',
  },
});

const OrderCard = styled(Box)(({ delay = 0 }) => ({
  background: '#fff',
  borderRadius: 20,
  border: '1px solid rgba(212,167,60,0.12)',
  boxShadow: '0 2px 12px rgba(26,18,8,0.06)',
  overflow: 'hidden',
  animation: `${fadeUp} 0.45s ease ${delay}s both`,
  transition: 'transform 0.22s ease, box-shadow 0.22s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 32px rgba(26,18,8,0.11)',
  },
}));

const OrderCardHeader = styled(Box)({
  background: 'linear-gradient(135deg, #fdf8ee, #faf4e4)',
  padding: '18px 24px',
  borderBottom: '1px solid rgba(212,167,60,0.12)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 8,
});

const OrderCardBody = styled(Box)({
  padding: '20px 24px',
});

const StatusBadge = ({ status }) => {
  const config = {
    Delivered:  { bg: 'rgba(22,163,74,0.1)',   color: '#15803d', border: 'rgba(22,163,74,0.25)',   dot: '#16a34a' },
    Shipped:    { bg: 'rgba(14,165,233,0.1)',   color: '#0369a1', border: 'rgba(14,165,233,0.25)',  dot: '#0ea5e9' },
    Paid:       { bg: 'rgba(212,167,60,0.12)',  color: '#92400e', border: 'rgba(212,167,60,0.3)',   dot: '#d4a73c' },
    Packed:     { bg: 'rgba(139,92,246,0.10)',  color: '#6d28d9', border: 'rgba(139,92,246,0.25)',  dot: '#8b5cf6' },
    Cancelled:  { bg: 'rgba(220,38,38,0.09)',   color: '#b91c1c', border: 'rgba(220,38,38,0.2)',    dot: '#dc2626' },
    Placed:     { bg: 'rgba(100,116,139,0.09)', color: '#475569', border: 'rgba(100,116,139,0.2)',  dot: '#64748b' },
  };
  const c = config[status] || config.Placed;
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.7,
      px: 1.5, py: 0.6,
      borderRadius: 50,
      background: c.bg,
      border: `1px solid ${c.border}`,
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 12,
      fontWeight: 600,
      color: c.color,
      letterSpacing: '0.02em',
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0,
        animation: ['Shipped','Placed','Packed'].includes(status) ? `${pulse} 2s ease infinite` : 'none',
      }} />
      {status}
    </Box>
  );
};

const TimelineEvent = ({ event, isLast }) => (
  <Box sx={{ display: 'flex', gap: 1.5, position: 'relative' }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#d4a73c', mt: 0.4, flexShrink: 0 }} />
      {!isLast && <Box sx={{ width: 1, flex: 1, background: 'rgba(212,167,60,0.2)', mt: 0.5, mb: 0.5 }} />}
    </Box>
    <Box sx={{ pb: isLast ? 0 : 1.5 }}>
      <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 12, color: '#3d2d0e', fontWeight: 500, lineHeight: 1.3 }}>
        {String(event.status || '').replaceAll('_', ' ').replace(/\b\w/g, m => m.toUpperCase())}
        {event.location && <Box component="span" sx={{ color: '#9e8e72', fontWeight: 400 }}> · {event.location}</Box>}
      </Typography>
      <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 11, color: '#9e8e72', mt: 0.2 }}>
        {new Date(event.timestamp).toLocaleString()}
      </Typography>
    </Box>
  </Box>
);

/* ── Main Component ──────────────────────────────────────────────────────── */
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [returnDialog, setReturnDialog] = useState({ open: false, orderId: '' });
  const [returnForm, setReturnForm] = useState({ reasonCode: 'damaged', reasonNote: '', evidenceUrls: '' });
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0, avgOrderValue: 0, deliveredOrders: 0 });

  const normalizeStatus = (order) => {
    const rawStatus = String(order?.status || '').trim().toLowerCase();
    if (rawStatus) return rawStatus;
    if (order?.isDelivered) return 'delivered';
    if (order?.isPaid) return 'paid';
    return 'placed';
  };

  const getDisplayStatus = (order) => {
    const status = normalizeStatus(order);
    const map = { delivered: 'Delivered', paid: 'Paid', packed: 'Packed', shipped: 'Shipped', cancelled: 'Cancelled' };
    return map[status] || 'Placed';
  };

  const formatLabel = (value = '') =>
    String(value).replaceAll('_', ' ').replace(/\b\w/g, m => m.toUpperCase());

  const fetchOrders = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const normalized = await getOrders();
      setOrders(normalized);
      setLastSyncAt(new Date());
      try {
        const statsResponse = await fetch(`${API_BASE_URL}/orders/stats/overview`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          credentials: 'include',
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch {
        if (normalized.length > 0) {
          const totalSpent = normalized.reduce((sum, o) => sum + Number(o.totalPrice ?? o.totalAmount ?? o.total ?? 0), 0);
          setStats({
            totalOrders: normalized.length,
            totalSpent,
            avgOrderValue: totalSpent / normalized.length,
            deliveredOrders: normalized.filter(o => normalizeStatus(o) === 'delivered').length,
          });
        }
      }
    } catch (e) {
      setError(e.message || 'Failed to load orders.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders({ silent: true }), 20000);
    return () => clearInterval(interval);
  }, []);

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];
    if (filterStatus !== 'all') {
      result = result.filter(order => {
        const status = normalizeStatus(order);
        if (filterStatus === 'pending') return ['placed', 'packed'].includes(status);
        return status === filterStatus.toLowerCase();
      });
    }
    const getAmount = o => o.totalPrice ?? o.totalAmount ?? o.total ?? 0;
    if (sortBy === 'date-desc')    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === 'date-asc')     result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortBy === 'amount-desc')  result.sort((a, b) => getAmount(b) - getAmount(a));
    if (sortBy === 'amount-asc')   result.sort((a, b) => getAmount(a) - getAmount(b));
    return result;
  }, [orders, filterStatus, sortBy]);

  const handleDownloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/invoice`, {
        headers: { 'Authorization': `Bearer ${token}` }, credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to download invoice');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); document.body.removeChild(a);
      setSnackbar({ open: true, message: 'Invoice downloaded!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to download invoice', severity: 'error' });
    }
  };

  const handleSendInvoiceEmail = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/send-invoice`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || data?.message || 'Failed to send invoice email');
      if (data?.invoiceDownloadUrl) {
        window.open(data.invoiceDownloadUrl, '_blank', 'noopener,noreferrer');
        setSnackbar({ open: true, message: 'Opened invoice download link', severity: 'info' });
        return;
      }
      setSnackbar({ open: true, message: data?.message || 'Invoice email sent!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to send invoice email', severity: 'error' });
    }
  };

  const submitReturnRequest = async () => {
    try {
      const payload = {
        reasonCode: returnForm.reasonCode,
        reasonNote: returnForm.reasonNote,
        evidenceUrls: returnForm.evidenceUrls.split(',').map(x => x.trim()).filter(Boolean),
      };
      await requestOrderReturn(returnDialog.orderId, payload);
      setSnackbar({ open: true, message: 'Return request submitted', severity: 'success' });
      setReturnDialog({ open: false, orderId: '' });
      setReturnForm({ reasonCode: 'damaged', reasonNote: '', evidenceUrls: '' });
      const refreshed = await getOrders();
      setOrders(refreshed);
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to submit return request', severity: 'error' });
    }
  };

  return (
    <PageRoot>
      {/* ── Page Header ── */}
      <PageHeader>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography sx={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: { xs: '2rem', sm: '2.6rem' },
                fontWeight: 400,
                color: '#faf8f4',
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
              }}>
                Your Orders
              </Typography>
              <Typography sx={{ fontFamily: "'DM Serif Display'", fontStyle: 'italic', fontSize: 15, color: '#d4a73c', mt: 0.6 }}>
                purchases, invoices & delivery updates
              </Typography>
            </Box>
            {lastSyncAt && (
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                background: 'rgba(255,255,255,0.07)', borderRadius: 50,
                px: 2, py: 0.8, border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', animation: `${pulse} 2s ease infinite` }} />
                <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                  Live · {lastSyncAt.toLocaleTimeString()}
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      </PageHeader>

      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {/* ── Stat Cards ── */}
        {!loading && !error && orders.length > 0 && (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2,
            mb: 4,
          }}>
            <StatCard delay={0}>
              <Box>
                <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 12, color: '#9e8e72', fontWeight: 500, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Total Orders
                </Typography>
                <Typography sx={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '2rem', color: '#1a1208', lineHeight: 1 }}>
                  {stats.totalOrders}
                </Typography>
              </Box>
              <StatIconBox color="rgba(212,167,60,0.10)">
                <ShoppingBagIcon sx={{ color: '#d4a73c', fontSize: 24 }} />
              </StatIconBox>
            </StatCard>

            <StatCard delay={0.07}>
              <Box>
                <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 12, color: '#9e8e72', fontWeight: 500, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Total Spent
                </Typography>
                <Typography sx={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '2rem', color: '#1a1208', lineHeight: 1 }}>
                  {formatINR(stats.totalSpent)}
                </Typography>
              </Box>
              <StatIconBox color="rgba(22,163,74,0.09)">
                <TrendingUpIcon sx={{ color: '#16a34a', fontSize: 24 }} />
              </StatIconBox>
            </StatCard>

            <StatCard delay={0.14}>
              <Box>
                <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 12, color: '#9e8e72', fontWeight: 500, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Avg. Order
                </Typography>
                <Typography sx={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '2rem', color: '#1a1208', lineHeight: 1 }}>
                  {formatINR(stats.avgOrderValue)}
                </Typography>
              </Box>
              <StatIconBox color="rgba(14,165,233,0.09)">
                <ReceiptLongIcon sx={{ color: '#0ea5e9', fontSize: 24 }} />
              </StatIconBox>
            </StatCard>

            <StatCard delay={0.21}>
              <Box>
                <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 12, color: '#9e8e72', fontWeight: 500, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Delivered
                </Typography>
                <Typography sx={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '2rem', color: '#1a1208', lineHeight: 1 }}>
                  {stats.deliveredOrders}
                </Typography>
              </Box>
              <StatIconBox color="rgba(139,92,246,0.09)">
                <LocalShippingIcon sx={{ color: '#8b5cf6', fontSize: 24 }} />
              </StatIconBox>
            </StatCard>
          </Box>
        )}

        {/* ── Loading ── */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12, flexDirection: 'column', gap: 2 }}>
            <CircularProgress sx={{ color: '#d4a73c' }} thickness={3} size={44} />
            <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 14, color: '#9e8e72' }}>Loading your orders…</Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ borderRadius: 3, fontFamily: "'DM Sans'" }}>{error}</Alert>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && orders.length === 0 && (
          <Box sx={{
            textAlign: 'center', py: 12,
            animation: `${fadeUp} 0.5s ease both`,
          }}>
            <Box sx={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(212,167,60,0.10)',
              border: '1px solid rgba(212,167,60,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 3,
            }}>
              <ShoppingBagIcon sx={{ fontSize: 36, color: '#d4a73c' }} />
            </Box>
            <Typography sx={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '1.6rem', color: '#1a1208', mb: 1 }}>
              No orders yet
            </Typography>
            <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 14, color: '#9e8e72', mb: 3 }}>
              Your purchase history will appear here
            </Typography>
            <Button
              component={RouterLink}
              to="/products"
              sx={{
                background: 'linear-gradient(135deg, #d4a73c, #b8871e)',
                color: '#fff',
                fontFamily: "'DM Sans'",
                fontWeight: 600,
                borderRadius: 50,
                px: 4, py: 1.2,
                textTransform: 'none',
                boxShadow: '0 4px 16px rgba(212,167,60,0.35)',
              }}
              endIcon={<KeyboardArrowRightIcon />}
            >
              Start Shopping
            </Button>
          </Box>
        )}

        {/* ── Filter Bar ── */}
        {!loading && !error && orders.length > 0 && (
          <FilterBar>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ fontFamily: "'DM Sans'", fontSize: 13, color: '#9e8e72', '&.Mui-focused': { color: '#d4a73c' } }}>
                Filter by Status
              </InputLabel>
              <GoldSelect
                value={filterStatus}
                label="Filter by Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {['all','pending','paid','shipped','delivered','cancelled'].map(v => (
                  <MenuItem key={v} value={v} sx={{ fontFamily: "'DM Sans'", fontSize: 13 }}>
                    {v === 'all' ? 'All Orders' : formatLabel(v)}
                  </MenuItem>
                ))}
              </GoldSelect>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ fontFamily: "'DM Sans'", fontSize: 13, color: '#9e8e72', '&.Mui-focused': { color: '#d4a73c' } }}>
                Sort by
              </InputLabel>
              <GoldSelect
                value={sortBy}
                label="Sort by"
                onChange={(e) => setSortBy(e.target.value)}
              >
                {[
                  ['date-desc','Newest First'],['date-asc','Oldest First'],
                  ['amount-desc','Highest Amount'],['amount-asc','Lowest Amount'],
                ].map(([v, l]) => (
                  <MenuItem key={v} value={v} sx={{ fontFamily: "'DM Sans'", fontSize: 13 }}>{l}</MenuItem>
                ))}
              </GoldSelect>
            </FormControl>

            <Box sx={{ flex: 1 }} />
            <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 13, color: '#9e8e72' }}>
              <Box component="span" sx={{ fontWeight: 600, color: '#3d2d0e' }}>{filteredAndSortedOrders.length}</Box>
              {' '}of{' '}
              <Box component="span" sx={{ fontWeight: 600, color: '#3d2d0e' }}>{orders.length}</Box>
              {' '}orders
            </Typography>
          </FilterBar>
        )}

        {/* ── Order Cards ── */}
        <Stack spacing={2.5}>
          {filteredAndSortedOrders.map((order, idx) => {
            const id = order._id || order.id;
            const total = order.totalPrice ?? order.totalAmount ?? order.total ?? 0;
            const status = getDisplayStatus(order);
            const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
            const createdTime = order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
            const deliveredAt = normalizeStatus(order) === 'delivered' && order.deliveredAt
              ? new Date(order.deliveredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : null;
            const items = order.items || [];
            const shipment = order.shipment || {};
            const shipmentTimeline = Array.isArray(shipment.timeline)
              ? [...shipment.timeline].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              : [];
            const returnRequest = order.returnRequest || {};
            const returnEvents = Array.isArray(returnRequest.events)
              ? [...returnRequest.events].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              : [];
            const latestReturnEvent = returnEvents[0];
            const lastReturnUpdate = latestReturnEvent?.timestamp || returnRequest.decisionAt || returnRequest.requestedAt;
            const hasActiveReturn = returnRequest?.status && returnRequest.status !== 'none';

            return (
              <OrderCard key={id} delay={Math.min(idx * 0.05, 0.3)}>
                {/* Card Header */}
                <OrderCardHeader>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'rgba(212,167,60,0.12)',
                      border: '1px solid rgba(212,167,60,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ReceiptLongIcon sx={{ fontSize: 20, color: '#d4a73c' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 14, color: '#1a1208' }}>
                        Order #{id?.toString().slice(-8).toUpperCase()}
                      </Typography>
                      <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 12, color: '#9e8e72' }}>
                        {createdAt} · {createdTime}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <StatusBadge status={status} />
                    {deliveredAt && (
                      <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 11, color: '#9e8e72' }}>
                        Delivered {deliveredAt}
                      </Typography>
                    )}
                  </Box>
                </OrderCardHeader>

                {/* Card Body */}
                <OrderCardBody>
                  {/* Items */}
                  <Box sx={{ mb: 2 }}>
                    {items.map((item, index) => (
                      <Box key={`${id}-${index}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.6 }}>
                        <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 14, color: '#3d2d0e' }}>
                          {item?.product?.name || item.name || item.productName || 'Product'}
                        </Typography>
                        <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 13, color: '#9e8e72', fontWeight: 500 }}>
                          × {item.quantity || 1}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Divider + Total */}
                  <Box sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    pt: 1.5, borderTop: '1px solid rgba(212,167,60,0.12)', mb: 2,
                  }}>
                    <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 13, color: '#9e8e72' }}>Order Total</Typography>
                    <Typography sx={{
                      fontFamily: "'DM Serif Display', Georgia, serif",
                      fontSize: '1.3rem', color: '#1a1208', letterSpacing: '-0.01em',
                    }}>
                      {formatINR(total)}
                    </Typography>
                  </Box>

                  {/* Shipment Info */}
                  {(shipment.trackingId || shipment.courier || shipment.trackingUrl || shipmentTimeline.length > 0) && (
                    <Box sx={{
                      mb: 2, p: 2, borderRadius: 12,
                      background: '#faf8f4',
                      border: '1px solid rgba(212,167,60,0.15)',
                    }}>
                      <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 700, color: '#5c4a28', mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Shipment
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: shipmentTimeline.length ? 1.5 : 0 }}>
                        {shipment.courier && (
                          <Box>
                            <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 11, color: '#9e8e72' }}>Courier</Typography>
                            <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 13, color: '#3d2d0e', fontWeight: 600 }}>{shipment.courier}</Typography>
                          </Box>
                        )}
                        {shipment.trackingId && (
                          <Box>
                            <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 11, color: '#9e8e72' }}>Tracking ID</Typography>
                            <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 13, color: '#3d2d0e', fontWeight: 600 }}>{shipment.trackingId}</Typography>
                          </Box>
                        )}
                        {shipment.trackingUrl && (
                          <Box>
                            <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 11, color: '#9e8e72' }}>Link</Typography>
                            <Typography component="a" href={shipment.trackingUrl} target="_blank" rel="noreferrer"
                              sx={{ fontFamily: "'DM Sans'", fontSize: 13, color: '#d4a73c', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                              Track Shipment ↗
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      {shipmentTimeline.length > 0 && (
                        <Stack spacing={0}>
                          {shipmentTimeline.slice(0, 4).map((event, ei) => (
                            <TimelineEvent key={ei} event={event} isLast={ei === Math.min(3, shipmentTimeline.length - 1)} />
                          ))}
                        </Stack>
                      )}
                    </Box>
                  )}

                  {/* Return Info */}
                  {hasActiveReturn && (
                    <Box sx={{
                      mb: 2, p: 2, borderRadius: 12,
                      background: 'rgba(245,158,11,0.06)',
                      border: '1px solid rgba(245,158,11,0.2)',
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Return Request
                        </Typography>
                        <Box sx={{
                          px: 1.5, py: 0.4, borderRadius: 50,
                          background: 'rgba(245,158,11,0.15)',
                          border: '1px solid rgba(245,158,11,0.3)',
                          fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 600, color: '#92400e',
                        }}>
                          {formatLabel(returnRequest.status)}
                        </Box>
                      </Box>
                      {lastReturnUpdate && (
                        <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 12, color: '#9e8e72', mb: 0.5 }}>
                          Last update: {new Date(lastReturnUpdate).toLocaleString()}
                        </Typography>
                      )}
                      {returnRequest.decisionNote && (
                        <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 13, color: '#5c4a28', mb: 0.5 }}>
                          Note: {returnRequest.decisionNote}
                        </Typography>
                      )}
                      {returnRequest.refundAmount != null && (
                        <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 13, color: '#5c4a28', fontWeight: 600 }}>
                          Refund: {formatINR(returnRequest.refundAmount)}
                        </Typography>
                      )}
                      {returnEvents.length > 0 && (
                        <Box sx={{ mt: 1.5 }}>
                          <Stack spacing={0}>
                            {returnEvents.map((event, ei) => (
                              <TimelineEvent key={ei} event={event} isLast={ei === returnEvents.length - 1} />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/track/${id}`}
                      variant="outlined"
                      endIcon={<KeyboardArrowRightIcon fontSize="small" />}
                      sx={{
                        fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 600,
                        borderColor: 'rgba(212,167,60,0.3)', color: '#b8871e',
                        borderRadius: 50, textTransform: 'none', px: 2,
                        '&:hover': { borderColor: '#d4a73c', background: 'rgba(212,167,60,0.06)' },
                      }}
                    >
                      Track Order
                    </Button>

                    {normalizeStatus(order) === 'delivered' &&
                      (!order.returnRequest || ['none', 'rejected', 'closed'].includes(order.returnRequest.status)) && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setReturnDialog({ open: true, orderId: id })}
                        sx={{
                          fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 600,
                          borderColor: 'rgba(245,158,11,0.35)', color: '#b45309',
                          borderRadius: 50, textTransform: 'none', px: 2,
                          '&:hover': { borderColor: '#f59e0b', background: 'rgba(245,158,11,0.06)' },
                        }}
                      >
                        Request Return
                      </Button>
                    )}

                    <Box sx={{ flex: 1 }} />

                    <Tooltip title="Download Invoice" placement="top">
                      <IconButton
                        onClick={() => handleDownloadInvoice(id)}
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #d4a73c, #b8871e)',
                          color: '#fff', borderRadius: 10, width: 34, height: 34,
                          '&:hover': { background: 'linear-gradient(135deg, #c89a30, #a77a18)', transform: 'scale(1.08)' },
                          transition: 'all 0.2s',
                        }}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Email Invoice" placement="top">
                      <IconButton
                        onClick={() => handleSendInvoiceEmail(id)}
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #3d2d0e, #5c4a28)',
                          color: '#d4a73c', borderRadius: 10, width: 34, height: 34,
                          '&:hover': { background: 'linear-gradient(135deg, #2d1f0a, #3d2d0e)', transform: 'scale(1.08)' },
                          transition: 'all 0.2s',
                        }}
                      >
                        <EmailIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </OrderCardBody>
              </OrderCard>
            );
          })}
        </Stack>
      </Container>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ borderRadius: 3, fontFamily: "'DM Sans'", fontSize: 13 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ── Return Dialog ── */}
      <Dialog
        open={returnDialog.open}
        onClose={() => setReturnDialog({ open: false, orderId: '' })}
        fullWidth maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4, border: '1px solid rgba(212,167,60,0.15)',
            boxShadow: '0 24px 64px rgba(26,18,8,0.16)',
          },
        }}
      >
        <DialogTitle sx={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: '1.4rem', fontWeight: 400, color: '#1a1208',
          borderBottom: '1px solid rgba(212,167,60,0.15)', pb: 2,
        }}>
          Request Return
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontFamily: "'DM Sans'", fontSize: 13, '&.Mui-focused': { color: '#d4a73c' } }}>
                Reason
              </InputLabel>
              <GoldSelect
                value={returnForm.reasonCode}
                label="Reason"
                onChange={(e) => setReturnForm(p => ({ ...p, reasonCode: e.target.value }))}
              >
                {['damaged','wrong_item','not_as_described','missing_parts','size_issue','quality_issue','other'].map(code => (
                  <MenuItem key={code} value={code} sx={{ fontFamily: "'DM Sans'", fontSize: 13 }}>
                    {formatLabel(code)}
                  </MenuItem>
                ))}
              </GoldSelect>
            </FormControl>

            <TextField
              label="Additional Notes"
              multiline minRows={3}
              value={returnForm.reasonNote}
              onChange={(e) => setReturnForm(p => ({ ...p, reasonNote: e.target.value }))}
              InputProps={{ sx: { fontFamily: "'DM Sans'", fontSize: 14, borderRadius: 2 } }}
              InputLabelProps={{ sx: { fontFamily: "'DM Sans'", fontSize: 13, '&.Mui-focused': { color: '#d4a73c' } } }}
            />

            <TextField
              label="Evidence URLs (comma separated)"
              value={returnForm.evidenceUrls}
              onChange={(e) => setReturnForm(p => ({ ...p, evidenceUrls: e.target.value }))}
              InputProps={{ sx: { fontFamily: "'DM Sans'", fontSize: 14, borderRadius: 2 } }}
              InputLabelProps={{ sx: { fontFamily: "'DM Sans'", fontSize: 13, '&.Mui-focused': { color: '#d4a73c' } } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setReturnDialog({ open: false, orderId: '' })}
            sx={{
              fontFamily: "'DM Sans'", textTransform: 'none', color: '#9e8e72',
              borderRadius: 50, px: 3,
              '&:hover': { background: 'rgba(212,167,60,0.06)' },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={submitReturnRequest}
            sx={{
              fontFamily: "'DM Sans'", fontWeight: 600, textTransform: 'none',
              background: 'linear-gradient(135deg, #d4a73c, #b8871e)',
              borderRadius: 50, px: 3,
              boxShadow: '0 4px 16px rgba(212,167,60,0.35)',
              '&:hover': { background: 'linear-gradient(135deg, #c89a30, #a77a18)' },
            }}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </PageRoot>
  );
};

export default OrdersPage;