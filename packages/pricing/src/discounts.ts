/**
 * Promo-code discounts. Applied to a subtotal that has already had the
 * group-rate discount applied (see pricing.ts).
 *
 * Promo codes are for individual buyers. Orders above MAX_PROMO_QUANTITY are
 * expected to use the group rate instead, so promo codes stop applying past
 * that size.
 */

const MAX_PROMO_QUANTITY = 4;

const PROMO_CODES: Record<string, number> = {
  EARLY10: 0.1,
  STUDENT15: 0.15,
};

/**
 * Applies a promo code discount to a subtotal (in cents).
 * Unknown/missing codes, and orders larger than MAX_PROMO_QUANTITY, are
 * returned unchanged.
 */
export function applyPromoCode(subtotalCents: number, quantity: number, code?: string): number {
  if (!code) return subtotalCents;
  if (quantity > MAX_PROMO_QUANTITY) return subtotalCents;
  const rate = PROMO_CODES[code.toUpperCase()];
  if (rate === undefined) return subtotalCents;
  return Math.round(subtotalCents * (1 - rate));
}
