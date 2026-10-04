import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';

import { useCart } from '@/context/CartContext';
import { getMenu, peekMenuCache } from '@/repositories/menuRepository';
import { RECOMMENDED_DISH_LIMIT } from '@/constants/cart';
import { routes } from '@/constants/routes';
import type { CartItem, MenuItem } from '@/types';

export interface UseCartScreenResult {
  items: CartItem[];
  isEmpty: boolean;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  cutleryRequested: boolean;
  toggleCutlery: () => void;
  incrementItem: (cartItemId: string) => void;
  decrementItem: (cartItemId: string) => void;
  removeItem: (cartItemId: string) => void;
  /** Dishes not already in the cart, suggested as an upsell. */
  recommendedDishes: MenuItem[];
  addRecommendedDish: (dish: MenuItem) => void;
  handleCheckout: () => void;
  exploreMenu: () => void;
}

/**
 * Order summary screen state. Reads cart totals from the cart context and
 * sources upsell dishes through the menu repository; owns no storage itself.
 */
export function useCartScreen(): UseCartScreenResult {
  const router = useRouter();
  const {
    items,
    subtotal,
    deliveryFee,
    serviceFee,
    total,
    cutleryRequested,
    setCutleryRequested,
    updateQuantity,
    removeFromCart,
    addToCart,
  } = useCart();

  const [menu, setMenu] = useState<MenuItem[]>(() => peekMenuCache() ?? []);

  useEffect(() => {
    if (menu.length > 0) {
      return;
    }
    let active = true;
    (async () => {
      try {
        const data = await getMenu();
        if (active) {
          setMenu(data);
        }
      } catch (error) {
        // Recommendations are non-essential; the cart still works without them.
        console.error('Failed to load recommended dishes', error);
      }
    })();
    return () => {
      active = false;
    };
  }, [menu.length]);

  const recommendedDishes = useMemo(() => {
    const inCart = new Set(items.map((item) => item.dishId));
    return menu.filter((dish) => !inCart.has(dish.id)).slice(0, RECOMMENDED_DISH_LIMIT);
  }, [menu, items]);

  const toggleCutlery = useCallback(
    () => setCutleryRequested(!cutleryRequested),
    [cutleryRequested, setCutleryRequested],
  );

  const findQuantity = useCallback(
    (cartItemId: string) => items.find((item) => item.id === cartItemId)?.quantity ?? 0,
    [items],
  );

  const incrementItem = useCallback(
    (cartItemId: string) => updateQuantity(cartItemId, findQuantity(cartItemId) + 1),
    [updateQuantity, findQuantity],
  );

  const decrementItem = useCallback(
    (cartItemId: string) => updateQuantity(cartItemId, findQuantity(cartItemId) - 1),
    [updateQuantity, findQuantity],
  );

  const addRecommendedDish = useCallback(
    (dish: MenuItem) =>
      addToCart({
        dishId: dish.id,
        title: dish.title,
        basePrice: dish.price,
        image: dish.image,
        quantity: 1,
        selectedAddOns: [],
      }),
    [addToCart],
  );

  const handleCheckout = useCallback(() => {
    if (items.length === 0) {
      return;
    }
    router.push(routes.orderConfirmation);
  }, [items.length, router]);

  const exploreMenu = useCallback(() => router.replace(routes.menu), [router]);

  return {
    items,
    isEmpty: items.length === 0,
    subtotal,
    deliveryFee,
    serviceFee,
    total,
    cutleryRequested,
    toggleCutlery,
    incrementItem,
    decrementItem,
    removeItem: removeFromCart,
    recommendedDishes,
    addRecommendedDish,
    handleCheckout,
    exploreMenu,
  };
}
