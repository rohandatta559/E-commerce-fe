import React, { useState } from 'react';
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
  Alert
} from '@mui/material';
import { AddShoppingCart, Favorite, FavoriteBorder } from '@mui/icons-material';
import { useCart } from './contexts/CartContext';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.shadows[8],
          },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={product.image || 'https://placehold.co/300x200?text=No+Image'}
          alt={product.name}
          sx={{
            objectFit: 'cover',
            opacity: isHovered ? 0.9 : 1,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
        <Tooltip title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}>
          <IconButton
            onClick={toggleFavorite}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            {isFavorite ? (
              <Favorite color="error" />
            ) : (
              <FavoriteBorder color="action" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography gutterBottom variant="h6" component="h3" noWrap>
          {product.name}
        </Typography>
        
        {product.rating && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating
              name="read-only"
              value={product.rating}
              precision={0.5}
              readOnly
              size="small"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({product.reviewCount || 0})
            </Typography>
          </Box>
        )}
        
        <Typography variant="body2" color="text.secondary" paragraph sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minHeight: '2.8em',
          mb: 1
        }}>
          {product.description || 'No description available'}
        </Typography>
        
        <Typography variant="h6" color="primary" fontWeight="bold">
          ${product.price?.toFixed(2) || '0.00'}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<AddShoppingCart />}
          onClick={handleAddToCart}
          size={isMobile ? 'small' : 'medium'}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            py: 1,
          }}
        >
          Add to Cart
        </Button>
      </CardActions>
      </Card>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {product.name} added to cart!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductCard;
