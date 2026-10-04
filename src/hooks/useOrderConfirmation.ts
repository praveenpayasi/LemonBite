import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import { useCart } from '@/context/CartContext';
import { DELIVERY_ESTIMATE_MINUTES } from '@/constants/cart';
import { routes } from '@/constants/routes';
import { formatEstimatedArrival, generateOrderNumber } from '@/utils/order';
import type { CartItem } from '@/types';

/** Immutable record of what was ordered, captured before the cart is reset. */
export interface OrderSnapshot {
  items: CartItem[];
  totalItemsCount: number;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  cutleryRequested: boolean;
}

export interface UseOrderConfirmationResult {
  order: OrderSnapshot;
  /** Display reference, e.g. `Order #LL-4821`. */
  orderNumber: string;
  /** Short arrival estimate for the badge, e.g. `20 mins`. */
  estimatedTime: string;
  /** Minutes until arrival, for longer-form copy. */
  estimatedMinutes: number;
  handleTrackOrder: () => void;
  handleBackToHome: () => void;
}

/**
 * Order confirmation state. Snapshots the cart during the first render, then
 * empties it so the order cannot be placed twice; the screen renders the
 * snapshot rather than live cart state.
 */
export function useOrderConfirmation(): UseOrderConfirmationResult {
  const router = useRouter();
  const {
    items,
    totalItemsCount,
    subtotal,
    deliveryFee,
    serviceFee,
    total,
    cutleryRequested,
    clearCart,
  } = useCart();

  const [order] = useState<OrderSnapshot>(() => ({
    items,
    totalItemsCount,
    subtotal,
    deliveryFee,
    serviceFee,
    total,
    cutleryRequested,
  }));
  const [orderNumber] = useState(generateOrderNumber);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const handleTrackOrder = useCallback(() => {
    router.replace(routes.menu);
  }, [router]);

  const handleBackToHome = useCallback(() => {
    clearCart();
    router.replace(routes.menu);
  }, [clearCart, router]);

  return {
    order,
    orderNumber,
    estimatedTime: formatEstimatedArrival(DELIVERY_ESTIMATE_MINUTES),
    estimatedMinutes: DELIVERY_ESTIMATE_MINUTES,
    handleTrackOrder,
    handleBackToHome,
  };
}
