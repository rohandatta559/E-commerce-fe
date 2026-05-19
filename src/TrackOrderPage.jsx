import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, CircularProgress, Container, Paper, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { getOrderById } from './services/api';

const statusLabel = (status = '') => String(status).replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase());

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const loadOrder = async () => {
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to fetch tracking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadOrder();
    const interval = setInterval(loadOrder, 15000);
    return () => clearInterval(interval);
  }, [orderId]);

  const shipmentTimeline = useMemo(() => {
    const timeline = order?.shipment?.timeline || [];
    return [...timeline].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [order]);

  if (loading) {
    return (
      <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        Track Order
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Order #{orderId?.slice(-8)}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!error && order && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Courier: {order?.shipment?.courier || 'Not assigned'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tracking ID: {order?.shipment?.trackingId || 'Not assigned'}
            </Typography>
            {order?.shipment?.trackingUrl && (
              <Typography variant="body2">
                <a href={order.shipment.trackingUrl} target="_blank" rel="noreferrer">Open courier tracking</a>
              </Typography>
            )}
            <Chip sx={{ width: 'fit-content', mt: 1 }} label={statusLabel(order?.shipment?.status || order?.status || 'placed')} color="primary" />
          </Stack>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Shipment Timeline</Typography>
            {shipmentTimeline.length === 0 ? (
              <Typography color="text.secondary">No shipment events yet.</Typography>
            ) : (
              <Stack spacing={1.2}>
                {shipmentTimeline.map((event, index) => (
                  <Paper key={`${event.status}-${event.timestamp}-${index}`} variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="subtitle2">{statusLabel(event.status)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(event.timestamp).toLocaleString()} • source: {event.source}
                    </Typography>
                    {event.location && (
                      <Typography variant="body2" color="text.secondary">Location: {event.location}</Typography>
                    )}
                    {event.description && (
                      <Typography variant="body2">{event.description}</Typography>
                    )}
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default TrackOrderPage;
