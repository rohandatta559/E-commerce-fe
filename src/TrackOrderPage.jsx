import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, CircularProgress,
  Alert, Button, TextField, InputAdornment, Tooltip,
} from '@mui/material';
import {
  CheckCircle, RadioButtonUnchecked, LocalShipping,
  Inventory2, ShoppingBag, Home, ContentCopy, OpenInNew,
  SearchRounded, Refresh,
} from '@mui/icons-material';
import { keyframes, styled } from '@mui/system';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { getAuthToken, API_BASE_URL } from './services/api';

/* ── Fonts ────────────────────────────────────────────────────────────────── */
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap';
fontLink.rel = 'stylesheet';
if (!document.head.querySelector('[href*="DM+Serif"]')) document.head.appendChild(fontLink);

/* ── Animations ───────────────────────────────────────────────────────────── */
const fadeUp = keyframes`from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}`;
const pulse  = keyframes`0%,100%{opacity:1}50%{opacity:.45}`;
const spin   = keyframes`from{transform:rotate(0)}to{transform:rotate(360deg)}`;
const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
`;

/* ── Colours ──────────────────────────────────────────────────────────────── */
const GOLD      = '#D4A73C';
const GOLD_PALE = '#FDF8EE';
const GOLD_LINE = '#E8D9A8';
const DARK      = '#1A1208';
const MID       = '#3D2D0E';
const MUTED     = '#9E8E72';
const CREAM     = '#FAF8F4';

/* ── Status config ────────────────────────────────────────────────────────── */
const STATUS_STEPS = ['placed', 'paid', 'packed', 'shipped', 'delivered'];

const STEP_META = {
  placed:    { label: 'Order Placed',    icon: ShoppingBag,     color: '#8B5CF6' },
  paid:      { label: 'Payment Confirmed',icon: CheckCircle,    color: GOLD      },
  packed:    { label: 'Packed',          icon: Inventory2,      color: '#0EA5E9' },
  shipped:   { label: 'Out for Delivery',icon: LocalShipping,   color: '#F59E0B' },
  delivered: { label: 'Delivered',       icon: Home,            color: '#16A34A' },
};

/* ── Styled ───────────────────────────────────────────────────────────────── */
const PageRoot = styled(Box)({ minHeight: '100vh', background: CREAM, paddingBottom: 80 });

const PageHeader = styled(Box)({
  background: `linear-gradient(135deg, ${DARK} 0%, #2D1F0A 60%, ${DARK} 100%)`,
  padding: '48px 0 40px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""', position: 'absolute', inset: 0,
    backgroundImage: `
      radial-gradient(ellipse at 20% 50%, rgba(212,167,60,.18) 0%, transparent 55%),
      radial-gradient(ellipse at 80% 20%, rgba(212,167,60,.10) 0%, transparent 50%)`,
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: 1.5,
    background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
  },
});

const TrackInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 50,
    color: '#fff',
    fontFamily: "'DM Sans',sans-serif",
    '& fieldset': { borderColor: 'rgba(212,167,60,.3)' },
    '&:hover fieldset': { borderColor: 'rgba(212,167,60,.6)' },
    '&.Mui-focused fieldset': { borderColor: GOLD, borderWidth: 1.5 },
  },
  '& input': { color: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: 14 },
  '& input::placeholder': { color: 'rgba(255,255,255,.35)' },
});

const Card = styled(Box)({
  background: '#fff',
  borderRadius: 20,
  border: `1px solid ${GOLD_LINE}`,
  boxShadow: '0 2px 16px rgba(26,18,8,.07)',
  overflow: 'hidden',
  animation: `${fadeUp} .5s ease both`,
});

const CardHead = styled(Box)({
  background: `linear-gradient(135deg, ${GOLD_PALE}, #faf4e0)`,
  padding: '18px 24px',
  borderBottom: `1px solid ${GOLD_LINE}`,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
});

const SkeletonBar = styled(Box)(({ w = '100%', h = 14 }) => ({
  width: w, height: h,
  borderRadius: 8,
  background: `linear-gradient(90deg, #f5f0e8 25%, #ece5d5 50%, #f5f0e8 75%)`,
  backgroundSize: '600px 100%',
  animation: `${shimmer} 1.4s ease infinite`,
}));

