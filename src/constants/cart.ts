/**
 * Fixed order fees. Flat values for now; a pricing service would replace these
 * once the backend owns fee calculation.
 */

/** Flat delivery fee applied to any non-empty order. */
export const DELIVERY_FEE = 2.0;

/** Flat service fee applied to any non-empty order. */
export const SERVICE_FEE = 1.0;

/** How many dishes the cart suggests under "Add More To Your Order!". */
export const RECOMMENDED_DISH_LIMIT = 6;
