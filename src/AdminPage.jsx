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
import { createAdminProduct, deleteAdminProduct, getAdminAnalytics, getAdminOrders, getAdminProducts, getAdminUsers, updateAdminOrderStatus, updateAdminProduct } from './services/api';
import { formatINR } from './utils/currency';

const STATUS_OPTIONS = ['placed', 'paid', 'packed', 'shipped', 'delivered', 'cancelled'];

const AdminPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
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
      const [a, u, o, p] = await Promise.all([getAdminAnalytics(), getAdminUsers(), getAdminOrders(), getAdminProducts({ limit: 20 })]);
      setAnalytics(a);
      setUsers(Array.isArray(u) ? u : []);
      setOrders(o.orders || []);
      setProducts(p.products || []);
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Admin Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {analytics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined"><CardContent><Typography color="text.secondary">Total Sales</Typography><Typography variant="h5" fontWeight={700}>{formatINR(analytics.totalSales || 0)}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined"><CardContent><Typography color="text.secondary">Monthly Sales</Typography><Typography variant="h5" fontWeight={700}>{formatINR(analytics.monthlySales || 0)}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={12} md={4}>
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
                  </Box>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
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
                </Box>
              ))}
              {orders.length === 0 && <Typography color="text.secondary">No orders found</Typography>}
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
