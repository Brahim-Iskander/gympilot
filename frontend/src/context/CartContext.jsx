import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import { Snackbar, Alert } from '@mui/material';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(() => cartService.getCart());
  const [pointsToUse, setPointsToUse] = useState(0);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  // Sync cart when local storage changes or user changes
  const refreshCart = useCallback(() => {
    setItems(cartService.getCart());
  }, []);

  useEffect(() => {
    refreshCart();
    const unsub = cartService.subscribe((updatedItems) => {
      setItems(updatedItems);
    });
    return () => unsub();
  }, [refreshCart, user]);

  const addToCart = useCallback((product, quantity = 1) => {
    const updated = cartService.addToCart(product, quantity);
    setItems(updated);
    setToastMessage(`Added "${product.name}" (${quantity}x) to your cart!`);
    setToastOpen(true);
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    const updated = cartService.updateQuantity(productId, quantity);
    setItems(updated);
  }, []);

  const removeFromCart = useCallback((productId) => {
    const updated = cartService.removeFromCart(productId);
    setItems(updated);
  }, []);

  const clearCart = useCallback(() => {
    cartService.clearCart();
    setItems([]);
    setPointsToUse(0);
  }, []);

  const openCartDrawer = useCallback(() => setCartDrawerOpen(true), []);
  const closeCartDrawer = useCallback(() => setCartDrawerOpen(false), []);

  const totals = useMemo(() => {
    return cartService.getTotals(pointsToUse, user?.points || 0);
  }, [items, pointsToUse, user?.points]);

  const value = useMemo(
    () => ({
      items,
      itemCount: totals.itemCount,
      totals,
      pointsToUse,
      setPointsToUse,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartDrawerOpen,
      openCartDrawer,
      closeCartDrawer,
      refreshCart,
    }),
    [items, totals, pointsToUse, addToCart, updateQuantity, removeFromCart, clearCart, cartDrawerOpen, openCartDrawer, closeCartDrawer, refreshCart]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: '1px solid',
            borderColor: 'primary.main',
            borderRadius: 2,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            fontWeight: 600,
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
