import React, { useEffect, useMemo, useState } from 'react';
import {
  Typography,
  Box,
  Alert,
  TextField,
  Container,
  Button,
  Skeleton,
  Pagination,
  InputAdornment,
  Chip,
} from '@mui/material';
import ProductCard from './ProductCard';
import API from './axiosInstance';
import { Search as SearchIcon, TuneRounded } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useCart } from './contexts/CartContext';
import { addToWishlist, getAuthToken, getWishlist, removeFromWishlist } from './services/api';
import { keyframes, styled } from '@mui/system';

/* ── Google Font ──────────────────────────────────────────────────────────── */
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

/* ── Animations ───────────────────────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmerMove = keyframes`
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

/* ── Constants ────────────────────────────────────────────────────────────── */
const FALLBACK_CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books'];
const ALL_LABEL = 'All';

const hashString = (value = '') => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

/* ── Styled components ────────────────────────────────────────────────────── */
const PageRoot = styled(Box)({
  minHeight: '100vh',
  background: '#faf8f4',
  paddingBottom: 80,
});

const HeroBanner = styled(Box)({
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #1a1208 0%, #2d1f0a 50%, #1a1208 100%)',
  padding: '56px 24px 48px',
  textAlign: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      radial-gradient(ellipse at 20% 50%, rgba(212,167,60,0.18) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 30%, rgba(212,167,60,0.12) 0%, transparent 55%)
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
    background: 'linear-gradient(90deg, transparent, rgba(212,167,60,0.5), transparent)',
  },
});

const GoldDivider = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 12,
  margin: '12px auto 0',
  '& span': {
    width: 40,
    height: 1,
    background: 'linear-gradient(90deg, transparent, #d4a73c)',
    display: 'block',
  },
  '& span:last-child': {
    background: 'linear-gradient(90deg, #d4a73c, transparent)',
  },
});

const SearchBar = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    background: '#fff',
    borderRadius: 50,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    transition: 'box-shadow 0.2s ease',
    '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.12)' },
    '&.Mui-focused': { boxShadow: '0 4px 20px rgba(212,167,60,0.2)' },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(212,167,60,0.25) !important',
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(212,167,60,0.6) !important',
    borderWidth: '1px !important',
  },
  '& input': {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: '#1a1208',
    '&::placeholder': { color: '#9e8e72' },
  },
});

const CategoryPill = styled(Box)(({ active }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '7px 18px',
  borderRadius: 50,
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  fontWeight: active ? 600 : 400,
  letterSpacing: '0.02em',
  transition: 'all 0.2s ease',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  background: active ? 'linear-gradient(135deg, #d4a73c, #b8871e)' : '#fff',
  color: active ? '#fff' : '#5c4a28',
  border: active ? '1px solid transparent' : '1px solid rgba(212,167,60,0.3)',
  boxShadow: active ? '0 4px 16px rgba(212,167,60,0.35)' : '0 1px 4px rgba(0,0,0,0.05)',
  '&:hover': {
    background: active ? 'linear-gradient(135deg, #d4a73c, #b8871e)' : 'rgba(212,167,60,0.08)',
    borderColor: active ? 'transparent' : 'rgba(212,167,60,0.5)',
    transform: 'translateY(-1px)',
    boxShadow: active ? '0 6px 20px rgba(212,167,60,0.4)' : '0 4px 12px rgba(0,0,0,0.08)',
  },
}));

const ProductGrid = styled(Box)({
  display: 'grid',
  gap: 24,
  gridTemplateColumns: 'repeat(1, 1fr)',
  '@media (min-width:600px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
  '@media (min-width:900px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
  '@media (min-width:1536px)': { gridTemplateColumns: 'repeat(4, 1fr)' },
});

const SkeletonCard = styled(Box)({
  background: '#fff',
  borderRadius: 16,
  overflow: 'hidden',
  border: '1px solid rgba(212,167,60,0.1)',
});

const ShimmerSkeleton = styled(Box)({
  borderRadius: 8,
  background: 'linear-gradient(90deg, #f5f0e8 25%, #ece5d5 50%, #f5f0e8 75%)',
  backgroundSize: '400px 100%',
  animation: `${shimmerMove} 1.4s ease infinite`,
});

