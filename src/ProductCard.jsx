import React, { useMemo, useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Box,
  Rating,
  Tooltip,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import { AddShoppingCart, Favorite, FavoriteBorder, LocalShipping } from '@mui/icons-material';
import { useCart } from './contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const price = Number(product.price) || 0;
  const oldPrice = useMemo(() => Number((price * 1.18).toFixed(2)), [price]);
  const isOutOfStock = Number(product.stock) <= 0;
  const isLowStock = Number(product.stock) > 0 && Number(product.stock) <= 5;
  const hasValidImage = typeof product.image === 'string' && product.image.trim().length > 8;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  };

  return (
    <>
      <Card
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          transition: 'transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: theme.shadows[10],
            borderColor: 'primary.light',
          },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => navigate(`/products/${product._id}`)}
      >
        <Box sx={{ position: 'relative' }}>
          {!imageError && hasValidImage ? (
            <CardMedia
              component="img"
              height="220"
              image={product.image}
              alt={product.name}
              onError={() => setImageError(true)}
              sx={{
                objectFit: 'cover',
                opacity: isHovered ? 0.92 : 1,
                transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
                transform: isHovered ? 'scale(1.02)' : 'scale(1)',
              }}
            />
          ) : (
            <Box
              sx={{
                height: 220,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                textAlign: 'center',
                color: 'text.secondary',
                background: 'linear-gradient(135deg, #eff3f8 0%, #e3ebf7 100%)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.disabled' }}>
                {product.displayCategory || 'Product'}
              </Typography>
            </Box>
          )}
          <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 10, left: 10 }}>
            <Chip size="small" color="primary" label={product.displayCategory || 'General'} />
            {isOutOfStock ? (
              <Chip size="small" color="error" label="Out of stock" />
            ) : isLowStock ? (
              <Chip size="small" color="warning" label={`Only ${product.stock} left`} />
            ) : (
              <Chip size="small" color="success" label="In stock" />
            )}
          </Stack>
          <Tooltip title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}>
            <IconButton
              onClick={toggleFavorite}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': { backgroundColor: '#fff' },
              }}
            >
              {isFavorite ? <Favorite color="error" /> : <FavoriteBorder color="action" />}
            </IconButton>
          </Tooltip>
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          <Typography
            gutterBottom
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 700,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '3.6rem',
            }}
          >
            {product.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.2, minHeight: 24 }}>
            <Rating name="read-only" value={product.displayRating || 0} precision={0.5} readOnly size="small" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({product.reviewCount || 0})
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minHeight: '2.8em',
              mb: 1.4,
            }}
          >
            {product.description || 'No description available'}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 1, mt: 'auto' }}>
            <Typography variant="h6" color="primary" fontWeight={800}>
              ${price.toFixed(2)}
            </Typography>
            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>
              ${oldPrice.toFixed(2)}
            </Typography>
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocalShipping sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">Free shipping on eligible orders</Typography>
          </Box>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<AddShoppingCart />}
            onClick={handleAddToCart}
            size={isMobile ? 'small' : 'medium'}
            disabled={isOutOfStock}
            sx={{ textTransform: 'none', fontWeight: 700, py: 1.05 }}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </CardActions>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2200}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {product.name} added to cart
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductCard;
