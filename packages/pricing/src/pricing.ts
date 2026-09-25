import { applyPromoCode } from './discounts.ts';

export const GROUP_DISCOUNT_THRESHOLD = 5;
export const GROUP_DISCOUNT_RATE = 0.1;
export const VAT_RATE = 0.19;

export interface OrderInput {
  unitPriceCents: number;
  quantity: number;
  promoCode?: string;
}

/**
 * Subtotal (in cents) for `quantity` tickets at `unitPriceCents`, with the
 * group-rate discount applied once quantity reaches GROUP_DISCOUNT_THRESHOLD.
 */
export function ticketSubtotalCents(unitPriceCents: number, quantity: number): number {
  const raw = unitPriceCents * quantity;
  if (quantity >= GROUP_DISCOUNT_THRESHOLD) {
    return Math.round(raw * (1 - GROUP_DISCOUNT_RATE));
  }
  return raw;
}

/** Adds VAT to an amount (in cents), rounded to the nearest cent. */
export function applyVat(amountCents: number, rate: number = VAT_RATE): number {
  return Math.round(amountCents * (1 + rate));
}

/**
 * Full order total in cents: group-rate discount, then promo code, then VAT.
 */
export function calculateOrderTotalCents({ unitPriceCents, quantity, promoCode }: OrderInput): number {
  if (quantity <= 0) throw new Error('quantity must be a positive integer');
  if (unitPriceCents < 0) throw new Error('unitPriceCents must not be negative');

  const subtotal = ticketSubtotalCents(unitPriceCents, quantity);
  const discounted = applyPromoCode(subtotal, quantity, promoCode);
  return applyVat(discounted);
}