const StyledPagination = styled(Pagination)({
  '& .MuiPaginationItem-root': {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    color: '#5c4a28',
    borderColor: 'rgba(212,167,60,0.3)',
    '&:hover': { background: 'rgba(212,167,60,0.08)' },
  },
  '& .MuiPaginationItem-root.Mui-selected': {
    background: 'linear-gradient(135deg, #d4a73c, #b8871e)',
    color: '#fff',
    borderColor: 'transparent',
    boxShadow: '0 4px 12px rgba(212,167,60,0.35)',
    '&:hover': { background: 'linear-gradient(135deg, #c89a30, #a77a18)' },
  },
});

/* ── Component ────────────────────────────────────────────────────────────── */
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(ALL_LABEL);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const { cartCount } = useCart();
  const [wishlistProductIds, setWishlistProductIds] = useState(new Set());

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!getAuthToken()) { setWishlistProductIds(new Set()); return; }
      try {
        const data = await getWishlist();
        const ids = new Set((data?.wishlist || []).map((item) => item?.product?._id).filter(Boolean));
        setWishlistProductIds(ids);
      } catch { setWishlistProductIds(new Set()); }
    };
    fetchWishlist();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await API.get('/products', { params: { page, limit: 1000 } });
        const payload = response.data || {};
        const productsList = Array.isArray(payload) ? payload : (payload.products || []);
        setProducts(productsList);
        setPagination(payload.pagination || { total: productsList.length, totalPages: 1 });
        setError(null);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page]);

  const handleWishlistToggle = async (productId, shouldAdd) => {
    if (!productId) return;
    if (shouldAdd) {
      await addToWishlist(productId);
      setWishlistProductIds((prev) => new Set([...prev, productId]));
    } else {
      await removeFromWishlist(productId);
      setWishlistProductIds((prev) => { const next = new Set(prev); next.delete(productId); return next; });
    }
  };

  const enrichedProducts = useMemo(() => products.map((product, index) => {
    const source = product._id || product.name || String(index);
    const hash = hashString(source);
    const category = product.category || FALLBACK_CATEGORIES[hash % FALLBACK_CATEGORIES.length];
    const rating = Number(product.rating ?? (3 + (hash % 20) / 10).toFixed(1));
    const reviewCount = Number(product.reviewCount ?? (15 + (hash % 220)));
    const stock = Number(product.stock ?? (hash % 30));
    return { ...product, displayCategory: category, displayRating: Math.min(5, Math.max(1, rating)), reviewCount, stock };
  }), [products]);

  const categories = useMemo(() => {
    const cats = new Set(enrichedProducts.map((p) => p.displayCategory).filter(Boolean));
    return [ALL_LABEL, ...Array.from(cats).sort()];
  }, [enrichedProducts]);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return enrichedProducts.filter((product) => {
      const matchesSearch = !q ||
        (product.name || '').toLowerCase().includes(q) ||
        (product.description || '').toLowerCase().includes(q) ||
        (product.brand || '').toLowerCase().includes(q);
      const matchesCategory = activeCategory === ALL_LABEL || product.displayCategory === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [enrichedProducts, searchTerm, activeCategory]);

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ fontFamily: "'DM Sans', sans-serif" }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <PageRoot>
      {/* ── Hero Banner ── */}
      <HeroBanner>
        <Typography
          sx={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: { xs: '2rem', sm: '2.8rem', md: '3.4rem' },
            fontWeight: 400,
            color: '#faf8f4',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Curated Collections
        </Typography>
        <Typography
          sx={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontStyle: 'italic',
            fontSize: { xs: '1.1rem', sm: '1.3rem' },
            color: '#d4a73c',
            mt: 1,
            position: 'relative',
            zIndex: 1,
          }}
        >
          for the discerning shopper
        </Typography>
        <GoldDivider>
          <span />
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#d4a73c' }} />
          <span />
        </GoldDivider>

        {/* Search bar in hero */}
        <Box sx={{ maxWidth: 520, mx: 'auto', mt: 4, position: 'relative', zIndex: 1 }}>
          <SearchBar
            fullWidth
            placeholder="Search products, brands…"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setActiveCategory(ALL_LABEL); setPage(1); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9e8e72', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </HeroBanner>

      <Container maxWidth="xl" sx={{ pt: 4 }}>
        {/* ── Category Pills ── */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            overflowX: 'auto',
            pb: 1,
            mb: 3,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {categories.map((cat) => (
            <CategoryPill
              key={cat}
              active={activeCategory === cat ? 1 : 0}
              onClick={() => { setActiveCategory(cat); setPage(1); }}
            >
              {cat}
            </CategoryPill>
          ))}
        </Box>

        {/* ── Results bar ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: '#9e8e72',
              fontWeight: 400,
            }}
          >
            {loading ? 'Loading…' : (
              <>
                <Box component="span" sx={{ fontWeight: 600, color: '#3d2d0e' }}>{filteredProducts.length}</Box>
                {' '}product{filteredProducts.length !== 1 ? 's' : ''} found
                {activeCategory !== ALL_LABEL && (
                  <> in <Box component="span" sx={{ fontWeight: 600, color: '#d4a73c' }}>{activeCategory}</Box></>
                )}
              </>
            )}
          </Typography>

          {(searchTerm || activeCategory !== ALL_LABEL) && (
            <Button
              size="small"
              onClick={() => { setSearchTerm(''); setActiveCategory(ALL_LABEL); }}
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                color: '#d4a73c',
                border: '1px solid rgba(212,167,60,0.4)',
                borderRadius: 50,
                px: 2,
                textTransform: 'none',
                '&:hover': { background: 'rgba(212,167,60,0.06)', borderColor: '#d4a73c' },
              }}
            >
              Clear filters
            </Button>
          )}
        </Box>

        {/* ── Product Grid ── */}
        {loading ? (
          <ProductGrid>
            {Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonCard key={idx} sx={{ animation: `${fadeUp} 0.4s ease ${idx * 0.05}s both` }}>
                <ShimmerSkeleton sx={{ height: 220, borderRadius: 0 }} />
                <Box sx={{ p: 2 }}>
                  <ShimmerSkeleton sx={{ height: 14, width: '65%', mb: 1 }} />
                  <ShimmerSkeleton sx={{ height: 12, width: '45%', mb: 1.5 }} />
                  <ShimmerSkeleton sx={{ height: 36, borderRadius: 50 }} />
                </Box>
              </SkeletonCard>
            ))}
          </ProductGrid>
        ) : filteredProducts.length === 0 ? (
          <Box
            textAlign="center"
            py={10}
            sx={{ animation: `${fadeUp} 0.5s ease both` }}
          >
            <Typography
              sx={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: '1.5rem',
                color: '#9e8e72',
                mb: 1,
              }}
            >
              No products found
            </Typography>
            <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#b8a88a', mb: 3 }}>
              Try adjusting your search or browse all categories
            </Typography>
            <Button
              onClick={() => { setSearchTerm(''); setActiveCategory(ALL_LABEL); }}
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                background: 'linear-gradient(135deg, #d4a73c, #b8871e)',
                color: '#fff',
                borderRadius: 50,
                px: 4,
                py: 1.2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 16px rgba(212,167,60,0.35)',
                '&:hover': { background: 'linear-gradient(135deg, #c89a30, #a77a18)' },
              }}
            >
              Browse all products
            </Button>
          </Box>
        ) : (
          <ProductGrid>
            {filteredProducts.map((product, idx) => (
              <Box
                key={product._id}
                sx={{
                  display: 'flex',
                  animation: `${fadeUp} 0.45s ease ${Math.min(idx * 0.04, 0.4)}s both`,
                }}
              >
                <ProductCard
                  product={product}
                  isWishlisted={wishlistProductIds.has(product._id)}
                  onWishlistToggle={handleWishlistToggle}
                />
              </Box>
            ))}
          </ProductGrid>
        )}

        {/* ── Pagination ── */}
        {!loading && pagination.totalPages > 1 && (
          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
            <StyledPagination
              count={pagination.totalPages}
              page={page}
              onChange={(_, value) => { setPage(value); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              variant="outlined"
              shape="rounded"
            />
          </Box>
        )}
      </Container>
    </PageRoot>
  );
};

export default ProductList;