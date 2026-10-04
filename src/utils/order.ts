import { ORDER_NUMBER_PREFIX } from '@/constants/cart';

const SEQUENCE_MIN = 1000;
const SEQUENCE_RANGE = 9000;

/**
 * Builds a customer-facing order reference such as `Order #LL-4821`.
 * Client-side only; a real backend would own the sequence.
 */
export function generateOrderNumber(): string {
  const sequence = Math.floor(SEQUENCE_MIN + Math.random() * SEQUENCE_RANGE);
  return `Order #${ORDER_NUMBER_PREFIX}-${sequence}`;
}

/** Formats a minute estimate as a short badge value, e.g. `20 mins`. */
export function formatEstimatedArrival(minutes: number): string {
  return `${minutes} ${minutes === 1 ? 'min' : 'mins'}`;
}
