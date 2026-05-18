import { createContext, useContext, useState, useEffect } from 'react';

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
  };

  const removeFromCart = (lineId) => {
    setCart(prevCart => prevCart.filter(item => item.lineId !== lineId));
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
  };

  const clearCart = () => {
    setCart([]);
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
