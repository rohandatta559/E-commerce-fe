import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Rating,
  TextField,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, getProducts, submitProductReview } from './services/api';
import { useCart } from './contexts/CartContext';
import ProductCard from './ProductCard';
import { formatINR } from './utils/currency';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [productData, allData] = await Promise.all([getProductById(id), getProducts()]);
        setProduct(productData);
        const all = Array.isArray(allData) ? allData : (allData.products || []);
        setAllProducts(all);
      } catch (e) {
        setError(e.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const reviews = useMemo(() => product?.reviews || [], [product]);

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((p) => p._id !== product._id && p.category === product.category)
      .slice(0, 4);
  }, [allProducts, product]);

  if (loading) {
    return (
      <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return <Alert severity="error">{error || 'Product not found'}</Alert>;
  }

  const handleSubmitReview = async () => {
    setReviewError('');
    try {
      await submitProductReview(product._id, { rating: reviewRating, comment: reviewComment });
      const updated = await getProductById(product._id);
      setProduct(updated);
      setReviewComment('');
    } catch (e) {
      setReviewError(e.message || 'Failed to submit review');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/products')} sx={{ mb: 2 }}>
        Back to products
      </Button>

      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={product.image || 'https://placehold.co/800x600?text=Product'}
              alt={product.name}
              sx={{ width: '100%', height: { xs: 280, md: 420 }, objectFit: 'cover', borderRadius: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={1.5}>
              <Chip label={product.category || 'General'} color="primary" sx={{ width: 'fit-content' }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{product.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={product.rating || 4} precision={0.5} readOnly />
                <Typography color="text.secondary">({product.numReviews || 0} reviews)</Typography>
              </Box>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>{formatINR(product.price)}</Typography>
              <Typography color="text.secondary">{product.description || 'No description available.'}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography><strong>Stock:</strong> {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</Typography>
              <Typography><strong>Brand:</strong> {product.brand || 'N/A'}</Typography>
              <Button
                variant="contained"
                size="large"
                disabled={product.stock <= 0}
                onClick={() => addToCart(product)}
                sx={{ mt: 1, width: 'fit-content' }}
              >
                Add to Cart
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Reviews</Typography>
        <Stack spacing={1.5} sx={{ mb: 3 }}>
          <Rating value={reviewRating} onChange={(_, value) => setReviewRating(value || 1)} />
          <TextField
            label="Write your review"
            multiline
            minRows={3}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
          />
          {reviewError && <Alert severity="error">{reviewError}</Alert>}
          <Button variant="contained" onClick={handleSubmitReview} disabled={!reviewComment.trim()}>
            Submit Review
          </Button>
        </Stack>
        <Stack spacing={2}>
          {reviews.map((review) => (
            <Box key={review._id}>
              <Typography sx={{ fontWeight: 600 }}>{review.name}</Typography>
              <Rating value={review.rating} precision={0.5} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">{review.comment}</Typography>
              <Divider sx={{ mt: 1.5 }} />
            </Box>
          ))}
        </Stack>
      </Paper>

      {similarProducts.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Similar Products</Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))', md: 'repeat(4,minmax(0,1fr))' },
            }}
          >
            {similarProducts.map((item) => (
              <Box key={item._id} sx={{ display: 'flex' }}>
                <ProductCard product={item} />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default ProductDetailsPage;
