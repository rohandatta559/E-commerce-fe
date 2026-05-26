import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { createAdminProduct, deleteAdminProduct, getAdminAnalytics, getAdminLowStock, getAdminOrders, getAdminProducts, getAdminUsers, updateAdminOrderStatus, updateAdminProduct, updateAdminShipmentDetails, updateAdminReturnRequest } from './services/api';
import { formatINR } from './utils/currency';

const STATUS_OPTIONS = ['placed', 'paid', 'packed', 'shipped', 'delivered', 'cancelled'];
const SHIPMENT_STATUS_OPTIONS = ['placed', 'paid', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'exception'];
const RETURN_STATUS_OPTIONS = ['approved', 'rejected', 'picked_up', 'refunded', 'closed'];
const TERMINAL_RETURN_STATUSES = ['rejected', 'refunded', 'closed'];

const AdminPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [error, setError] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [shipmentDrafts, setShipmentDrafts] = useState({});
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    price: 0,
    stock: 0,
    image: '',
    video: '',
    variants: [],
  });

  const load = async () => {
    try {
      setError('');
      const [a, u, o, p, low] = await Promise.all([getAdminAnalytics(), getAdminUsers(), getAdminOrders(), getAdminProducts({ limit: 1000 }), getAdminLowStock()]);
      setAnalytics(a);
      setUsers(Array.isArray(u) ? u : []);
      setOrders(o.orders || []);
      setProducts(p.products || []);
      setLowStock(low.products || a.lowStockProducts || []);
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

  const updateShipmentDraft = (orderId, key, value) => {
    setShipmentDrafts((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {}),
        [key]: value,
      },
    }));
  };

  const saveShipment = async (orderId) => {
    const payload = shipmentDrafts[orderId] || {};
    await updateAdminShipmentDetails(orderId, payload);
    await load();
  };

  const updateReturnStatus = async (orderId, status) => {
    await updateAdminReturnRequest(orderId, { status, decisionNote: `Return ${status} by admin` });
    await load();
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      description: '',
      category: '',
      brand: '',
      price: 0,
      stock: 0,
      image: '',
      video: '',
      variants: [],
    });
    setEditorOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      brand: product.brand || '',
      price: Number(product.price || 0),
      stock: Number(product.stock || 0),
      image: product.image || '',
      video: product.video || '',
      variants: Array.isArray(product.variants) ? product.variants.map((v) => ({ ...v })) : [],
    });
    setEditorOpen(true);
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { label: '', sku: '', size: '', color: '', price: prev.price || 0, stock: 0, image: '' }],
    }));
  };

  const updateVariant = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) => (i === index ? { ...variant, [key]: value } : variant)),
    }));
  };

  const removeVariant = (index) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const saveProduct = async () => {
    try {
      setSaving(true);
      const payload = {
        ...form,
        price: Number(form.price || 0),
        stock: Number(form.stock || 0),
        variants: form.variants.map((variant) => ({
          ...variant,
          price: Number(variant.price || 0),
          stock: Number(variant.stock || 0),
        })),
      };
      if (editingProduct?._id) {
        await updateAdminProduct(editingProduct._id, payload);
      } else {
        await createAdminProduct(payload);
      }
      setEditorOpen(false);
      await load();
    } catch (e) {
      setError(e.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteAdminProduct(productId);
      await load();
    } catch (e) {
      setError(e.message || 'Failed to delete product');
    }
  };

  const topUsers = useMemo(() => users.slice(0, 8), [users]);
  const inventoryValue = useMemo(() => {
    return products.reduce((sum, product) => {
      const basePrice = Number(product?.price || 0);
      const variants = Array.isArray(product?.variants) ? product.variants : [];
      if (variants.length > 0) {
        const variantsValue = variants.reduce((variantSum, variant) => {
          const variantPrice = Number(variant?.price ?? basePrice);
          const variantStock = Number(variant?.stock || 0);
          return variantSum + variantPrice * variantStock;
        }, 0);
        return sum + variantsValue;
      }
      const baseStock = Number(product?.stock || 0);
      return sum + basePrice * baseStock;
    }, 0);
  }, [products]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Admin Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {analytics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card variant="outlined"><CardContent><Typography color="text.secondary">Total Sales</Typography><Typography variant="h5" fontWeight={700}>{formatINR(analytics.totalSales || 0)}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card variant="outlined"><CardContent><Typography color="text.secondary">Monthly Sales</Typography><Typography variant="h5" fontWeight={700}>{formatINR(analytics.monthlySales || 0)}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card variant="outlined"><CardContent><Typography color="text.secondary">AOV</Typography><Typography variant="h5" fontWeight={700}>{formatINR(analytics.averageOrderValue || 0)}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card variant="outlined"><CardContent><Typography color="text.secondary">Total Orders</Typography><Typography variant="h5" fontWeight={700}>{analytics.ordersCount || 0}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card variant="outlined"><CardContent><Typography color="text.secondary">Total Products</Typography><Typography variant="h5" fontWeight={700}>{analytics.totalProducts ?? products.length}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card variant="outlined"><CardContent><Typography color="text.secondary">Inventory Value</Typography><Typography variant="h5" fontWeight={700}>{formatINR(inventoryValue)}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card variant="outlined"><CardContent><Typography color="text.secondary">Total Users</Typography><Typography variant="h5" fontWeight={700}>{users.length}</Typography></CardContent></Card>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Recent Users</Typography>
            <Stack spacing={1}>
              {topUsers.map((user) => (
                <Box key={user._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">{user.fullName || user.email}</Typography>
                  <Chip size="small" label={user.role} color={user.role === 'admin' ? 'secondary' : 'default'} />
                </Box>
              ))}
              {topUsers.length === 0 && <Typography color="text.secondary">No users found</Typography>}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Orders</Typography>
            <Stack spacing={1.5}>
              {orders.map((order) => (
                <Box key={order._id} sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 2, alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>#{order._id.slice(-8)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.user?.email || 'No user'} • {formatINR(order.totalPrice || 0)}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Shipment: {order.shipment?.status || 'placed'} {order.shipment?.trackingId ? `• ${order.shipment.trackingId}` : ''}
                    </Typography>
                    {order.returnRequest?.status && order.returnRequest.status !== 'none' && (
                      <Typography variant="caption" display="block" color="warning.main">
                        Return: {order.returnRequest.status}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={(order.status || 'placed').toLowerCase()}
                        label="Status"
                        onChange={(e) => changeStatus(order._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel>Shipment</InputLabel>
                      <Select
                        value={shipmentDrafts[order._id]?.shipmentStatus ?? order.shipment?.status ?? 'placed'}
                        label="Shipment"
                        onChange={(e) => updateShipmentDraft(order._id, 'shipmentStatus', e.target.value)}
                      >
                        {SHIPMENT_STATUS_OPTIONS.map((status) => (
                          <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      label="Courier"
                      value={shipmentDrafts[order._id]?.courier ?? order.shipment?.courier ?? ''}
                      onChange={(e) => updateShipmentDraft(order._id, 'courier', e.target.value)}
                    />
                    <TextField
                      size="small"
                      label="Tracking ID"
                      value={shipmentDrafts[order._id]?.trackingId ?? order.shipment?.trackingId ?? ''}
                      onChange={(e) => updateShipmentDraft(order._id, 'trackingId', e.target.value)}
                    />
                    <Button size="small" variant="outlined" onClick={() => saveShipment(order._id)}>Save Shipment</Button>
                  </Stack>
                </Box>
              ))}
              {orders.length === 0 && <Typography color="text.secondary">No orders found</Typography>}
            </Stack>
            {orders.map((order) => {
              const webhookEvents = (order.shipment?.timeline || []).filter((event) => event.source === 'webhook');
              if (!webhookEvents.length) return null;
              return (
                <Paper key={`${order._id}-webhook`} variant="outlined" sx={{ p: 1.5, mt: 1 }}>
                  <Typography variant="subtitle2">Webhook Event Log • #{order._id.slice(-8)}</Typography>
                  {webhookEvents.slice(-5).reverse().map((event, idx) => (
                    <Typography key={`${order._id}-event-${idx}`} variant="caption" display="block" color="text.secondary">
                      {new Date(event.timestamp).toLocaleString()} • {event.status} {event.location ? `• ${event.location}` : ''}
                    </Typography>
                  ))}
                </Paper>
              );
            })}
            {orders.map((order) => {
              const hasReturnRequest = order.returnRequest?.status && order.returnRequest.status !== 'none';
              const showReturnActions = hasReturnRequest && !TERMINAL_RETURN_STATUSES.includes(order.returnRequest.status);
              return showReturnActions ? (
                <Box key={`${order._id}-return-actions`} sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Return Request for #{order._id.slice(-8)} • {order.returnRequest.reasonCode}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    {RETURN_STATUS_OPTIONS.map((status) => (
                      <Button key={status} size="small" variant="outlined" onClick={() => updateReturnStatus(order._id, status)}>
                        {status}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              ) : null;
            })}
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Top Products</Typography>
            <Stack spacing={1}>
              {(analytics?.topProducts || []).map((product) => (
                <Box key={product._id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{product.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{product.totalSold} sold</Typography>
                </Box>
              ))}
              {!(analytics?.topProducts || []).length && <Typography color="text.secondary">No data yet</Typography>}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Low Stock Alerts</Typography>
            <Stack spacing={1}>
              {lowStock.slice(0, 10).map((product) => (
                <Box key={product._id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{product.name}</Typography>
                  <Typography variant="caption" color="error.main">
                    {product.stock} / threshold {product.lowStockThreshold}
                  </Typography>
                </Box>
              ))}
              {lowStock.length === 0 && <Typography color="text.secondary">No low-stock products</Typography>}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Products</Typography>
          <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={openCreate}>
            New Product
          </Button>
        </Box>
        <Stack spacing={1.5}>
          {products.map((product) => (
            <Box key={product._id} sx={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 2 }}>
              <Box>
                <Typography variant="body2" fontWeight={600}>{product.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {product.category || 'General'} • {formatINR(product.price || 0)} • Stock: {product.stock || 0} • Variants: {(product.variants || []).length}
                </Typography>
              </Box>
              <Box>
                <IconButton onClick={() => openEdit(product)}><EditOutlinedIcon /></IconButton>
                <IconButton color="error" onClick={() => handleDeleteProduct(product._id)}><DeleteOutlineIcon /></IconButton>
              </Box>
            </Box>
          ))}
          {products.length === 0 && <Typography color="text.secondary">No products found</Typography>}
        </Stack>
      </Paper>

      <Dialog open={editorOpen} onClose={() => setEditorOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Create Product'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} fullWidth />
            <TextField label="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} fullWidth multiline minRows={3} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField label="Category" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} fullWidth /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Brand" value={form.brand} onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))} fullWidth /></Grid>
              <Grid item xs={12} sm={6}><TextField type="number" label="Base Price" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} fullWidth /></Grid>
              <Grid item xs={12} sm={6}><TextField type="number" label="Base Stock" value={form.stock} onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))} fullWidth /></Grid>
              <Grid item xs={12}><TextField label="Primary Image URL" value={form.image} onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))} fullWidth /></Grid>
              <Grid item xs={12}><TextField label="Video URL" value={form.video} onChange={(e) => setForm((prev) => ({ ...prev, video: e.target.value }))} fullWidth /></Grid>
            </Grid>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">Variants</Typography>
                <Button size="small" onClick={addVariant}>Add Variant</Button>
              </Box>
              <Stack spacing={1.5}>
                {form.variants.map((variant, index) => (
                  <Grid container spacing={1} key={`${variant._id || 'new'}-${index}`} alignItems="center">
                    <Grid item xs={12} sm={3}><TextField size="small" label="Label" value={variant.label || ''} onChange={(e) => updateVariant(index, 'label', e.target.value)} fullWidth /></Grid>
                    <Grid item xs={12} sm={2}><TextField size="small" label="Size" value={variant.size || ''} onChange={(e) => updateVariant(index, 'size', e.target.value)} fullWidth /></Grid>
                    <Grid item xs={12} sm={2}><TextField size="small" label="Color" value={variant.color || ''} onChange={(e) => updateVariant(index, 'color', e.target.value)} fullWidth /></Grid>
                    <Grid item xs={12} sm={2}><TextField size="small" type="number" label="Price" value={variant.price || 0} onChange={(e) => updateVariant(index, 'price', e.target.value)} fullWidth /></Grid>
                    <Grid item xs={12} sm={2}><TextField size="small" type="number" label="Stock" value={variant.stock || 0} onChange={(e) => updateVariant(index, 'stock', e.target.value)} fullWidth /></Grid>
                    <Grid item xs={12} sm={1}><IconButton color="error" onClick={() => removeVariant(index)}><DeleteOutlineIcon /></IconButton></Grid>
                  </Grid>
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditorOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={saving} onClick={saveProduct}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPage;
