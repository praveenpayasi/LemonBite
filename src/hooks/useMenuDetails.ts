import { useCallback, useEffect, useMemo, useState } from 'react';

import { getMenu, peekMenuCache } from '@/repositories/menuRepository';
import { useCart } from '@/context/CartContext';
import type { CartAddOn, MenuItem } from '@/types';

/** Add-ons offered on every dish. Static mock data until the API exposes them. */
export const DISH_ADD_ONS: readonly CartAddOn[] = [
  { id: 'feta', name: 'Feta', price: 1.0 },
  { id: 'parmesan', name: 'Parmesan', price: 1.0 },
  { id: 'dressing', name: 'Dressing', price: 1.0 },
] as const;

export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 99;

export type MenuDetailsStatus = 'loading' | 'ready' | 'not-found' | 'error';

export interface UseMenuDetailsResult {
  status: MenuDetailsStatus;
  dish: MenuItem | null;
  availableAddOns: readonly CartAddOn[];
  quantity: number;
  selectedAddOns: Set<string>;
  /** Base price plus the selected add-ons, for a single unit. */
  unitPrice: number;
  /** `unitPrice * quantity`. */
  totalPrice: number;
  toggleAddOn: (addOnId: string) => void;
  incrementQuantity: () => void;
  decrementQuantity: () => void;
  /** Adds the configured dish to the cart. Returns false when no dish is loaded. */
  handleAddToCart: () => boolean;
}

function findDish(items: MenuItem[], dishId: string): MenuItem | undefined {
  return items.find((item) => item.id === dishId);
}

/**
 * Menu details state: resolves one dish through the repository (cache → SQLite →
 * API) and owns the add-on / quantity configuration plus its pricing.
 */
export function useMenuDetails(dishId: string): UseMenuDetailsResult {
  // Hydrate synchronously from the prepared cache so the screen renders without a flash.
  const cachedDish = useMemo(() => {
    const cache = peekMenuCache();
    return cache ? (findDish(cache, dishId) ?? null) : null;
  }, [dishId]);

  const [dish, setDish] = useState<MenuItem | null>(cachedDish);
  const [status, setStatus] = useState<MenuDetailsStatus>(cachedDish ? 'ready' : 'loading');
  const [quantity, setQuantity] = useState(MIN_QUANTITY);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());

  const { addToCart } = useCart();

  useEffect(() => {
    if (cachedDish) {
      return;
    }
    let active = true;
    (async () => {
      try {
        const items = await getMenu();
        if (!active) {
          return;
        }
        const match = findDish(items, dishId);
        setDish(match ?? null);
        setStatus(match ? 'ready' : 'not-found');
      } catch (error) {
        console.error('Failed to load dish details', error);
        if (active) {
          setStatus('error');
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [cachedDish, dishId]);

  const toggleAddOn = useCallback((addOnId: string) => {
    setSelectedAddOns((current) => {
      const next = new Set(current);
      if (next.has(addOnId)) {
        next.delete(addOnId);
      } else {
        next.add(addOnId);
      }
      return next;
    });
  }, []);

  const incrementQuantity = useCallback(() => {
    setQuantity((current) => Math.min(MAX_QUANTITY, current + 1));
  }, []);

  const decrementQuantity = useCallback(() => {
    setQuantity((current) => Math.max(MIN_QUANTITY, current - 1));
  }, []);

  const chosenAddOns = useMemo(
    () => DISH_ADD_ONS.filter((addOn) => selectedAddOns.has(addOn.id)),
    [selectedAddOns],
  );

  const unitPrice = useMemo(
    () => (dish?.price ?? 0) + chosenAddOns.reduce((sum, addOn) => sum + addOn.price, 0),
    [dish, chosenAddOns],
  );

  const totalPrice = unitPrice * quantity;

  const handleAddToCart = useCallback(() => {
    if (!dish) {
      return false;
    }
    addToCart({
      dishId: dish.id,
      title: dish.title,
      basePrice: dish.price,
      image: dish.image,
      quantity,
      selectedAddOns: chosenAddOns.map((addOn) => ({ ...addOn })),
    });
    return true;
  }, [dish, quantity, chosenAddOns, addToCart]);

  return {
    status,
    dish,
    availableAddOns: DISH_ADD_ONS,
    quantity,
    selectedAddOns,
    unitPrice,
    totalPrice,
    toggleAddOn,
    incrementQuantity,
    decrementQuantity,
    handleAddToCart,
  };
}
