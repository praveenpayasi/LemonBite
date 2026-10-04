import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import type { CartAddOn, CartItem, CartState, WithChildren } from '@/types';

export interface CartContextValue extends CartState {
  /** Appends a new line item; the id and totalPrice are derived here. */
  addToCart: (item: Omit<CartItem, 'id' | 'totalPrice'>) => void;
  removeFromCart: (cartItemId: string) => void;
  /** Sets a line item's quantity. Values below 1 are clamped to 1. */
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
}

/** `(basePrice + sum(addOns)) * quantity`. Pure, shared by the cart and the details screen. */
export function calculateLineTotal(
  basePrice: number,
  addOns: readonly CartAddOn[],
  quantity: number,
): number {
  const addOnTotal = addOns.reduce((sum, addOn) => sum + addOn.price, 0);
  return (basePrice + addOnTotal) * quantity;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: WithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  // Per-provider counter keeps line ids unique and deterministic for tests.
  const lineCounter = useRef(0);

  const addToCart = useCallback((item: Omit<CartItem, 'id' | 'totalPrice'>) => {
    lineCounter.current += 1;
    const line: CartItem = {
      ...item,
      id: `${item.dishId}-${lineCounter.current}`,
      totalPrice: calculateLineTotal(item.basePrice, item.selectedAddOns, item.quantity),
    };
    setItems((current) => [...current, line]);
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setItems((current) => current.filter((item) => item.id !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    const next = Math.max(1, Math.trunc(quantity));
    setItems((current) =>
      current.map((item) =>
        item.id === cartItemId
          ? {
              ...item,
              quantity: next,
              totalPrice: calculateLineTotal(item.basePrice, item.selectedAddOns, next),
            }
          : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.totalPrice, 0),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [items, addToCart, removeFromCart, updateQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Access the cart. Throws when used outside `<CartProvider>` so misuse fails loudly. */
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider.');
  }
  return context;
}
