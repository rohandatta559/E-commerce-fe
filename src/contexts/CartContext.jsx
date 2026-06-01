import { createContext, useContext, useState, useEffect } from 'react';
import { addToCart as addToCartApi, clearCartRemote, getAuthToken, getCart as getCartApi, removeFromCart as removeFromCartApi, updateCartItem as updateCartItemApi } from '../services/api';

const CartContext = createContext();
const buildLineId = (productId, variantId) => `${productId}:${variantId || 'base'}`;

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    const hydrateServerCart = async () => {
      if (!getAuthToken()) return;
      try {
        const serverCart = await getCartApi();
        setCart(serverCart);
      } catch (error) {
        console.error('Failed to load server cart', error);
      }
    };
    const resetToLocal = () => {
      const savedCart = localStorage.getItem('cart');
      setCart(savedCart ? JSON.parse(savedCart) : []);
    };

    hydrateServerCart();
    window.addEventListener('auth:changed', hydrateServerCart);
    window.addEventListener('auth:expired', resetToLocal);
    return () => {
      window.removeEventListener('auth:changed', hydrateServerCart);
      window.removeEventListener('auth:expired', resetToLocal);
    };
  }, []);

  const addToCart = (product, quantity = 1, selectedVariant = null) => {
    const variantId = selectedVariant?._id || null;
    const lineId = buildLineId(product._id, variantId);
    const unitPrice = Number(selectedVariant?.price ?? product.price ?? 0);
    const unitImage = selectedVariant?.image || product.image;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.lineId === lineId);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.lineId === lineId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } 
      return [
        ...prevCart,
        {
          ...product,
          lineId,
          variantId,
          selectedVariant: selectedVariant
            ? {
                _id: selectedVariant._id,
                label: selectedVariant.label,
                sku: selectedVariant.sku,
                size: selectedVariant.size,
                color: selectedVariant.color,
                price: selectedVariant.price,
                image: selectedVariant.image,
              }
            : null,
          image: unitImage,
          price: unitPrice,
          quantity
        }
      ];
    });
    if (getAuthToken()) {
      addToCartApi(product._id, quantity, variantId).then(setCart).catch((error) => {
        console.error('Failed to sync addToCart', error);
      });
    }
  };

  const removeFromCart = (lineId) => {
    const current = cart.find((item) => item.lineId === lineId);
    setCart(prevCart => prevCart.filter(item => item.lineId !== lineId));
    if (getAuthToken() && current) {
      removeFromCartApi(current.productId || current._id, current.variantId || null).then(setCart).catch((error) => {
        console.error('Failed to sync removeFromCart', error);
      });
    }
  };

  const updateQuantity = (lineId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(lineId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.lineId === lineId ? { ...item, quantity: newQuantity } : item
      )
    );
    const current = cart.find((item) => item.lineId === lineId);
    if (getAuthToken() && current) {
      updateCartItemApi(current.productId || current._id, newQuantity, current.variantId || null).then(setCart).catch((error) => {
        console.error('Failed to sync updateQuantity', error);
      });
    }
  };

  const clearCart = () => {
    setCart([]);
    if (getAuthToken()) {
      clearCartRemote().catch((error) => console.error('Failed to sync clearCart', error));
    }
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
