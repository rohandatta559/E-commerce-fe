import React, { useEffect, useMemo, useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Alert,
  TextField,
  InputAdornment,
  Container,
  Button,
  Chip,
  Paper,
  Slider,
  FormControlLabel,
  Switch,
  MenuItem,
  Stack,
  Skeleton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ProductCard from './ProductCard';
import API from './axiosInstance';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Link as RouterLink } from 'react-router-dom';
import { useCart } from './contexts/CartContext';

const FALLBACK_CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books'];

const hashString = (value = '') => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRating, setSelectedRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [fullName, setFullName] = useState('User');
  const { cartCount } = useCart();

  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    if (savedName && savedName.trim()) setFullName(savedName.trim());
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await API.get('/products');
        setProducts(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const enrichedProducts = useMemo(() => {
    return products.map((product, index) => {
      const source = product._id || product.name || String(index);
      const hash = hashString(source);
      const category = product.category || FALLBACK_CATEGORIES[hash % FALLBACK_CATEGORIES.length];
      const rating = Number(product.rating ?? (3 + (hash % 20) / 10).toFixed(1));
      const reviewCount = Number(product.reviewCount ?? (15 + (hash % 220)));
      const stock = Number(product.stock ?? (hash % 30));
      return {
        ...product,
        displayCategory: category,
        displayRating: Math.min(5, Math.max(1, rating)),
        reviewCount,
        stock,
      };
    });
  }, [products]);

  const categories = useMemo(() => {
    const unique = [...new Set(enrichedProducts.map((p) => p.displayCategory))].sort();
    return ['All', ...unique];
  }, [enrichedProducts]);

  const priceLimits = useMemo(() => {
    if (!enrichedProducts.length) return [0, 1000];
    const prices = enrichedProducts.map((p) => Number(p.price) || 0);
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    return [min, max === min ? min + 100 : max];
  }, [enrichedProducts]);

  useEffect(() => {
    setPriceRange(priceLimits);
  }, [priceLimits]);

  const filteredProducts = useMemo(() => {
    const [minPrice, maxPrice] = priceRange;

    const base = enrichedProducts.filter((product) => {
      const name = (product.name || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      const search = searchTerm.trim().toLowerCase();
      const price = Number(product.price) || 0;

      const matchesSearch = !search || name.includes(search) || description.includes(search);
      const matchesCategory = selectedCategory === 'All' || product.displayCategory === selectedCategory;
      const matchesPrice = price >= minPrice && price <= maxPrice;
      const matchesRating = product.displayRating >= selectedRating;
      const matchesStock = !inStockOnly || product.stock > 0;

      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesStock;
    });

    const sorted = [...base];
    sorted.sort((a, b) => {
      if (sortBy === 'price-low-high') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === 'price-high-low') return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sortBy === 'rating-high-low') return b.displayRating - a.displayRating;
      if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      return 0;
    });

    return sorted;
  }, [enrichedProducts, searchTerm, selectedCategory, priceRange, selectedRating, inStockOnly, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedRating(0);
    setInStockOnly(false);
    setSortBy('relevance');
    setPriceRange(priceLimits);
  };

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Paper
        sx={{
          mb: 4,
          p: 4,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.9), rgba(236,72,153,0.9))',
          color: 'common.white',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Discover bright deals for every style
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 620, opacity: 0.92 }}>
          Browse curated collections with vibrant product cards, playful badges, and easy cart access.
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip label="Trending" color="secondary" />
          <Chip label="New Arrivals" color="info" />
          <Chip label="Free Shipping" color="success" />
          <Chip label="Top Rated" color="warning" />
        </Box>
      </Paper>

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Welcome, {fullName}
        </Typography>
        <Button variant="contained" color="secondary" startIcon={<ShoppingCart />} component={RouterLink} to="/cart">
          Cart ({cartCount})
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredProducts.length} of {enrichedProducts.length} products
      </Typography>

      {loading ? (
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              xl: 'repeat(4, minmax(0, 1fr))',
            },
          }}
        >
          {Array.from({ length: 8 }).map((_, idx) => (
            <Paper key={idx} sx={{ p: 1.5, borderRadius: 3 }}>
              <Skeleton variant="rounded" height={180} />
              <Skeleton sx={{ mt: 1 }} width="70%" />
              <Skeleton width="45%" />
              <Skeleton variant="rounded" height={34} sx={{ mt: 1 }} />
            </Paper>
          ))}
        </Box>
      ) : filteredProducts.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography variant="h6" color="text.secondary">
            No products matched your filters.
          </Typography>
          <Button sx={{ mt: 1.5 }} onClick={clearFilters}>Reset and try again</Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              xl: 'repeat(4, minmax(0, 1fr))',
            },
          }}
        >
          {filteredProducts.map((product) => (
            <Box key={product._id} sx={{ display: 'flex' }}>
              <ProductCard product={product} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ProductList;
