import React, { useEffect, useMemo, useState } from 'react';
import {
  Typography,
  Box,
  Alert,
  TextField,
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
  Pagination,
} from '@mui/material';
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
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const { cartCount } = useCart();
  const [hasInitializedPriceRange, setHasInitializedPriceRange] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    if (savedName && savedName.trim()) setFullName(savedName.trim());
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await API.get('/products', {
          params: {
            page,
            limit: 1000,
            category: selectedCategory !== 'All' ? selectedCategory : undefined,
            inStock: inStockOnly ? 'true' : undefined,
          },
        });
        const payload = response.data || {};
        const productsList = Array.isArray(payload) ? payload : (payload.products || []);
        setProducts(productsList);
        setPagination(payload.pagination || {
          total: productsList.length,
          totalPages: 1,
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, inStockOnly, page]);

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
    if (!hasInitializedPriceRange) {
      setPriceRange(priceLimits);
      setHasInitializedPriceRange(true);
    }
  }, [priceLimits, hasInitializedPriceRange]);

  const filteredProducts = useMemo(() => {
    const [minPrice, maxPrice] = priceRange;
    const q = searchTerm.trim().toLowerCase();
    const filtered = enrichedProducts.filter((product) => {
      const name = (product.name || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      const brand = (product.brand || '').toLowerCase();
      const price = Number(product.price) || 0;

      const matchesSearch = !q || name.includes(q) || description.includes(q) || brand.includes(q);
      const matchesPrice = price >= minPrice && price <= maxPrice;
      const matchesRating = product.displayRating >= selectedRating;
      return matchesSearch && matchesPrice && matchesRating;
    });

    const sorted = [...filtered];
    if (sortBy === 'price-low-high') sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    if (sortBy === 'price-high-low') sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    if (sortBy === 'rating-high-low') sorted.sort((a, b) => (b.displayRating || 0) - (a.displayRating || 0));
    if (sortBy === 'newest') sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return sorted;
  }, [enrichedProducts, selectedRating, priceRange, searchTerm, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedRating(0);
    setInStockOnly(false);
    setSortBy('relevance');
    setPriceRange(priceLimits);
    setPage(1);
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

      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: '1.4fr 1fr 1fr' },
              alignItems: 'center',
            }}
          >
            <TextField
              size="small"
              label="Search products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, brand, or description"
            />
            <TextField
              select
              size="small"
              label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Sort by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="relevance">Relevance</MenuItem>
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="price-low-high">Price: Low to High</MenuItem>
              <MenuItem value="price-high-low">Price: High to Low</MenuItem>
              <MenuItem value="rating-high-low">Top Rated</MenuItem>
            </TextField>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' },
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Price Range: {priceRange[0]} - {priceRange[1]}
              </Typography>
              <Slider
                value={priceRange}
                min={priceLimits[0]}
                max={priceLimits[1]}
                onChange={(_, value) => setPriceRange(value)}
                valueLabelDisplay="auto"
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Minimum Rating: {selectedRating.toFixed(1)}+
              </Typography>
              <Slider
                value={selectedRating}
                min={0}
                max={5}
                step={0.5}
                onChange={(_, value) => setSelectedRating(value)}
                valueLabelDisplay="auto"
              />
            </Box>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              <FormControlLabel
                control={<Switch checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />}
                label="In stock"
              />
              <Button variant="outlined" onClick={clearFilters}>Clear</Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredProducts.length} of {pagination.total || filteredProducts.length} products
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
      {!loading && pagination.totalPages > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination count={pagination.totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
        </Box>
      )}
    </Box>
  );
};

export default ProductList;