/* ── AfterShip helper ─────────────────────────────────────────────────────── */
const AFTERSHIP_KEY = import.meta.env.VITE_AFTERSHIP_API_KEY || '';

const fetchAfterShip = async (trackingNumber, courier) => {
  if (!AFTERSHIP_KEY || !trackingNumber) return null;
  try {
    const slug = courier?.toLowerCase().replace(/\s+/g, '-') || '';
    const url = slug
      ? `https://api.aftership.com/v4/trackings/${slug}/${trackingNumber}`
      : `https://api.aftership.com/v4/trackings/${trackingNumber}`;
    const res = await fetch(url, {
      headers: { 'aftership-api-key': AFTERSHIP_KEY, 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.tracking || null;
  } catch { return null; }
};

const mapAfterShipCheckpoints = (tracking) => {
  if (!tracking?.checkpoints?.length) return [];
  return tracking.checkpoints.map((cp) => ({
    timestamp: cp.checkpoint_time,
    status: cp.message || cp.tag,
    location: cp.location || cp.city || '',
    source: 'aftership',
  }));
};

/* ── Main component ───────────────────────────────────────────────────────── */
const TrackOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder]           = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [inputId, setInputId]       = useState(orderId || '');
  const [copied, setCopied]         = useState(false);
  const [afterShip, setAfterShip]   = useState(null);
  const [asLoading, setAsLoading]   = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchOrder = async (id) => {
    if (!id) return;
    setLoading(true); setError(''); setOrder(null); setAfterShip(null);
    try {
      const token = localStorage.getItem('token') || getAuthToken();
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) throw new Error(res.status === 404 ? 'Order not found.' : 'Failed to fetch order.');
      const data = await res.json();
      const o = data.order || data;
      setOrder(o);
      setLastRefresh(new Date());

      // Try AfterShip if courier + tracking info available
      const ship = o.shipment || {};
      if (ship.trackingId) {
        setAsLoading(true);
        const asData = await fetchAfterShip(ship.trackingId, ship.courier);
        if (asData) setAfterShip(asData);
        setAsLoading(false);
      }
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (orderId) fetchOrder(orderId); }, [orderId]);

  const handleTrack = () => {
    if (!inputId.trim()) return;
    navigate(`/track/${inputId.trim()}`);
  };

  const normalizeStatus = (o) => {
    const s = String(o?.status || '').trim().toLowerCase();
    if (s) return s;
    if (o?.isDelivered) return 'delivered';
    if (o?.isPaid) return 'paid';
    return 'placed';
  };

  const currentStep = order ? STATUS_STEPS.indexOf(normalizeStatus(order)) : -1;

  // Merge self-hosted + AfterShip timeline events
  const allTimeline = (() => {
    const internal = Array.isArray(order?.shipment?.timeline)
      ? order.shipment.timeline.map((e) => ({ ...e, source: 'internal' }))
      : [];
    const external = afterShip ? mapAfterShipCheckpoints(afterShip) : [];
    const merged = [...internal, ...external];
    merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return merged;
  })();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <PageRoot>
      {/* ── Header ── */}
      <PageHeader>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{
            fontFamily: "'DM Serif Display',Georgia,serif",
            fontSize: { xs: '2rem', sm: '2.6rem' },
            color: '#faf8f4', lineHeight: 1.1, mb: 0.6,
          }}>
            Track Your Order
          </Typography>
          <Typography sx={{ fontFamily: "'DM Serif Display'", fontStyle: 'italic', fontSize: 15, color: GOLD, mb: 3 }}>
            real-time delivery updates
          </Typography>

          {/* Search bar */}
          <Box sx={{ display: 'flex', gap: 1.5, maxWidth: 560 }}>
            <TrackInput
              fullWidth size="small"
              placeholder="Enter Order ID…"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded sx={{ color: 'rgba(255,255,255,.4)', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              onClick={handleTrack}
              sx={{
                background: `linear-gradient(135deg, ${GOLD}, #B8871E)`,
                color: '#fff', borderRadius: 50, px: 3,
                fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13,
                textTransform: 'none', whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px rgba(212,167,60,.45)',
                '&:hover': { background: 'linear-gradient(135deg,#C89A30,#A77A18)' },
              }}
            >
              Track
            </Button>
          </Box>

          {lastRefresh && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', animation: `${pulse} 2s ease infinite` }} />
              <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 12, color: 'rgba(255,255,255,.45)' }}>
                Last updated · {lastRefresh.toLocaleTimeString()}
              </Typography>
              <Button size="small" onClick={() => fetchOrder(orderId)}
                sx={{ color: GOLD, fontFamily: "'DM Sans'", fontSize: 11, textTransform: 'none', minWidth: 0, p: '2px 8px' }}
                startIcon={<Refresh sx={{ fontSize: '14px !important' }} />}>
                Refresh
              </Button>
            </Box>
          )}
        </Container>
      </PageHeader>

      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {/* ── Loading ── */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
            <CircularProgress sx={{ color: GOLD }} thickness={3} size={44} />
            <Typography sx={{ fontFamily: "'DM Sans'", color: MUTED, fontSize: 14 }}>Fetching order details…</Typography>
          </Box>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <Alert severity="error" sx={{ borderRadius: 3, fontFamily: "'DM Sans'", mb: 3 }}>{error}</Alert>
        )}

        {/* ── Empty (no order loaded yet) ── */}
        {!loading && !error && !order && !orderId && (
          <Box sx={{ textAlign: 'center', py: 12, animation: `${fadeUp} .5s ease both` }}>
            <Box sx={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(212,167,60,.10)', border: `1px solid rgba(212,167,60,.2)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3,
            }}>
              <LocalShipping sx={{ fontSize: 36, color: GOLD }} />
            </Box>
            <Typography sx={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: '1.6rem', color: DARK, mb: 1 }}>
              Enter an Order ID above
            </Typography>
            <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 14, color: MUTED }}>
              Or visit <Box component="span" sx={{ color: GOLD, fontWeight: 600, cursor: 'pointer' }}
                onClick={() => navigate('/orders')}>Your Orders</Box> to track from there
            </Typography>
          </Box>
        )}

        {/* ── Order found ── */}
        {!loading && order && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' }, gap: 3 }}>

            {/* LEFT — Progress + Timeline */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Progress stepper */}
              <Card>
                <CardHead>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 38, height: 38, borderRadius: 10,
                      background: 'rgba(212,167,60,.14)', border: `1px solid rgba(212,167,60,.25)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <LocalShipping sx={{ fontSize: 20, color: GOLD }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 14, color: DARK }}>
                        Order #{(order._id || order.id)?.toString().slice(-8).toUpperCase()}
                      </Typography>
                      <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 12, color: MUTED }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                      </Typography>
                    </Box>
                  </Box>
                  {/* Status badge */}
                  {(() => {
                    const s = normalizeStatus(order);
                    const meta = STEP_META[s] || STEP_META.placed;
                    return (
                      <Box sx={{
                        display: 'inline-flex', alignItems: 'center', gap: .8,
                        px: 1.5, py: .6, borderRadius: 50,
                        background: `${meta.color}18`,
                        border: `1px solid ${meta.color}44`,
                        fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 600, color: meta.color,
                      }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: meta.color,
                          animation: ['placed','packed','shipped'].includes(s) ? `${pulse} 2s ease infinite` : 'none' }} />
                        {meta.label}
                      </Box>
                    );
                  })()}
                </CardHead>

                {/* Step progress bar */}
                <Box sx={{ p: '28px 24px 24px' }}>
                  {/* Progress line container */}
                  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    {/* Background track */}
                    <Box sx={{
                      position: 'absolute', top: 18, left: '10%', right: '10%', height: 3,
                      background: GOLD_LINE, borderRadius: 99, zIndex: 0,
                    }} />
                    {/* Filled track */}
                    <Box sx={{
                      position: 'absolute', top: 18, left: '10%', height: 3,
                      width: currentStep < 0 ? '0%' : `${(currentStep / (STATUS_STEPS.length - 1)) * 80}%`,
                      background: `linear-gradient(90deg, ${GOLD}, #B8871E)`,
                      borderRadius: 99, zIndex: 1,
                      transition: 'width .8s cubic-bezier(.4,0,.2,1)',
                    }} />

                    {STATUS_STEPS.map((step, idx) => {
                      const meta = STEP_META[step];
                      const Icon = meta.icon;
                      const done    = idx <= currentStep;
                      const active  = idx === currentStep;
                      return (
                        <Box key={step} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: .8, zIndex: 2, flex: 1 }}>
                          <Box sx={{
                            width: 38, height: 38, borderRadius: '50%',
                            background: done ? `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)` : '#fff',
                            border: done ? 'none' : `2px solid ${GOLD_LINE}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: active ? `0 0 0 4px ${meta.color}28` : done ? `0 4px 12px ${meta.color}44` : 'none',
                            transition: 'all .4s ease',
                          }}>
                            <Icon sx={{ fontSize: 18, color: done ? '#fff' : GOLD_LINE }} />
                          </Box>
                          <Typography sx={{
                            fontFamily: "'DM Sans'", fontSize: 10, fontWeight: done ? 700 : 400,
                            color: done ? DARK : MUTED, textAlign: 'center', lineHeight: 1.3,
                            maxWidth: 70,
                          }}>
                            {meta.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Card>

              {/* Timeline events */}
              <Card>
                <CardHead>
                  <Typography sx={{ fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 14, color: DARK }}>
                    Shipment Timeline
                  </Typography>
                  {afterShip && (
                    <Box sx={{
                      px: 1.5, py: .4, borderRadius: 50,
                      background: 'rgba(14,165,233,.1)', border: '1px solid rgba(14,165,233,.3)',
                      fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 600, color: '#0369A1',
                    }}>
                      Live via AfterShip
                    </Box>
                  )}
                  {asLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: .8 }}>
                      <Box sx={{ width: 12, height: 12, border: `2px solid ${GOLD}`, borderTopColor: 'transparent', borderRadius: '50%', animation: `${spin} .8s linear infinite` }} />
                      <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 11, color: MUTED }}>Fetching courier data…</Typography>
                    </Box>
                  )}
                </CardHead>

                <Box sx={{ p: '20px 24px' }}>
                  {allTimeline.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 13, color: MUTED }}>
                        No detailed timeline yet. Check back once your order is shipped.
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      {allTimeline.map((event, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 2, position: 'relative' }}>
                          {/* Dot + line */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                            <Box sx={{
                              width: i === 0 ? 10 : 8, height: i === 0 ? 10 : 8,
                              borderRadius: '50%',
                              background: i === 0 ? GOLD : GOLD_LINE,
                              border: i === 0 ? `2px solid #B8871E` : 'none',
                              mt: .6, flexShrink: 0,
                              boxShadow: i === 0 ? `0 0 0 3px rgba(212,167,60,.2)` : 'none',
                            }} />
                            {i < allTimeline.length - 1 && (
                              <Box sx={{ width: 1.5, flex: 1, background: GOLD_LINE, mt: .5, mb: .5, minHeight: 20 }} />
                            )}
                          </Box>
                          {/* Content */}
                          <Box sx={{ pb: i < allTimeline.length - 1 ? 2 : 0 }}>
                            <Typography sx={{
                              fontFamily: "'DM Sans'", fontSize: 13,
                              fontWeight: i === 0 ? 700 : 500,
                              color: i === 0 ? DARK : MID, lineHeight: 1.3,
                            }}>
                              {String(event.status || '').replaceAll('_', ' ').replace(/\b\w/g, m => m.toUpperCase())}
                              {event.location && (
                                <Box component="span" sx={{ fontWeight: 400, color: MUTED }}> · {event.location}</Box>
                              )}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: .3 }}>
                              <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 11, color: MUTED }}>
                                {new Date(event.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                              {event.source === 'aftership' && (
                                <Box sx={{
                                  px: 1, py: .2, borderRadius: 50,
                                  background: 'rgba(14,165,233,.08)',
                                  fontFamily: "'DM Sans'", fontSize: 9, fontWeight: 600, color: '#0369A1',
                                }}>AfterShip</Box>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Card>
            </Box>

            {/* RIGHT — Order details */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Shipment info */}
              {order.shipment?.trackingId && (
                <Card sx={{ animationDelay: '.1s' }}>
                  <CardHead>
                    <Typography sx={{ fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 14, color: DARK }}>
                      Courier Details
                    </Typography>
                  </CardHead>
                  <Box sx={{ p: '16px 20px', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {[
                      ['Courier',     order.shipment.courier],
                      ['Tracking ID', order.shipment.trackingId],
                      ['ETA',         order.shipment.estimatedDelivery
                        ? new Date(order.shipment.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
                        : null],
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 12, color: MUTED }}>{label}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: .5 }}>
                          <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 13, fontWeight: 600, color: MID }}>{value}</Typography>
                          {label === 'Tracking ID' && (
                            <Tooltip title={copied ? 'Copied!' : 'Copy'} placement="top">
                              <ContentCopy onClick={() => copyToClipboard(value)}
                                sx={{ fontSize: 13, color: MUTED, cursor: 'pointer', '&:hover': { color: GOLD } }} />
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    ))}
                    {order.shipment.trackingUrl && (
                      <Button
                        href={order.shipment.trackingUrl} target="_blank" rel="noreferrer"
                        endIcon={<OpenInNew fontSize="small" />}
                        sx={{
                          mt: .5, fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 600,
                          color: GOLD, border: `1px solid rgba(212,167,60,.35)`, borderRadius: 50,
                          textTransform: 'none', py: .8,
                          '&:hover': { background: 'rgba(212,167,60,.06)', borderColor: GOLD },
                        }}
                        fullWidth
                      >
                        Track on Courier Website
                      </Button>
                    )}
                  </Box>
                </Card>
              )}

              {/* Order items */}
              <Card sx={{ animationDelay: '.15s' }}>
                <CardHead>
                  <Typography sx={{ fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 14, color: DARK }}>
                    Items in this Order
                  </Typography>
                </CardHead>
                <Box sx={{ p: '16px 20px', display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                  {(order.items || []).map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: .6,
                      borderBottom: i < order.items.length - 1 ? `1px solid ${GOLD_LINE}` : 'none' }}>
                      <Box>
                        <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 13, fontWeight: 600, color: DARK }}>
                          {item?.product?.name || item.name || 'Product'}
                        </Typography>
                        <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 12, color: MUTED }}>
                          Qty: {item.quantity || 1}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 13, fontWeight: 600, color: MID }}>
                        Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                  ))}
                  {/* Total */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                    <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 13, color: MUTED }}>Order Total</Typography>
                    <Typography sx={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: '1.2rem', color: DARK }}>
                      Rs. {Number(order.totalPrice ?? order.totalAmount ?? 0).toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                </Box>
              </Card>

              {/* Delivery address */}
              {order.shippingAddress && (
                <Card sx={{ animationDelay: '.2s' }}>
                  <CardHead>
                    <Typography sx={{ fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 14, color: DARK }}>
                      Delivery Address
                    </Typography>
                  </CardHead>
                  <Box sx={{ p: '16px 20px' }}>
                    <Typography sx={{ fontFamily: "'DM Sans'", fontSize: 13, color: MID, lineHeight: 1.8 }}>
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                      {order.shippingAddress.country || 'India'}
                    </Typography>
                  </Box>
                </Card>
              )}

              {/* Quick actions */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button component={RouterLink} to="/orders" fullWidth
                  sx={{
                    fontFamily: "'DM Sans'", fontWeight: 600, textTransform: 'none',
                    background: `linear-gradient(135deg, ${GOLD}, #B8871E)`,
                    color: '#fff', borderRadius: 50, py: 1.3,
                    boxShadow: '0 4px 16px rgba(212,167,60,.35)',
                    '&:hover': { background: 'linear-gradient(135deg,#C89A30,#A77A18)' },
                  }}>
                  View All Orders
                </Button>
                <Button component={RouterLink} to="/products" fullWidth variant="outlined"
                  sx={{
                    fontFamily: "'DM Sans'", fontWeight: 600, textTransform: 'none',
                    borderColor: 'rgba(212,167,60,.35)', color: '#B8871E', borderRadius: 50, py: 1.3,
                    '&:hover': { borderColor: GOLD, background: 'rgba(212,167,60,.05)' },
                  }}>
                  Continue Shopping
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Container>
    </PageRoot>
  );
};

export default TrackOrderPage;