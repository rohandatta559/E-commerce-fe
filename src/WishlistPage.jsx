import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { addToCart as addToCartApi, getWishlist, removeFromWishlist } from './services/api';
import { useCart } from './contexts/CartContext';
import { formatINR } from './utils/currency';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWishlist = async () => {
    try {
      setError('');
      setLoading(true);
      const data = await getWishlist();
      setWishlist(Array.isArray(data?.wishlist) ? data.wishlist : []);
    } catch (e) {
      setError(e.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const list = useMemo(() => {
    return wishlist
      .map((item) => ({
        wishlistId: item?._id,
        addedAt: item?.addedAt,
        product: item?.product,
      }))
      .filter((item) => item.product?._id);
  }, [wishlist]);

  const handleRemove = async (productId) => {
    await removeFromWishlist(productId);
    await loadWishlist();
  };

  const handleMoveToCart = async (product) => {
    if (Array.isArray(product?.variants) && product.variants.length > 0) {
      navigate(`/products/${product._id}`);
      return;
    }
    addToCart(product, 1, null);
    await addToCartApi(product._id, 1);
    await removeFromWishlist(product._id);
    await loadWishlist();
    navigate('/cart');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        Wishlist
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Saved products you can move to cart anytime.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Typography color="text.secondary">Loading wishlist...</Typography>
      ) : list.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="text.secondary">Your wishlist is empty.</Typography>
          <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/products')}>
            Browse Products
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {list.map(({ product }) => (
            <Paper key={product._id} variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '120px 1fr auto' }, gap: 2, alignItems: 'center' }}>
                <Box
                  component="img"
                  src={product.image || product.images?.[0] || 'https://placehold.co/200x120?text=Product'}
                  alt={product.name}
                  sx={{ width: '100%', maxWidth: 120, height: 80, objectFit: 'cover', borderRadius: 1 }}
                />
                <Box>
                  <Typography fontWeight={700}>{product.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {product.category || 'General'} • {formatINR(product.price || 0)}
                  </Typography>
                  {Array.isArray(product.variants) && product.variants.length > 0 && (
                    <Chip size="small" label="Has variants" color="info" />
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <Button
                    size="small"
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => handleMoveToCart(product)}
                  >
                    Move to Cart
                  </Button>
                  <IconButton color="error" onClick={() => handleRemove(product._id)}>
                    <DeleteOutlineIcon />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default WishlistPage;
