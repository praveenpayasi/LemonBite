/**
 * Cart domain types. The cart lives in memory only (no persistence yet).
 */

/** An optional extra attached to a cart line item. */
export interface CartAddOn {
  id: string;
  name: string;
  price: number;
}

/** A single line in the cart. `id` is unique per line, `dishId` points at the menu item. */
export interface CartItem {
  id: string;
  dishId: string;
  title: string;
  basePrice: number;
  image: string;
  quantity: number;
  selectedAddOns: CartAddOn[];
  /** `(basePrice + sum(selectedAddOns)) * quantity`, kept denormalized for rendering. */
  totalPrice: number;
}

/** Derived snapshot of the cart exposed to consumers. */
export interface CartState {
  items: CartItem[];
  totalItemsCount: number;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  /** `subtotal + deliveryFee + serviceFee`, or 0 while the cart is empty. */
  total: number;
}
