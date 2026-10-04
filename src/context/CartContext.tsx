import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { DELIVERY_FEE, SERVICE_FEE } from '@/constants/cart';
import type { CartAddOn, CartItem, CartState, WithChildren } from '@/types';

export interface CartContextValue extends CartState {
  /** Adds a dish, merging into an existing line with the same dish and add-ons. */
  addToCart: (item: Omit<CartItem, 'id' | 'totalPrice'>) => void;
  removeFromCart: (cartItemId: string) => void;
  /** Sets a line item's quantity. A quantity of 0 or less removes the line. */
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  /** Whether the order should include cutlery. Defaults to true. */
  cutleryRequested: boolean;
  setCutleryRequested: (requested: boolean) => void;
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

/** Order-independent signature of an add-on selection, used to match cart lines. */
function addOnSignature(addOns: readonly CartAddOn[]): string {
  return addOns
    .map((addOn) => addOn.id)
    .slice()
    .sort()
    .join('|');
}

/** Two cart entries merge when they share a dish and the exact same add-ons. */
export function isSameCartLine(
  a: Pick<CartItem, 'dishId' | 'selectedAddOns'>,
  b: Pick<CartItem, 'dishId' | 'selectedAddOns'>,
): boolean {
  return a.dishId === b.dishId && addOnSignature(a.selectedAddOns) === addOnSignature(b.selectedAddOns);
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: WithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cutleryRequested, setCutleryRequested] = useState(true);
  // Per-provider counter keeps line ids unique and deterministic for tests.
  const lineCounter = useRef(0);

  const addToCart = useCallback((item: Omit<CartItem, 'id' | 'totalPrice'>) => {
    setItems((current) => {
      const existingIndex = current.findIndex((line) => isSameCartLine(line, item));

      if (existingIndex !== -1) {
        return current.map((line, index) => {
          if (index !== existingIndex) {
            return line;
          }
          const quantity = line.quantity + item.quantity;
          return {
            ...line,
            quantity,
            totalPrice: calculateLineTotal(line.basePrice, line.selectedAddOns, quantity),
          };
        });
      }

      lineCounter.current += 1;
      return [
        ...current,
        {
          ...item,
          id: `${item.dishId}-${lineCounter.current}`,
          totalPrice: calculateLineTotal(item.basePrice, item.selectedAddOns, item.quantity),
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setItems((current) => current.filter((item) => item.id !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    const next = Math.trunc(quantity);
    setItems((current) => {
      if (next <= 0) {
        return current.filter((item) => item.id !== cartItemId);
      }
      return current.map((item) =>
        item.id === cartItemId
          ? {
              ...item,
              quantity: next,
              totalPrice: calculateLineTotal(item.basePrice, item.selectedAddOns, next),
            }
          : item,
      );
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const isEmpty = items.length === 0;

    return {
      items,
      totalItemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      deliveryFee: DELIVERY_FEE,
      serviceFee: SERVICE_FEE,
      total: isEmpty ? 0 : subtotal + DELIVERY_FEE + SERVICE_FEE,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cutleryRequested,
      setCutleryRequested,
    };
  }, [items, cutleryRequested, addToCart, removeFromCart, updateQuantity, clearCart]);

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
